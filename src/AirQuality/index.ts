import fetch from 'node-fetch'
import * as dotenv from 'dotenv'
import * as R from 'ramda'
import * as core from '@actions/core'

// eslint-disable-next-line import/no-unresolved
import { diff, capitalize } from '../utils.js'

dotenv.config()

type NumericValue = { v: number }

type Forecast = {
  max: number
  min: number
  avg: number
  day: string
}

type ForecastData = { daily: { pm25: Forecast[] } }

type AirQualityData = {
  aqi: number
  forecast: ForecastData
  time: { s: string }
  city: {
    geo: [number, number]
  }
  iaqi: { t: NumericValue; h: NumericValue }
}

const {
  AIR_QUALITY_API_URL = 'http://api.waqi.info/feed',
  AIR_QUALITY_API_TOKEN,
  AIR_QUALITY_CITY_LIST,
  PIRATE_WEATHER_API_KEY,
} = process.env

const cityList = AIR_QUALITY_CITY_LIST?.split(',') ?? []

const AQI_LEVELS = [
  { value: 50, label: 'Good', icon: '🟢' },
  { value: 100, label: 'Moderate', icon: '🟡' },
  { value: 150, label: 'Unhealthy for Sensitive', icon: '🟠' },
  { value: 200, label: 'Unhealthy', icon: '🔴' },
  { value: 300, label: 'Very Unhealthy', icon: '🟣' },
  { value: 1000, label: 'Hazardous', icon: '🟤' },
]

type WeatherForecast = {
  time: number
  icon: string
  temperatureHigh: number
  temperatureLow: number
}

type DailyWeatherForecastAlert = {
  title: string
  severity: string
  time: number
  expires: number
  description: string
  url: string
}

type DailyWeatherForecast = {
  message?: string
  daily: {
    icon: string
    data: WeatherForecast[]
  }
  alerts?: DailyWeatherForecastAlert[]
}

const getWeatherIcon = (icon: string): string => {
  if (!icon) return ''

  return (
    {
      rain: '🌧️',
      snow: '❄️',
      sleet: '🌨️',
      fog: '😶‍🌫️',
      wind: '💨',
      cloudy: '☁️',
      'partly-cloudy-day': '🌤️',
    }[icon] ?? '☀️'
  )
}

const DAYS_MAPPING = ['一', '二', '三', '四', '五', '六', '日']

type WeatherForecastResult = {
  weatherForecast: string
  weatherIcon: string
  weatherAlerts: string
}

const getWeatherForecast = async (
  cityGeo: [number, number],
): Promise<WeatherForecastResult> => {
  const url = `https://api.pirateweather.net/forecast/${PIRATE_WEATHER_API_KEY}/${cityGeo.join(
    ',',
  )}?units=ca&exclude=currently,hourly,minutely,flags`

  const result = await fetch(url).then(
    r => r.json() as Promise<DailyWeatherForecast>,
  )

  if (result.message) {
    core.setOutput('weather_forecast_message', result.message)
  }
  if (!result?.daily?.data)
    return { weatherForecast: '', weatherIcon: '', weatherAlerts: '' }

  const weatherForecast = R.map((d: WeatherForecast) => {
    const { icon, time, temperatureLow, temperatureHigh } = d
    const day = DAYS_MAPPING[new Date(time * 1000).getDay()]
    return `${day}${getWeatherIcon(
      icon,
    )} ${temperatureLow.toFixed()}-${temperatureHigh.toFixed()}`
  })(result.daily.data).join('')

  const weatherAlerts = R.pipe(
    R.pluck('title'),
    R.join(';'),
  )(result.alerts ?? [])

  return {
    weatherAlerts,
    weatherForecast: `${weatherForecast}\n${weatherAlerts}`,
    weatherIcon: result.daily.icon,
  }
}

const getPm25Data = (
  aqi: number,
  time: { s: string },
  forecast: ForecastData,
) => {
  const forecastPm25 = forecast.daily.pm25
  const todayDate = time.s.split(' ')[0]
  const todayIndex = R.findIndex(R.propEq(todayDate, 'day'))(forecastPm25)

  const recent = R.pipe(
    R.map((d: Forecast) => d.avg),
    R.mean,
    Math.round,
  )(forecastPm25)

  const todayAqi = forecastPm25[todayIndex]
  const { max, avg } = todayAqi
  const yesterdayAqi = forecastPm25[todayIndex - 1]
  const { max: yMax, avg: yAvg } = yesterdayAqi || {}

  return {
    value: aqi,
    avg,
    max,
    recent,
    forecastPm25: R.drop(2, forecastPm25),
    tomorrow: forecastPm25[todayIndex + 1],
    diffAvg: diff(yAvg, avg),
    diffMax: diff(yMax, max),
  }
}

type CityAirQuality = {
  name: string
  time?: string
  temperature: number
  humidity: number
  value?: number
  avg: number
  max: number
  tomorrow?: { max: number }
  diffAvg?: number
  diffMax?: number
  forecastPm25?: Forecast[]
} & WeatherForecastResult

const getAirQuality = async (cityName: string): Promise<CityAirQuality> => {
  const url = `${AIR_QUALITY_API_URL}/${cityName}/?token=${AIR_QUALITY_API_TOKEN}`
  const result = await fetch(url)
    .then(r => r.json() as Promise<{ data: AirQualityData }>)
    .then(r => r.data)

  if (!result) return {} as CityAirQuality

  const {
    aqi,
    time,
    forecast,
    city,
    iaqi: { t, h },
  } = result

  const weatherForecastResult = await getWeatherForecast(city.geo)

  return {
    avg: 0,
    max: 0,
    ...city,
    ...(time.s && getPm25Data(aqi, time, forecast)),
    name: cityName,
    time: time.s,
    temperature: t.v,
    humidity: h.v,
    ...weatherForecastResult,
  }
}

const setAirQualityLevels = () => {
  const levels = AQI_LEVELS.map(
    ({ value, label, icon }, idx) => `${idx + 1}: ${icon}<${value} ${label}`,
    AQI_LEVELS,
  ).join('<br/>')
  core.setOutput('levels', levels)
}

const getAqiStr = R.ifElse(R.isNil, R.always('N/A'), (aqi: number) => {
  const targetLevel =
    R.find(level => level.value >= aqi, AQI_LEVELS) ?? R.last(AQI_LEVELS)
  return `${targetLevel!.icon}${aqi}`
})

const getCityName = (name: string) =>
  R.pipe(R.split('/'), R.last, R.split('-'), R.head, capitalize)(name)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getForecastPm25Str = (forecastPm25: Forecast[] = []): string => {
  return forecastPm25
    .map(f => {
      return getAqiStr(f.avg)
    })
    .join('')
}

;(async () => {
  const result = await Promise.all(cityList.map(getAirQuality))
  const hasWeatherAlerts = R.pipe(
    R.pluck('weatherAlerts'),
    R.filter(Boolean),
    R.isNotEmpty,
  )(result)

  const subject = R.pipe(
    R.filter<CityAirQuality>(r => !!r.name),
    R.map(r =>
      R.join('', [
        getCityName(r.name),
        getWeatherIcon(r.weatherIcon),
        r.temperature,
        getAqiStr(r.avg),
      ]),
    ),
    R.join(';'),
  )(result)

  core.setOutput('subject', `${hasWeatherAlerts ? '‼️' : ''}${subject}`)

  const sortedResultWithAvg = R.sortWith(
    [
      R.ascend(R.prop('max')),
      R.ascend(R.prop('avg')),
      R.ascend(R.prop('name')),
    ],
    result,
  )

  const headers = ['No', 'City', 'Avg', 'Max', '🌡️', 'Next 7 Days Weather']
    .map(d => `<th>${d}</th>`)
    .join('')

  const defaultTdStyles = ['text-align: center', 'vertical-align: middle']

  const tdStyle = `style="${defaultTdStyles.join(';')};"`

  const tdWeatherStyle = `style="${['width: 50%px'].join(';')};"`

  // <td ${tdStyle}>${getForecastPm25Str(r.forecastPm25)}</td>
  const body = sortedResultWithAvg
    .map(
      (r, idx) => `<tr>
        <td ${tdStyle}>${idx + 1}</td>
        <td ${tdStyle}>${getCityName(r.name)}</td>
        <td ${tdStyle}>${getAqiStr(r.avg)} </td>
        <td ${tdStyle}>${getAqiStr(r.max)} </td>
        <td ${tdStyle}>${Math.round(r.temperature)}°C</td>
        <td ${tdWeatherStyle}>${r.weatherForecast}</td>
      </tr>`,
    )
    .join('')

  const tableContent = `<table border="1">
          <thead>
            <tr>
            ${headers}
            </tr>
          </thead>
          <tbody>
            ${body}
          </tbody>
        </table>
        `

  core.setOutput('content', tableContent)
  setAirQualityLevels()
})()

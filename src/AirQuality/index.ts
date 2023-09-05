import fetch from 'node-fetch'
import * as dotenv from 'dotenv'
import * as R from 'ramda'
import * as core from '@actions/core'

// eslint-disable-next-line import/no-unresolved
import { diff, getDiffStr, capitalize } from '../utils.js'

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
  city: []
  iaqi: { t: NumericValue; h: NumericValue }
}

const {
  AIR_QUALITY_API_URL = 'http://api.waqi.info/feed',
  AIR_QUALITY_API_TOKEN,
  AIR_QUALITY_CITY_LIST,
} = process.env

const cityList = AIR_QUALITY_CITY_LIST?.split(',') ?? []

const AQI_LEVELS = [
  { value: 50, label: 'Good', emoji: '🟢' },
  { value: 100, label: 'Moderate', emoji: '🟡' },
  { value: 150, label: 'Unhealthy for Sensitive', emoji: '🟠' },
  { value: 200, label: 'Unhealthy', emoji: '🔴' },
  { value: 300, label: 'Very Unhealthy', emoji: '🟣' },
  { value: 301, label: 'Hazardous', emoji: '🟤' },
]

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
  const { max, avg } = todayAqi || {}
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
  max?: number
  tomorrow?: { max: number }
  diffAvg?: number
  diffMax?: number
  forecastPm25?: Forecast[]
}

const getAirQuality = async (cityName: string): Promise<CityAirQuality> => {
  const result = await fetch(
    `${AIR_QUALITY_API_URL}/${cityName}/?token=${AIR_QUALITY_API_TOKEN}`,
  )
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

  return {
    avg: 0,
    ...city,
    ...(time.s && getPm25Data(aqi, time, forecast)),
    name: cityName,
    time: time.s,
    temperature: t.v,
    humidity: h.v,
  }
}

const setAirQualityLevels = () => {
  const levels = AQI_LEVELS.map(
    ({ value, label, emoji }, idx) => `${idx + 1}: ${emoji}${value} ${label}`,
    AQI_LEVELS,
  ).join('<br/>')
  core.setOutput('levels', levels)
}

const getAqiStr = (aqi?: number) => {
  if (!aqi) return 'N/A'

  const targetLevel =
    AQI_LEVELS.find(level => level.value >= aqi) ??
    AQI_LEVELS[AQI_LEVELS.length - 1]
  return `${targetLevel.emoji}${aqi}`
}

const getCityName = (name: string) => {
  const lastName = R.last(name.split('/'))
  return capitalize(lastName?.split('-')[0])
}

const getForecastPm25Str = (forecastPm25: Forecast[] = []): string => {
  return forecastPm25
    .map(f => {
      return getAqiStr(f.avg)
    })
    .join(',')
}

;(async () => {
  const result = await Promise.all(cityList.map(getAirQuality))
  const subject = result
    .filter(r => r.name)
    .map(r => `${getCityName(r.name)}${getAqiStr(r.avg)}`)
  core.setOutput('subject', subject.join(';'))

  const sortedResultWithAvg = R.sortWith(
    [R.descend(R.prop('avg')), R.ascend(R.prop('name'))],
    result,
  )

  const headers = [
    'No',
    'City',
    'Now',
    'Avg',
    'Max',
    'Diff Avg',
    'Diff Max',
    '🌡️Temp',
    '💧Humidity',
    'Next 6 Days',
  ]
    .map(d => `<th>${d}</th>`)
    .join('')

  const tdStyle = 'style="text-align: center; vertical-align: middle;"'

  const body = sortedResultWithAvg
    .map(
      (r, idx) => `<tr>
        <td ${tdStyle}>${idx + 1}</td>
        <td ${tdStyle}>${getCityName(r.name)}</td>
        <td ${tdStyle}>${getAqiStr(r.value)} </td>
        <td ${tdStyle}>${getAqiStr(r.avg)} </td>
        <td ${tdStyle}>${getAqiStr(r.max)} </td>
        <td ${tdStyle}>${getDiffStr(r.diffAvg)} </td>
        <td ${tdStyle}>${getDiffStr(r.diffMax)} </td>
        <td ${tdStyle}>${r.temperature}°C</td>
        <td ${tdStyle}>${r.humidity}%</td>
        <td ${tdStyle}>${getForecastPm25Str(r.forecastPm25)}</td>
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

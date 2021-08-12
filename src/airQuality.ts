import fetch from 'node-fetch'
import to from 'await-to-js'
import * as dotenv from 'dotenv'
import * as R from 'ramda'
import * as core from '@actions/core'
import logger from 'loglevel'

dotenv.config()

type Forecast = {
  max: number
  min: number
  avg: number
  day: string
}

const {
  AIR_QUALITY_API_URL = 'http://api.waqi.info/feed',
  AIR_QUALITY_API_TOKEN,
  AIR_QUALITY_CITY_LIST,
} = process.env

const cityList = AIR_QUALITY_CITY_LIST?.split(',') || []

const diff = (oldVal: number, newVal: number) =>
  (((newVal - oldVal) / oldVal) * 100).toFixed(1)

const getDiffStr = (diff: number) => {
  if (!diff) return 0

  const prefix = diff > 0 ? '⬆️' : '⬇️'
  return `${prefix} ${diff}%`
}

const getPm25Data = (
  aqi: number,
  time: { s: string },
  forecast: { daily: { pm25: Forecast[] } },
) => {
  const todayDate = time.s.split(' ')[0]
  const todayIndex = R.findIndex(R.propEq('day', todayDate))(
    forecast.daily.pm25,
  )
  const forecastPm25 = forecast.daily.pm25
  const todayAqi = forecastPm25[todayIndex]
  const yesterdayAqi = forecastPm25[todayIndex - 1]
  const { max, avg } = todayAqi
  const { max: yMax, avg: yAvg } = yesterdayAqi
  const recent = R.pipe(
    R.map((d: Forecast) => d.avg),
    R.mean,
    Math.round,
  )(forecast.daily.pm25)
  return {
    value: aqi,
    avg,
    max,
    recent,
    forecastPm25,
    diffAvg: diff(yAvg, avg),
    diffMax: diff(yMax, max),
  }
}

const getAirQuality = async (cityName: string) => {
  const [error, result] = await to(
    fetch(
      `${AIR_QUALITY_API_URL}/${cityName}/?token=${AIR_QUALITY_API_TOKEN}`,
    ).then(r => r.json()),
  )
  if (error) {
    logger.error(`fetch ${cityName} aqi failed`, error.message)
  }
  if (!result?.data) return {}

  const {
    aqi,
    time,
    forecast,
    city,
    iaqi: { t, h },
  } = result.data

  const currentAirQuality = {
    ...city,
    ...getPm25Data(aqi, time, forecast),
    name: cityName,
    time: time.s,
    temperature: t.v,
    humidity: h.v,
  }
  return currentAirQuality
}

const AQI_LEVELS = [
  { value: 50, label: 'Good', emoji: '🟢' },
  { value: 100, label: 'Moderate', emoji: '🟡' },
  { value: 150, label: 'Unhealthy for Sensitive', emoji: '🟠' },
  { value: 200, label: 'Unhealthy', emoji: '🔴' },
  { value: 300, label: 'Very Unhealthy', emoji: '🟣' },
  { value: 301, label: 'Hazardous', emoji: '🟤' },
]

const setAirQualityLevels = () => {
  const levels = R.map(R.prop('value'), AQI_LEVELS)
  const levelsName = R.map(R.prop('label'), AQI_LEVELS)
  core.setOutput('levels', `${levelsName.join(',')}<br/>${levels.join(',')}`)
}

const getAqiStr = (aqi: number) => {
  const targetLevel =
    AQI_LEVELS.find(level => level.value >= aqi) || AQI_LEVELS[0]
  return `${targetLevel.emoji} ${aqi}`
}

const capitalize = (s: string | undefined) =>
  s && s[0].toUpperCase() + s.slice(1)

const getCityName = (name: string) => {
  const lastName = R.last(name.split('/'))
  return capitalize(lastName?.split('-')[0])
}

;(async () => {
  const result = await Promise.all(cityList.map(city => getAirQuality(city)))
  const sortedResultWithAvg = R.sortWith(
    [R.descend(R.prop('avg')), R.ascend(R.prop('name'))],
    result,
  )

  const subject = sortedResultWithAvg
    .reverse()
    .map(r => `${getCityName(r.name)}:${getAqiStr(r.avg)}`)
  core.setOutput('subject', subject.join(';'))

  const details = sortedResultWithAvg.map((r, idx) =>
    [
      `${idx + 1}. ${getCityName(r.name)}`,
      getAqiStr(r.value),
      getAqiStr(r.avg),
      getAqiStr(r.max),
      getDiffStr(r.diffAvg),
      getDiffStr(r.diffMax),
      getAqiStr(r.recent),
      `${r.temperature}°C`,
      `${r.humidity}%`,
    ].join(),
  )
  const content = [
    [
      'City',
      'Now',
      'Avg',
      'Max',
      'Diff Avg',
      'Diff Max',
      'Recent 7 Days Avg',
      'Temp',
      'Humidity',
    ],
    ...details,
  ].join('<br/>')
  core.setOutput('content', content)
  setAirQualityLevels()
})()

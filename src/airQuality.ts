import fetch from 'node-fetch'
import to from 'await-to-js'
import * as dotenv from 'dotenv'
import * as R from 'ramda'
import * as core from '@actions/core'
import logger from 'loglevel'

dotenv.config()

const {
  AIR_QUALITY_API_URL = 'http://api.waqi.info/feed',
  AIR_QUALITY_API_TOKEN,
  AIR_QUALITY_CITY_LIST,
} = process.env

const cityList = AIR_QUALITY_CITY_LIST?.split(',') || []

type Forecast = {
  max: number
  min: number
  avg: number
  day: string
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
  const { aqi, forecast, time, city } = result.data
  const todayDate = time.s.split(' ')[0]
  const forecastPm25 = R.indexBy(
    R.prop('day'),
    forecast.daily.pm25 as Forecast[],
  )
  const todayAqi = forecastPm25[todayDate]
  const { max, avg } = todayAqi as Forecast
  const recent = R.pipe(
    R.map((d: Forecast) => d.avg),
    R.mean,
    Math.round,
  )(forecast.daily.pm25)

  const currentAirQuality = {
    ...city,
    name: cityName,
    value: aqi,
    avg,
    max,
    time: time.s,
    recent,
    forecast: forecastPm25,
  }
  return currentAirQuality
}

;(async () => {
  const result = await Promise.all(cityList.map(city => getAirQuality(city)))
  const subject = result.map(r => `${r.name}:${r.avg}`)
  core.setOutput('subject', subject.join(';'))
  const sortedResultWithAvg = R.sortWith(
    [R.descend(R.prop('avg')), R.ascend(R.prop('name'))],
    result,
  )
  const details = sortedResultWithAvg.map((r, idx) =>
    [`${idx + 1}. ${r.name}`, r.value, r.avg, r.max, r.recent].join(),
  )
  const content = [
    ['City', 'Now', 'Avg', 'Max', 'Recent 7 Days Avg'],
    ...details,
  ].join('<br/>')
  core.setOutput('content', content)

  const levels = [50, 100, 150, 200, 300, 301]
  const levels_name = [
    'Good',
    'Moderate',
    'Unhealthy for Sensitive',
    'Unhealthy',
    'Very Unhealthy',
    'Hazardous',
  ]
  core.setOutput('levels', `${levels_name.join(',')}<br/>${levels.join(',')}`)
})()

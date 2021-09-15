import fetch from 'node-fetch'
import to from 'await-to-js'
import * as dotenv from 'dotenv'
import * as R from 'ramda'

dotenv.config()

type Project = {
  city: string
  cityName: string
  project: string
  projectName: string
}

const {
  FANG_API_URL = 'https://fangjia.fang.com/fangjia/common/ajaxtrenddata',
  FANG_PROJECT_CONFIGS = [
    { city: 'nb', cityName: '宁波', project: '', projectName: ' 在水一方' },
    { city: 'wuhan', cityName: '宁波', project: '', projectName: ' 长城嘉苑' },
  ],
} = process.env

const fetchCity = async (city: string) => {
  const [error, result] = await to(
    fetch(`${FANG_API_URL}/${city}/`)
      .then(r => r.text() || '')
      .then(d => JSON.parse(d.split('&')?.[0])),
  )
  console.log('result: ', result)
}

const fetchCities = async (cites: string[]) => {
  const result = await Promise.all(cites.map(fetchCity))
}

;(async () => {
  const projects = FANG_PROJECT_CONFIGS as Project[]
  const cityList = R.pipe(R.map(R.prop('city')), R.uniq)(projects)
  console.log('cityList: ', cityList)
  const projectsGroupByCity = R.groupBy(R.prop('city'), projects)
  console.log('projectsGroupByCity: ', projectsGroupByCity)
  fetchCities(cityList)
})()

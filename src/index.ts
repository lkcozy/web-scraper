import * as core from '@actions/core'
import puppeteer, { Page } from 'puppeteer'

const saveData = (key: string, value: string) => {
  core.setOutput(key, value)
  core.exportVariable(key, value)
}

const selectors = [
  {
    title:
      'body > main > div:nth-child(2) > div:nth-child(8) > div > div > div:nth-child(1) > h3',
    content:
      'body > main > div:nth-child(2) > div:nth-child(8) > div > div > div.mwspanel.section > div > div > div.reference.parbase.section > div > div > p',
    current:
      'body > main > div:nth-child(2) > div:nth-child(3) > div > div > div.reference.parbase.section > div > div > p',
  },
  {
    title: '#canada-online',
    content:
      'body > main > div:nth-child(2) > div:nth-child(20) > div > div > div.mwspanel.section > div > div > div.reference.parbase.section > div > div > p',
  },
  {
    title:
      'body > main > div:nth-child(2) > div:nth-child(3) > div > div > div:nth-child(3) > h4',
    content:
      'body > main > div:nth-child(2) > div:nth-child(3) > div > div > div.mwspanel.section > div > div > div.reference.parbase.section > div > div > p',
  },
]

const getContent = async (page: Page, selector: string) =>
  page.$eval(selector, (el: Element) => {
    return (el as HTMLElement)?.innerText.replace('?', '').trim()
  })

;(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(
    'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/check-status.html',
    {
      // consider navigation to be finished when there are no more than 0 network connections for at least 500 ms.
      waitUntil: 'networkidle0',
    },
  )

  const results = await Promise.all(
    selectors.map(async selector => {
      const { title, content, current } = selector
      const t = await getContent(page, title)
      const c = await getContent(page, content)
      const cur = current ? await getContent(page, current) : ''
      if (cur) {
        saveData('current', cur.replace('Last updated:', ''))
      }
      return `<h1>${t}</h1><br/ ><p>${c}</p>`
    }),
  )

  saveData('content', results.join())
  await browser.close()
})()

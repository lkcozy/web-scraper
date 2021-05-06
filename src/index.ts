import * as core from '@actions/core';
import puppeteer from 'puppeteer';

const saveData = (key: string, value: string) => {
  core.setOutput(key, value);
  core.exportVariable(key, value);
};

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(
    'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/check-status.html',
  );
  const continueButton = await page.$('aria/Continue');
  if (continueButton) {
    await continueButton.click();
  }

  const latest = await page.$eval('.label.label-info', (el) =>
    (el as HTMLElement).innerText.replace('Last updated:', ''),
  );
  const current = await page.$eval('.mrgn-tp-0.h2', (el) =>
    (el as HTMLElement).innerText.replace(/\n/g, '').replace('?', ''),
  );

  const hasNewData =
    latest !== process.env.latest || current !== process.env.current;
  if (hasNewData) {
    saveData('latest', latest);
    saveData('current', current);
  }

  core.setOutput('hasNewData', hasNewData);
  await browser.close();
})();

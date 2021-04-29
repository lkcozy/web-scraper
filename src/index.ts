import * as core from '@actions/core';
import puppeteer from 'puppeteer';

const saveData = (key: string, value: string) => {
  core.setOutput(key, value);
  core.exportVariable(key, value);
};

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(
    'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/check-status.html',
  );
  const continueButton = await page.$('aria/Continue');
  if (continueButton) {
    await continueButton.click();
  }

  const data = await page.evaluate(() => {
    const latest = (document.querySelector(
      '.label.label-info',
    ) as HTMLElement).innerText.replace('Last updated:', '');

    const current = (document.querySelector(
      '.mrgn-tp-0.h2',
    ) as HTMLElement).innerText
      .replace(/\n/g, '')
      .replace('?', '');
    return { latest, current };
  });

  const { latest, current } = data;

  const hasNewData = data.latest !== process.env.latest;
  if (hasNewData) {
    saveData('latest', latest);
    saveData('current', current);
  }

  core.setOutput('hasNewData', hasNewData);
  await browser.close();
})();

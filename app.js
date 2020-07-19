const puppeteer = require('puppeteer');
const steps = require('./steps.json');
const stepDetails = require('./amazonScrape.json');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  //await page.goto('https://amazon.com');
  //await page.screenshot({path: 'example.png'});
  console.log(steps)
  await browser.close();
})();

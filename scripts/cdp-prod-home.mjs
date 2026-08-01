import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
const t0 = Date.now();
const resp = await page.goto('https://chinaconnect.pages.dev/', { waitUntil: 'domcontentloaded', timeout: 30000 });
console.log('status:', resp.status(), 'ms:', Date.now()-t0);
const data = await page.evaluate(() => {
  const nav = document.querySelector('nav a[href="/ai"]');
  return {
    aiLabel: nav ? nav.textContent.trim() : '',
    h1: ((document.querySelector('h1') || {}).textContent || '').trim().slice(0,80),
    title: document.title,
    aiHref: nav ? nav.href : '',
  };
});
console.log(JSON.stringify(data, null, 2));
await page.screenshot({ path: 'screenshots/prod-home.png', fullPage: false });
console.log('screenshot saved');
await browser.close();

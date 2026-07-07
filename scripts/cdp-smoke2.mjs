import { chromium } from 'playwright';
const BASE = 'http://127.0.0.1:4321';
const TARGETS = ['/', '/cities', '/food', '/ai', '/guide',
  '/city/beijing', '/city/shanghai', '/city/chengdu',
  '/city/beijing/food', '/city/beijing/hotels', '/city/beijing/attractions'];
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const context = browser.contexts()[0] || await browser.newContext();
const page = await context.newPage();
const summary = [];
for (const t of TARGETS) {
  const url = BASE + t;
  const t0 = Date.now();
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    try { await page.waitForLoadState('networkidle', { timeout: 8000 }); } catch {}
    await page.waitForTimeout(800);
    const data = await page.evaluate(() => {
      const nav = document.querySelector('nav a[href="/ai"]');
      const aiLabel = nav ? nav.textContent.trim() : '';
      const h1 = (document.querySelector('h1') || {}).textContent || '';
      const cult = !!document.querySelector('[class*="cultural-trigger" i], button[class*="culture"][class*="fixed" i]');
      const floatingCult = Array.from(document.querySelectorAll('button')).filter(b => /culture|\u6587\u5316/.test(b.textContent) && b.getBoundingClientRect().bottom > window.innerHeight - 250).map(b => b.textContent.trim());
      const realImgs = Array.from(document.querySelectorAll('img')).filter(i => i.naturalWidth > 50 && i.naturalHeight > 50).length;
      const tel = document.querySelectorAll('a[href^="tel:"]').length;
      const map = document.querySelectorAll('a[href*="maps.google"], a[href*="map.baidu"], a[href*="geo:"]').length;
      return { aiLabel, h1: h1.trim().slice(0,80), cult, floatingCult, realImgs, tel, map };
    });
    await page.screenshot({ path: 'screenshots/wave0' + t.replace(/\//g,'_') + '.png', fullPage: false });
    summary.push({ url, ms: Date.now()-t0, status: resp.status(), ...data });
  } catch (e) {
    summary.push({ url, ms: Date.now()-t0, status: 'FAIL', err: String(e).slice(0,150) });
  }
}
console.log(JSON.stringify(summary, null, 2));
await browser.close();

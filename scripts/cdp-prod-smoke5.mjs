import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
const BASE = 'https://chinaconnect.pages.dev';
const TARGETS = ['/', '/ai/', '/city/beijing/', '/city/beijing/food/', '/city/beijing/attractions/'];
const out = [];
for (const t of TARGETS) {
  const t0 = Date.now();
  try {
    const resp = await page.goto(BASE + t, { waitUntil: 'domcontentloaded', timeout: 30000 });
    try { await page.waitForLoadState('networkidle', { timeout: 8000 }); } catch {}
    await page.waitForTimeout(800);
    const data = await page.evaluate(() => {
      const nav = document.querySelector('nav a[href="/ai"]');
      const h1 = (document.querySelector('h1') || {}).textContent || '';
      const realImgs = Array.from(document.querySelectorAll('img')).filter(i => i.naturalWidth > 50 && i.naturalHeight > 50).length;
      const tel = document.querySelectorAll('a[href^="tel:"]').length;
      const map = document.querySelectorAll('a[href*="maps.google"], a[href*="map.baidu"]').length;
      const hreflangCount = document.querySelectorAll('link[rel="alternate"][hreflang]').length;
      return { aiLabel: nav ? nav.textContent.trim() : '', h1: h1.trim().slice(0,80), realImgs, tel, map, hreflangCount, title: document.title };
    });
    await page.screenshot({ path: 'screenshots/prod' + t.replace(/[\/]/g,'_').replace(/^_/, '') + '.png', fullPage: false });
    out.push({ url: BASE + t, ms: Date.now()-t0, status: resp.status(), ...data });
  } catch (e) {
    out.push({ url: BASE + t, ms: Date.now()-t0, err: String(e).slice(0,100) });
  }
}
console.log(JSON.stringify(out, null, 2));
await browser.close();

import { chromium } from 'playwright';
const BASE = 'http://127.0.0.1:4321';
const TARGETS = ['/city/beijing/attractions', '/city/beijing/food', '/city/shanghai/attractions', '/city/shanghai/food'];
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const context = browser.contexts()[0] || await browser.newContext();
const page = await context.newPage();
const out = [];
for (const t of TARGETS) {
  await page.goto(BASE + t, { waitUntil: 'domcontentloaded' });
  try { await page.waitForLoadState('networkidle', { timeout: 8000 }); } catch {}
  await page.waitForTimeout(800);
  const stats = await page.evaluate(() => {
    const tel = document.querySelectorAll('a[href^="tel:"]');
    const map = document.querySelectorAll('a[href*="maps.google"], a[href*="map.baidu"], a[href*="geo:"]');
    const sources = Array.from(document.querySelectorAll('a')).filter(a => /dianping|tripadvisor|xiaohongshu|meituan|michelin/i.test(a.href) || /sources|reference|数据源/i.test(a.textContent)).slice(0,5).map(a => ({href: a.href, text: a.textContent.trim().slice(0,40)}));
    return {
      telCount: tel.length,
      telSamples: Array.from(tel).slice(0,3).map(a => a.href),
      mapCount: map.length,
      sources
    };
  });
  out.push({ url: t, ...stats });
}
console.log(JSON.stringify(out, null, 2));
await browser.close();

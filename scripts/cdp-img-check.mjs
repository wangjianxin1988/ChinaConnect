import { chromium } from 'playwright';
const BASE = 'http://127.0.0.1:4321';
const TARGETS = ['/city/beijing/food', '/city/beijing/attractions', '/city/beijing/hotels', '/city/shanghai/food'];
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const context = browser.contexts()[0] || await browser.newContext();
const page = await context.newPage();
const out = [];
for (const t of TARGETS) {
  await page.goto(BASE + t, { waitUntil: 'domcontentloaded' });
  try { await page.waitForLoadState('networkidle', { timeout: 10000 }); } catch {}
  await page.waitForTimeout(800);
  const imgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img'))
      .map(i => ({ src: i.src, w: i.naturalWidth, h: i.naturalHeight, alt: i.alt }))
      .filter(o => o.src && !o.src.startsWith('data:'));
  });
  const pexels = imgs.filter(i => i.src.includes('pexels'));
  const nonPexels = imgs.filter(i => !i.src.includes('pexels'));
  out.push({ url: t, total: imgs.length, pexels: pexels.length, pexelsUrls: pexels.slice(0,3).map(p => p.src.slice(0,80)), nonPexelsSamples: nonPexels.slice(0,3).map(p => p.src.slice(0,80)) });
}
console.log(JSON.stringify(out, null, 2));
await browser.close();

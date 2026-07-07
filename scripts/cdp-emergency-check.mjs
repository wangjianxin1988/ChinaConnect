import { chromium } from 'playwright';
const BASE = 'http://127.0.0.1:4321';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const context = browser.contexts()[0] || await browser.newContext();
const page = await context.newPage();
const cities = ['beijing','shanghai','chengdu','guangzhou'];
const out = [];
for (const c of cities) {
  await page.goto(BASE + '/city/' + c, { waitUntil: 'domcontentloaded' });
  try { await page.waitForLoadState('networkidle', { timeout: 8000 }); } catch {}
  await page.waitForTimeout(800);
  const stats = await page.evaluate(() => {
    const tel = document.querySelectorAll('a[href^="tel:"]');
    const embassy = document.querySelectorAll('[data-emergency-type="embassy"], a[href*="embassy"]');
    return {
      telCount: tel.length,
      telUnique: new Set(Array.from(tel).map(a => a.href.replace('tel:',''))).size,
      telSamples: Array.from(tel).slice(0,5).map(a => a.textContent.trim().slice(0,40))
    };
  });
  out.push({ city: c, ...stats });
}
console.log(JSON.stringify(out, null, 2));
await browser.close();

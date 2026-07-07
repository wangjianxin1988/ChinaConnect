import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const context = browser.contexts()[0] || await browser.newContext();
const page = await context.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto('http://127.0.0.1:4321/ai', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(3500);
await page.screenshot({ path: 'screenshots/ai-fullpage.png', fullPage: true });
const stats = await page.evaluate(() => {
  const h1 = (document.querySelector('h1') || {}).textContent || '';
  const prompts = document.querySelectorAll('button[class*="group"]');
  const sidebar = document.querySelectorAll('aside, [class*="sidebar"]');
  return {
    h1: h1.slice(0, 100),
    promptCount: prompts.length,
    sidebarCount: sidebar.length,
    bodyHeight: document.body.scrollHeight,
    docHeight: document.documentElement.scrollHeight
  };
});
console.log(JSON.stringify(stats, null, 2));
await browser.close();
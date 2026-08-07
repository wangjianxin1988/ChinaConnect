import { chromium } from "playwright";
const browser = await chromium.connectOverCDP("http://127.0.0.1:9333");
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
const BASE = "https://chinaconnect.pages.dev";
const TARGETS = [
  "/",
  "/cities",
  "/food",
  "/ai",
  "/guide",
  "/city/beijing",
  "/city/shanghai",
  "/city/chengdu",
  "/city/guangzhou",
  "/city/beijing/food",
  "/city/beijing/hotels",
  "/city/beijing/attractions",
  "/account",
  "/pricing",
];
const summary = [];
for (const t of TARGETS) {
  const url = BASE + t;
  const t0 = Date.now();
  try {
    const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    try {
      await page.waitForLoadState("networkidle", { timeout: 10000 });
    } catch {}
    await page.waitForTimeout(1500);
    const data = await page.evaluate(() => {
      const nav = document.querySelector('nav a[href="/ai"]');
      const aiLabel = nav ? nav.textContent.trim() : "";
      const h1 = (document.querySelector("h1") || {}).textContent || "";
      const realImgs = Array.from(document.querySelectorAll("img")).filter(
        (i) => i.naturalWidth > 50 && i.naturalHeight > 50,
      ).length;
      const tel = document.querySelectorAll('a[href^="tel:"]').length;
      const map = document.querySelectorAll(
        'a[href*="maps.google"], a[href*="map.baidu"], a[href*="geo:"]',
      ).length;
      const title = document.title;
      const canonical = document.querySelector('link[rel="canonical"]')?.href || "";
      const hreflangCount = document.querySelectorAll('link[rel="alternate"][hreflang]').length;
      return {
        aiLabel,
        h1: h1.trim().slice(0, 80),
        realImgs,
        tel,
        map,
        title,
        canonical,
        hreflangCount,
      };
    });
    await page.screenshot({
      path: "screenshots/prod-" + t.replace(/[\/]/g, "_").replace(/^_/, "") + ".png",
      fullPage: false,
    });
    summary.push({ url, ms: Date.now() - t0, status: resp.status(), ...data });
  } catch (e) {
    summary.push({ url, ms: Date.now() - t0, status: "FAIL", err: String(e).slice(0, 150) });
  }
}
console.log(JSON.stringify(summary, null, 2));
await browser.close();

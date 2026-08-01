import { chromium } from "playwright";

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

const browser = await chromium.connectOverCDP("http://127.0.0.1:9333");
const context = browser.contexts()[0] || (await browser.newContext());
const page = await context.newPage();

const summary = [];
for (const t of TARGETS) {
  const url = BASE + t;
  const t0 = Date.now();
  let status = "OK",
    err = null,
    telLinks = 0,
    mapLinks = 0,
    imgs = 0,
    h1 = "";
  let cultural = false,
    aiLabels = [],
    explore = [],
    floating = [];
  try {
    const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    try {
      await page.waitForLoadState("networkidle", { timeout: 8000 });
    } catch {}
    await page.waitForTimeout(1200);
    status = resp.status();
    const data = await page.evaluate(() => {
      const tel = Array.from(document.querySelectorAll('a[href^="tel:"]')).length;
      const map = Array.from(
        document.querySelectorAll('a[href*="maps.google"], a[href*="map.baidu"], a[href*="geo:"]'),
      ).length;
      const img = Array.from(document.querySelectorAll("img")).filter(
        (i) => i.naturalWidth > 50 && i.naturalHeight > 50,
      ).length;
      const h1el = document.querySelector("h1");
      const cultural = !!document.querySelector('[class*="cultural" i], [id*="cultural" i]');
      const aiLabel = Array.from(document.querySelectorAll("a,button"))
        .map((e) => (e.textContent || "").trim())
        .filter((t) => /AI Concierge|AI\u804a\u5929|AI Chat/i.test(t));
      const ex = Array.from(document.querySelectorAll("a,button"))
        .map((e) => (e.textContent || "").trim())
        .filter((t) => /Explore Restaurants|\u63a2\u7d22\u9910\u5385/i.test(t));
      const fb = Array.from(document.querySelectorAll("button"))
        .filter((b) => {
          const r = b.getBoundingClientRect();
          return r.width > 0 && r.bottom > window.innerHeight - 250;
        })
        .map((b) => (b.textContent || "").trim().slice(0, 30));
      return {
        tel,
        map,
        img,
        h1: h1el ? h1el.textContent.trim().slice(0, 80) : "",
        cultural,
        aiLabel,
        ex,
        fb,
      };
    });
    telLinks = data.tel;
    mapLinks = data.map;
    imgs = data.img;
    h1 = data.h1;
    cultural = data.cultural;
    aiLabels = data.aiLabel;
    explore = data.ex;
    floating = data.fb;
    const fname = "screenshots/audit-2026-07-07" + (t.replace(/\//g, "_") || "_home") + ".png";
    await page.screenshot({ path: fname, fullPage: false });
    summary.push({
      url,
      ms: Date.now() - t0,
      status,
      h1,
      tel: telLinks,
      map: mapLinks,
      imgs,
      cultural,
      aiLabels,
      explore,
      floating,
    });
  } catch (e) {
    summary.push({ url, ms: Date.now() - t0, status: "FAIL", err: String(e).slice(0, 200) });
  }
}
console.log(JSON.stringify(summary, null, 2));
await browser.close();

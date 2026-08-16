import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const b = await chromium.launch({ headless: true });
const page = await b.newPage();
await page.goto("http://127.0.0.1:4322/ja/emergency/", { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(2500);
const htmlLang = await page.evaluate(() => document.documentElement.lang);
const hasI18n = await page.evaluate(() => !!(window.__I18N__ && window.__I18N__.translations));
const dictLang = await page.evaluate(() => window.__I18N__ ? Object.keys(window.__I18N__.translations || {}) : []);
const oneTap = await page.evaluate(() => {
  const el = document.querySelector("[data-i18n='emergencyPage.oneTapDesc']");
  return el ? el.textContent : "NO-EL";
});
const bodyHasEnglish = await page.evaluate(() => document.body.innerText.includes("Tap any number to call immediately"));
console.log("html lang:", htmlLang, "| __I18N__:", hasI18n, "| dict keys:", dictLang);
console.log("oneTapDesc text:", oneTap);
console.log("body contains EN:", bodyHasEnglish);
await b.close();

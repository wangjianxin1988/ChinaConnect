import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const b = await chromium.launch({ headless: true });
const page = await b.newPage();
await page.goto("http://127.0.0.1:4322/ja/emergency/", { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(1500);
const res = await page.evaluate(() => {
  const t = window.__I18N__ && window.__I18N__.translations && window.__I18N__.translations.ja;
  if (!t) return { error: "no ja dict", keys: Object.keys(window.__I18N__?.translations || {}) };
  const ep = t.emergencyPage;
  const out = {
    hasEmergencyPage: !!ep,
    oneTapDesc: ep && ep.oneTapDesc,
    error: window.__CC_RUNTIME__ ? "runtime-present" : "runtime-missing",
    htmlLang: document.documentElement.lang,
  };
  // check if the DOM element was replaced
  const el = document.querySelector("[data-i18n='emergencyPage.oneTapDesc']");
  out.elText = el ? el.textContent : "NO-EL";
  return out;
});
console.log(JSON.stringify(res, null, 1));
await b.close();

import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
await ctx.addInitScript(() => { try { localStorage.setItem("chinaconnect_language", "ja"); } catch (e) {} });
const page = await ctx.newPage();
const logs = [];
page.on("console", (m) => { logs.push(m.type() + ": " + m.text().slice(0, 300)); });
await page.goto("http://localhost:4321/ja/city/beijing/", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(2500);
const info = await page.evaluate(() => {
  const I = window.__I18N__ || {};
  const t = I.translations || {};
  return {
    serverLang: I.serverLang,
    hasJa: !!t.ja,
    jaNavCities: t.ja && t.ja.nav && t.ja.nav.cities,
    langs: I.languages,
    ccRuntime: !!window.__CC_RUNTIME__,
    sampleDataI18n: [...document.querySelectorAll("[data-i18n]")].slice(0, 8).map(el => el.getAttribute("data-i18n") + "=" + el.textContent.trim()),
  };
});
console.log(JSON.stringify(info, null, 1));
console.log("console logs:", JSON.stringify(logs.slice(0, 8), null, 1));
await browser.close();

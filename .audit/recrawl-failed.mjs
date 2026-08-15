import { chromium } from "playwright";
import fs from "node:fs";
const BASE = "http://localhost:4321";
const results = JSON.parse(fs.readFileSync(".audit/ja-js-scan.json", "utf8"));
const failed = Object.entries(results).filter(([, v]) => String(v.text || "").startsWith("__ERR__")).map(([u]) => u);
console.log("failed urls to recrawl:", failed.length);
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
await ctx.addInitScript(() => { try { localStorage.setItem("chinaconnect_language", "ja"); } catch (e) {} });
const page = await ctx.newPage();
let ok = 0;
for (let i = 0; i < failed.length; i++) {
  const u = failed[i];
  try {
    await page.goto(BASE + u, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1200);
    const data = await page.evaluate(() => ({
      title: document.title,
      desc: (document.querySelector('meta[name="description"]') || {}).content || "",
      text: (document.body.innerText || "").replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n"),
    }));
    results[u] = data;
    ok++;
  } catch (e) {
    console.log("still failing:", u, e.message.split("\n")[0]);
  }
  if ((i + 1) % 10 === 0) console.log("recrawled", i + 1, "/", failed.length);
}
await browser.close();
const tmp = ".audit/ja-js-scan.json.tmp";
fs.writeFileSync(tmp, JSON.stringify(results, null, 1), "utf8");
fs.renameSync(tmp, ".audit/ja-js-scan.json");
console.log("recrawled ok:", ok, "remaining err:", Object.values(results).filter((v) => String(v.text || "").startsWith("__ERR__")).length);

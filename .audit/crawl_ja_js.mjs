// .audit/crawl_ja_js.mjs — render each /ja/ page in Chromium (JS on), extract visible text
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = "http://localhost:4321";
const slugs = "beijing changsha chengde chengdu chongqing dali dalian dunhuang fuzhou guangzhou guilin hangzhou harbin hulunbuir jinan kunming lanzhou lijiang luoyang nanjing ningbo qingdao quanzhou sanya shanghai shenzhen suzhou tianjin weihai wuhan xiamen xian xining yantai zhangjiajie".split(" ");
const food_ids = "bj-michelin-1 bj-blackpearl-1 bj-local-1 bj-local-2 bj-michelin-2 sh-michelin-1 sh-blackpearl-1 sh-local-1 sh-local-2 sh-blackpearl-2 hz-michelin-1 hz-blackpearl-1 hz-local-1 hz-local-2 hz-michelin-2 cd-blackpearl-1 cd-local-1 cd-local-2 cd-michelin-1 cd-local-3 gz-michelin-1 gz-blackpearl-1 gz-local-1 gz-local-2 gz-blackpearl-2 xa-blackpearl-1 xa-local-1 xa-local-2 xa-michelin-1 xa-local-3 cq-blackpearl-1 cq-michelin-1 cq-local-1 cq-local-2 dl-blackpearl-1 dl-local-1 dl-local-2 gl-blackpearl-1 gl-local-1 gl-local-2 gl-local-3 nj-blackpearl-1 nj-michelin-1 nj-local-1 nj-local-2 sz-michelin-1 sz-blackpearl-1 sz-local-1 sz-local-2 szh-blackpearl-1 szh-michelin-1 szh-local-1 szh-local-2".split(" ");
const guides = ["", "accommodation", "attractions", "communication", "cultural-warnings", "departure", "dining", "emergency-procedures", "payment", "scam-prevention", "transparency", "transport", "visa"];
const urls = ["/ja/", "/ja/cities/", "/ja/blog/", "/ja/food/", "/ja/scenic-spots/", "/ja/ai/"];
for (const g of guides) urls.push("/ja/guide/" + g);
for (const g of ["company-registration", "etiquette", "expo-calendar", "translation"]) urls.push("/ja/guide/business/" + g);
for (const s of slugs) urls.push("/ja/city/" + s);
for (const s of slugs) urls.push("/ja/city/" + s + "/food");
for (const s of slugs) urls.push("/ja/city/" + s + "/attractions");
for (const s of slugs) urls.push("/ja/city/" + s + "/hotels");
for (const i of food_ids) urls.push("/ja/food/" + i);
const uniq = [...new Set(urls)];
console.log("total urls:", uniq.length);

const browser = await chromium.launch({ headless: true });
const results = {};
const CONCURRENCY = 4;
let cursor = 0;
const failed = [];

async function worker() {
  const context = await browser.newContext();
  await context.addInitScript(() => { try { localStorage.setItem("chinaconnect_language", "ja"); } catch (e) {} });
  const page = await context.newPage();
  while (true) {
    const i = cursor++;
    if (i >= uniq.length) break;
    const u = uniq[i];
    try {
      await page.goto(BASE + u, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(1200);
      const data = await page.evaluate(() => {
        return {
          title: document.title,
          desc: (document.querySelector('meta[name="description"]') || {}).content || "",
          text: (document.body.innerText || "").replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n"),
        };
      });
      results[u] = data;
    } catch (e) {
      failed.push(u + " :: " + e.message.split("\n")[0]);
      results[u] = { title: "", desc: "", text: "__ERR__ " + e.message.split("\n")[0] };
    }
    if ((i + 1) % 30 === 0) console.log("done", i + 1, "/", uniq.length);
  }
  await context.close();
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
await browser.close();
fs.writeFileSync("D:/suoyouxiangmu/chinaconnect/.audit/ja-js-scan.json", JSON.stringify(results, null, 1), "utf8");
console.log("saved", Object.keys(results).length, "pages; failed:", failed.length);
if (failed.length) console.log(failed.slice(0, 20).join("\n"));

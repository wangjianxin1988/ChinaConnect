// Phase 5 extended page scanner: full page inventory coverage.
// Modes: --focus=priority (guide+emergency+city-sections+home+cities) | --focus=city | --focus=misc | --focus=all
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const args = process.argv.slice(2);
const outFile = args.find((a) => a.startsWith("--out="))?.split("=")[1] || ".audit/pages_scan_full.txt";
const focus = args.find((a) => a.startsWith("--focus="))?.split("=")[1] || "priority";
const langFilter = args.find((a) => a.startsWith("--lang="))?.split("=")[1];
const BASE = "http://127.0.0.1:4322";
const LANGS = ["en", "ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"];
const GUIDES = ["", "visa", "payment", "communication", "transport", "dining", "attractions", "accommodation",
  "cultural-warnings", "scam-prevention", "departure", "emergency-procedures", "transparency",
  "business", "business/company-registration", "business/etiquette", "business/expo-calendar",
  "business/invitation-letter", "business/translation"];
const SECTIONS = ["transport", "payment", "sim", "apps", "culture", "emergency"];
const CITY_SLUGS = ["beijing","shanghai","guangzhou","shenzhen","chengdu","chongqing","xian","hangzhou","suzhou","nanjing","wuhan","changsha","harbin","kunming","qingdao","dalian","sanya","guilin","xiamen","fuzhou","luoyang","ningbo","lanzhou","weihai","yantai","jinan","xining","dunhuang","dali","lijiang","chengde","zhangjiajie","hulunbuir","quanzhou","tianjin"];

function buildUrls() {
  const urls = [];
  const langs = langFilter ? [langFilter] : LANGS;
  for (const lang of langs) {
    const p = lang === "en" ? "" : `/${lang}`;
    if (focus === "priority" || focus === "all") {
      urls.push(`${BASE}${p}/`);
      urls.push(`${BASE}${p}/cities/`);
      for (const g of GUIDES) urls.push(`${BASE}${p}/guide${g ? "/" + g : ""}`);
      urls.push(`${BASE}${p}/emergency/`);
      for (const slug of CITY_SLUGS) for (const s of SECTIONS) urls.push(`${BASE}${p}/city/${slug}/${s}/`);
    }
    if (focus === "quick") {
      urls.push(`${BASE}${p}/`);
      urls.push(`${BASE}${p}/cities/`);
      for (const g of GUIDES) urls.push(`${BASE}${p}/guide${g ? "/" + g : ""}`);
      urls.push(`${BASE}${p}/emergency/`);
      for (const slug of CITY_SLUGS) urls.push(`${BASE}${p}/city/${slug}/`);
    }
    if (focus === "city" || focus === "all") {
      for (const slug of CITY_SLUGS) {
        urls.push(`${BASE}${p}/city/${slug}/`);
        urls.push(`${BASE}${p}/city/${slug}/food/`);
        urls.push(`${BASE}${p}/city/${slug}/attractions/`);
        urls.push(`${BASE}${p}/city/${slug}/hotels/`);
      }
    }
    if (focus === "misc" || focus === "all") {
      urls.push(`${BASE}${p}/ai/`);
      urls.push(`${BASE}${p}/food/`);
      urls.push(`${BASE}${p}/attractions/`);
      urls.push(`${BASE}${p}/scenic-spots/`);
      urls.push(`${BASE}${p}/blog/`);
      urls.push(`${BASE}${p}/account/`);
      urls.push(`${BASE}${p}/pricing/`);
    }
  }
  return urls;
}

const ALLOW = new Set(("ChinaConnect Alipay WeChat Didi Meituan Dianping Ctrip Trip.com 12306 Amap Gaode Baidu Tencent "
  + "SIM eSIM VPN SOS RMB CNY USD EUR JPY HKD TWD THB KRW GBP AUD CAD NZD ID PDF QR NFC 4G 5G GPS AI "
  + "L Visa M Visa F Visa Z Visa X Visa Q Visa D Visa Metro Subway BRT Maglev High Speed Rail").toLowerCase().split(/\s+/));
const EN_WORD_RE = /[A-Za-z]+/g;
const CJK_RE = /[\u3400-\u9fff]/;
const ADDR_OK = /\b(Beijing|Shanghai|Guangzhou|Shenzhen|Chengdu|Chongqing|Xi'an|Xian|Hangzhou|Suzhou|Nanjing|Wuhan|Changsha|Harbin|Kunming|Qingdao|Dalian|Sanya|Guilin|Xiamen|Fuzhou|Luoyang|Ningbo|Lanzhou|Weihai|Yantai|Jinan|Xining|Dunhuang|Dali|Lijiang|Chengde|Zhangjiajie|Hulunbuir|Quanzhou|Tianjin|China|District|Road|Street|Lane|No\.|Rm|Room)\b/;

function analyzeText(text, lang) {
  const issues = [];
  if (!text || text.length < 50) return issues;
  const lines = text.split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.length < 14) continue;
    const words = t.match(EN_WORD_RE) || [];
    const foreign = words.filter((w) => !ALLOW.has(w.toLowerCase()) && w.length > 1);
    if (lang !== "en" && foreign.length >= 4 && t.replace(/[^A-Za-z]/g, "").length >= 25) {
      // skip address-like lines
      if (ADDR_OK.test(t) && t.length < 70) continue;
      issues.push(`EN: "${t.slice(0, 130)}"`);
    }
    if (lang !== "zh-CN" && lang !== "zh-TW" && lang !== "ja") {
      const cjk = t.match(CJK_RE);
      if (cjk && t.length > 30) issues.push(`CJK: "${t.slice(0, 110)}"`);
    }
  }
  const ph = text.match(/\{[a-zA-Z_]+\}|\?\?\?/g);
  if (ph) issues.push(`PLACEHOLDER: ${[...new Set(ph)].join(",")}`);
  return issues;
}

const urls = buildUrls();
console.log(`scanning ${urls.length} URLs (focus=${focus}, lang=${langFilter || "all"})`);
let browser;
const results = [];
try {
  browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const page = await ctx.newPage();
    let title = "", text = "", status = "ERR";
    try {
      const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
      status = resp ? resp.status() : "NO-RESP";
      await page.waitForTimeout(900);
      title = await page.title();
      text = await page.evaluate(() => document.body ? document.body.innerText : "");
    } catch (e) {
      status = "ERR:" + e.message.slice(0, 50);
    }
    const path = url.replace(BASE, "");
    const first = path.startsWith("/") ? (path.split("/")[1] || "") : "";
    const lang = LANGS.includes(first) ? first : "en";
    const issues = status === 200 ? analyzeText(text, lang) : [];
    results.push({ path, lang, status, title, issues });
    await page.close();
    if ((i + 1) % 30 === 0) process.stdout.write(`\n[${i + 1}/${urls.length}] `);
    else process.stdout.write(".");
  }
} finally {
  if (browser) await browser.close();
}

const lines = [];
let totalIssues = 0;
for (const r of results) {
  const flag = r.status === 200 && r.issues.length ? "ISSUE" : r.status === 200 ? "ok" : "HTTP-" + r.status;
  if (r.issues.length) totalIssues += r.issues.length;
  lines.push(`[${flag}] ${r.lang} ${r.path} | title=${r.title.slice(0, 60)}`);
  for (const i of r.issues) lines.push(`       ${i}`);
}
lines.push(`\nTOTAL pages: ${results.length}, pages-with-issues: ${results.filter((r) => r.issues.length).length}, issues: ${totalIssues}`);
fs.writeFileSync(outFile, lines.join("\n"), "utf8");
console.log(`\nwrote ${outFile}`);

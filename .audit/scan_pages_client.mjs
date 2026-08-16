// Phase 5 client-rendered page scanner.
// Loads each URL with JS enabled, extracts visible text, and flags:
//   - long English word runs (suspicious for non-EN pages)
//   - CJK characters on non-zh/ja pages
//   - leftover template placeholders ({...}, ??)
// Usage: node .audit/scan_pages_client.mjs [--urls=...|--guide|--city] [--out=file]
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const args = process.argv.slice(2);
const outFile = args.find((a) => a.startsWith("--out="))?.split("=")[1] || ".audit/pages_scan.txt";
const mode = args.find((a) => a.startsWith("--urls="))?.split("=")[1] || "guide";

const BASE = "http://127.0.0.1:4322";
const LANGS = ["en", "ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"];
const GUIDES = ["", "visa", "payment", "communication", "transport", "dining", "attractions", "accommodation",
  "cultural-warnings", "scam-prevention", "departure", "emergency-procedures", "transparency",
  "business", "business/company-registration", "business/etiquette", "business/expo-calendar",
  "business/invitation-letter", "business/translation"];
const MISC = ["", "emergency"];

function buildUrls() {
  const urls = [];
  for (const lang of LANGS) {
    const prefix = lang === "en" ? "" : `/${lang}`;
    for (const g of GUIDES) urls.push(`${BASE}${prefix}/guide${g ? "/" + g : ""}`);
    for (const m of MISC) urls.push(`${BASE}${prefix}${m ? "/" + m : ""}`);
  }
  return urls;
}

// tokens that are fine in any language (brands, tech terms, units)
const ALLOW = new Set(("ChinaConnect Alipay WeChat Didi Meituan Dianping Ctrip Trip.com 12306 Amap Gaode Baidu Tencent "
  + "SIM eSIM VPN SOS RMB CNY USD EUR JPY HKD TWD THB KRW GBP AUD CAD NZD ID PDF QR NFC 4G 5G GPS AI "
  + "L Visa M Visa F Visa Z Visa X Visa Q Visa D Visa Metro Subway BRT Maglev High Speed Rail").toLowerCase().split(/\s+/));

const EN_WORD_RE = /[A-Za-z]+/g;
const CJK_RE = /[\u3400-\u9fff]/;

function analyzeText(text, lang) {
  const issues = [];
  if (!text || text.length < 50) return issues;
  // strip lines that are nav/footer chrome keys
  // 1) long English runs
  const lines = text.split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.length < 14) continue;
    // count english words
    const words = t.match(EN_WORD_RE) || [];
    const foreign = words.filter((w) => !ALLOW.has(w.toLowerCase()) && w.length > 1);
    if (lang !== "en" && foreign.length >= 3 && t.replace(/[^A-Za-z]/g, "").length >= 20) {
      issues.push(`EN: "${t.slice(0, 120)}"`);
    }
    // 2) CJK on non-zh/ja pages (flag only obvious Chinese sentences, allow short proper nouns)
    if (lang !== "zh-CN" && lang !== "zh-TW" && lang !== "ja") {
      const cjk = t.match(CJK_RE);
      if (cjk && t.length <= 30) {
        // short line with CJK - could be proper noun; report as INFO
        issues.push(`CJK-INFO: "${t.slice(0, 80)}"`);
      } else if (cjk && t.length > 30) {
        issues.push(`CJK: "${t.slice(0, 100)}"`);
      }
    }
  }
  // 3) placeholders
  const ph = text.match(/\{[a-zA-Z_]+\}|placeholder|\?\?\?/g);
  if (ph) issues.push(`PLACEHOLDER: ${[...new Set(ph)].join(",")}`);
  return issues;
}

const urls = buildUrls();
let browser;
const results = [];
try {
  browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  for (const url of urls) {
    const page = await ctx.newPage();
    let title = "", text = "", status = "ERR";
    try {
      const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
      status = resp ? resp.status() : "NO-RESP";
      await page.waitForTimeout(1200);
      title = await page.title();
      text = await page.evaluate(() => document.body ? document.body.innerText : "");
    } catch (e) {
      status = "ERR:" + e.message.slice(0, 60);
    }
    const path = url.replace(BASE, "");
    const first = path.startsWith("/") ? (path.split("/")[1] || "") : "";
    const lang = LANGS.includes(first) ? first : "en";
    const issues = status === 200 ? analyzeText(text, lang) : [];
    results.push({ path, lang, status, title, issues });
    await page.close();
    process.stdout.write(`.`);
    if (results.length % 40 === 0) process.stdout.write(`\n`);
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
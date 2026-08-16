import fs from "fs";
const TS_FILE = "src/i18n/translations.ts";
const SUPPORTED = ["en","ja","ko","th","vi","ru","fr","de","ar","fa","zh-CN","zh-TW"];
function extractBlock(src, lang) {
  const lines = src.split("\n").map((l) => l.replace(/\r$/, ""));
  let startLine = -1;
  const re = new RegExp("^  (\"?" + lang.replace("-", "\\-") + "\"?):\\s*\\{?\\r?$");
  for (let i = 0; i < lines.length; i++) { if (re.test(lines[i])) { startLine = i; break; } }
  if (startLine === -1) throw new Error("Block not found: " + lang);
  const flat = {}; let depth = 0; let inBlock = false; const stack = [];
  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i];
    for (const ch of line) {
      if (ch === "{") { depth++; if (depth === 2 && !inBlock) inBlock = true; }
      if (ch === "}") { depth--; if (inBlock && depth === 0) return flat; }
    }
    if (!inBlock) continue;
    const km = line.match(/^(\s+)([a-zA-Z][a-zA-Z0-9_-]*)\s*:\s*(.*)$/);
    if (!km) continue;
    const indent = km[1].length; const name = km[2]; const rhs = km[3].trim();
    const curDepth = Math.floor((indent - 2) / 2);
    while (stack.length > curDepth - 1) stack.pop();
    stack.push(name);
    if (rhs.startsWith('"')) {
      const m = rhs.match(/^"((?:[^"\\]|\\.)*)"/);
      if (m) flat[stack.join(".")] = m[1].replace(/\\\\/g, "\\").replace(/\\"/g, '"');
    }
  }
  return flat;
}
const used = new Set();
function walk(d) {
  const r = [];
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (["node_modules",".git","dist",".astro",".wrangler",".audit"].includes(e.name)) continue;
    const p = d + "/" + e.name;
    if (e.isDirectory()) r.push(...walk(p)); else if (/\.(astro|tsx|ts|jsx|js|mjs|cjs)$/.test(e.name)) r.push(p);
  }
  return r;
}
for (const f of walk("src")) {
  const c = fs.readFileSync(f, "utf8");
  for (const m of c.matchAll(/data-i18n(?:-title|-placeholder|-aria)?=["\']([\w.\-]+)["\']/g)) used.add(m[1]);
  for (const m of c.matchAll(/\bt\(["\']([\w.\-]+)["\']\s*\)/g)) used.add(m[1]);
  for (const m of c.matchAll(/_lookup\(["\']([\w.\-]+)["\']/g)) used.add(m[1]);
}
const src = fs.readFileSync(TS_FILE, "utf8");
const blocks = {};
for (const lang of SUPPORTED) blocks[lang] = extractBlock(src, lang);
const en = blocks.en;
const keepRe = /^(you@example\.com|https?:\/\/\S+|[\w.+-]+@[\w.-]+$|ChinaConnect|ChinaGuide AI|GitHub|Google|Apple|WeChat Pay|WeChat|Alipay|Didi|DiDi|Trip\.com|12306|Canton Fair|CIIE|Business Express|WFOE|JV|eSIM|SIM|VPN|AI|KFC|McDonald|Starbucks|UnionPay|Metro|Oppo|Vivo|Huawei|Xiaomi|QQ|Weibo|Taobao|JD\.com|Airalo|Holafly|Booking\.com|Agoda|Airbnb|Fliggy|Ctrip|Amap|Baidu|Pleco|TripAdvisor|Wise|Metro Now|Nihao China|China Mobile|China Unicom|China Telecom|¥|CNY|RMB|USD|EUR|GBP|JPY|KRW|HKD|SGD|THB|VND|Google Maps|Black Pearl|Michelin|PNG|OpeningHoursSpecification)$/i;
const englishWordRe = /^[A-Za-z][A-Za-z0-9'&.,()\-: ]+$/;
const byKey = {};
for (const lang of SUPPORTED.slice(1)) {
  const b = blocks[lang];
  for (const k of used) {
    if (!en[k]) continue;
    const ev = en[k].trim(); const lv = (b[k]||"").trim();
    if (!ev || !lv) continue;
    if (ev.toLowerCase() === lv.toLowerCase()) {
      if (keepRe.test(ev)) continue;
      if (!englishWordRe.test(ev)) continue;
      if (ev.startsWith("pricing.")) continue; // placeholder-like, handle separately
      (byKey[k] = byKey[k] || []).push(lang);
    }
  }
}
// also handle pricing.* placeholder values explicitly
for (const lang of SUPPORTED.slice(1)) {
  const b = blocks[lang];
  for (const k of used) {
    const ev = en[k]?.trim(); const lv = (b[k]||"").trim();
    if (!ev || !lv) continue;
    if (lv === k || lv.startsWith(k)) {
      (byKey[k] = byKey[k] || []).push(lang);
    }
  }
}
const out = { en: {}, leaks: {} };
for (const k of Object.keys(byKey).sort()) {
  out.leaks[k] = { en: en[k], langs: [...new Set(byKey[k])].sort() };
}
fs.writeFileSync(".audit/translations-leaks.json", JSON.stringify(out, null, 2), "utf8");
console.log("leak keys:", Object.keys(out.leaks).length);
for (const k of Object.keys(out.leaks)) {
  console.log(k, "| langs:", out.leaks[k].langs.length, "| en:", (out.leaks[k].en||"").slice(0,60));
}

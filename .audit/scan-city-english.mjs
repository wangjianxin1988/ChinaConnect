import fs from "node:fs";
import path from "node:path";
const dir = "src/data/cities-i18n/ja";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/;
const ASCII_WORD = /[A-Za-z]{2,}/;
function looksEnglish(s) {
  if (typeof s !== "string") return false;
  if (!s || s.length < 2) return false;
  if (CJK.test(s)) return false;
  if (/^[\d\s.,:%()+\-–/°NSEW&·]+$/.test(s)) return false;
  if (!ASCII_WORD.test(s)) return false;
  if (/^(UTC|http|https|\/|img|tel:|mailto:)/i.test(s)) return false;
  // exclude ids/slugs/paths
  if (/^[a-z0-9_-]+$/.test(s) && !s.includes(" ")) return false;
  return true;
}
const results = {};
let total = 0;
for (const f of files) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  const hits = [];
  (function walk(obj, keyPath) {
    if (Array.isArray(obj)) { obj.forEach((v, i) => walk(v, keyPath + "[" + i + "]")); return; }
    if (obj && typeof obj === "object") { for (const k of Object.keys(obj)) walk(obj[k], keyPath ? keyPath + "." + k : k); return; }
    if (looksEnglish(obj)) { hits.push({ path: keyPath, value: obj }); total++; }
  })(data, "");
  if (hits.length) results[f] = hits;
}
fs.writeFileSync(".audit/ja-city-english.json", JSON.stringify(results, null, 1));
console.log("files with english:", Object.keys(results).length, "total strings:", total);
// sample
const sample = Object.entries(results).slice(0, 3);
for (const [f, hits] of sample) {
  console.log("===", f, hits.length);
  for (const h of hits.slice(0, 8)) console.log("  ", h.path, "=>", JSON.stringify(h.value).slice(0, 100));
}

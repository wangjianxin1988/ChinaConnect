import fs from "node:fs";
import path from "node:path";
const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/;
const ASCII_WORD = /[A-Za-z]{2,}/;
function isEnglish(s) {
  if (!s || s.length < 3 || s.length > 300) return false;
  if (CJK.test(s)) return false;
  if (!ASCII_WORD.test(s)) return false;
  if (/^[\d\s.,:%()+\-–/°NSEW&·¥$€]+$/.test(s)) return false;
  if (/^(UTC|N\/A|TBD)$/i.test(s)) return false;
  if (s.includes("http") || s.includes("@")) return false;
  return true;
}
const files = ["visa", "accommodation", "dining", "communication", "departure", "emergency", "payment", "transport", "best-travel-times", "weather"];
const all = new Map();
for (const f of files) {
  const p = path.join("src/data/guide", f + ".ts");
  const s = fs.readFileSync(p, "utf8");
  const strs = [...s.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
  for (const st of strs) {
    if (isEnglish(st)) all.set(st, (all.get(st) || 0) + 1);
  }
}
console.log("english strings in guide data:", all.size);
const arr = [...all.keys()];
console.log(arr.slice(0, 30).join("\n"));
fs.writeFileSync(".audit/guide-english-strings.json", JSON.stringify(arr, null, 1));

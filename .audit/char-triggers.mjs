import fs from "node:fs";
import path from "node:path";
import { simplifiedCount, kanaCount, hanCount } from "./ja-residue.mjs";
const isDirty = (text) => {
  const n = simplifiedCount(text);
  if (n >= 2) return true;
  if (n >= 1 && kanaCount(text) === 0 && hanCount(text) >= 2) return true;
  return false;
};
const set = JSON.parse(fs.readFileSync(".audit/simplified-set.json", "utf8"));
const DIR = "src/data/cities-i18n/ja";
const strings = [];
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".json"))) {
  const data = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const walk = (o) => {
    if (typeof o === "string") { if (isDirty(o)) strings.push(o); }
    else if (Array.isArray(o)) o.forEach(walk);
    else if (o && typeof o === "object") for (const v of Object.values(o)) walk(v);
  };
  walk(data, "");
}
const uniq = [...new Set(strings)];
const charCount = {};
for (const s of uniq) {
  for (const ch of s) {
    if (set.includes(ch)) charCount[ch] = (charCount[ch] || 0) + 1;
  }
}
const sorted = Object.entries(charCount).sort((a, b) => b[1] - a[1]);
console.log("chars triggering (count of strings):");
console.log(sorted.map(([c, n]) => c + "(" + n + ")").join(" "));

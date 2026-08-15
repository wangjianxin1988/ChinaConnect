import fs from "node:fs";
import path from "node:path";
import { simplifiedCount, kanaCount, hanCount } from "./ja-residue.mjs";
const isDirty = (text) => {
  const n = simplifiedCount(text);
  if (n >= 2) return true;
  if (n >= 1 && kanaCount(text) === 0 && hanCount(text) >= 2) return true;
  return false;
};
const DIR = "src/data/cities-i18n/ja";
const strings = new Set();
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".json"))) {
  const data = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const walk = (o) => {
    if (typeof o === "string") { if (isDirty(o)) strings.add(o); }
    else if (Array.isArray(o)) o.forEach(walk);
    else if (o && typeof o === "object") for (const v of Object.values(o)) walk(v);
  };
  walk(data, "");
}
console.log("unique dirty:", strings.size);
[...strings].slice(0, 50).forEach((s) => console.log(JSON.stringify(s).slice(0, 90)));

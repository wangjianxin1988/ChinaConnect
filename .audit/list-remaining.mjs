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
const locations = [];
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".json"))) {
  const data = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const walk = (o, p) => {
    if (typeof o === "string") { if (isDirty(o)) locations.push({ f, p, t: o }); }
    else if (Array.isArray(o)) o.forEach((v, i) => walk(v, p + "[" + i + "]"));
    else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) walk(v, p ? p + "." + k : k);
  };
  walk(data, "");
}
const uniq = [...new Map(locations.map((l) => [l.t, l])).values()];
console.log("unique dirty:", uniq.length);
uniq.slice(0, 60).forEach((l) => console.log("[" + l.f + "] " + l.p + " = " + JSON.stringify(l.t).slice(0, 100)));

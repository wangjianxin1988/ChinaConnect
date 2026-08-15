import fs from "node:fs";
import { simplifiedCount, kanaCount, hanCount } from "./ja-residue.mjs";
const raw = fs.readFileSync("src/data/food/ja-food-overrides.ts", "utf8");
const d = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
console.log("food dict entries:", Object.keys(d).length);
const isDirty = (t) => {
  const n = simplifiedCount(t);
  if (n >= 2) return true;
  if (n >= 1 && kanaCount(t) === 0 && hanCount(t) >= 2) return true;
  return false;
};
const files = ["src/data/food/restaurants.ts", "src/data/food/categories.ts", "src/data/food/cities.ts"];
const missing = [];
for (const f of files) {
  const s = fs.readFileSync(f, "utf8");
  const re = /"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(s))) {
    const t = m[1];
    if (t.length >= 2 && /[\u4e00-\u9fff]/.test(t) && isDirty(t) && !d[t]) missing.push({ f: f.split("/").pop(), t });
  }
}
console.log("missing dirty:", missing.length);
missing.slice(0, 60).forEach((x) => console.log("  [" + x.f + "] " + x.t.slice(0, 80)));

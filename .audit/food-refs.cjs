const fs = require("fs"), path = require("path");
const needles = ["data/food/restaurants", "data/food/cities-food-data", "data/food/sample-restaurants", "data/food/categories", "data/food/cities"];
function walk(d, out) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) { walk(p, out); continue; }
    if (!f.endsWith(".ts") && !f.endsWith(".tsx") && !f.endsWith(".astro") && !f.endsWith(".mjs")) continue;
    const s = fs.readFileSync(p, "utf8");
    for (const n of needles) if (s.includes(n)) { out.push(p.replace(/\\/g, "/") + " :: " + n); break; }
  }
  return out;
}
console.log(walk("src", []).join("\n"));

const fs = require("fs"), path = require("path");
const needles = ["cities-food-data", "sample-restaurants", "SAMPLE_RESTAURANTS", "CITIES_FOOD_DATA", "CITY_FOOD_DATA"];
function walk(d, out) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) { walk(p, out); continue; }
    if (!f.endsWith(".ts") && !f.endsWith(".tsx") && !f.endsWith(".astro")) continue;
    const s = fs.readFileSync(p, "utf8");
    for (const n of needles) {
      if (s.includes(n)) { out.push(p.replace(/\\/g, "/") + " :: " + n); break; }
    }
  }
  return out;
}
console.log(walk("src", []).join("\n") || "none");

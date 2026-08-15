const fs = require("fs"), path = require("path");
function walk(d, out) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) { walk(p, out); continue; }
    if (!f.endsWith(".ts") && !f.endsWith(".tsx") && !f.endsWith(".astro")) continue;
    const s = fs.readFileSync(p, "utf8");
    if (s.includes('city." +') || s.includes("localCityName") || s.includes("cityNameForLang") || s.includes("getCityName")) out.push(p.replace(/\\/g, "/"));
  }
  return out;
}
console.log(walk("src", []).join("\n") || "none");

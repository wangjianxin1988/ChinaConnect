const fs = require("fs"), path = require("path");
const targets = ["best-travel-times", "weather", "payment/payment-guide", "business/company-registration", "business/etiquette", "business/expo-calendar", "business/invitation-letter", "business/translation"];
const roots = ["src"];
function walk(d, hits) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) { walk(p, hits); continue; }
    if (!f.endsWith(".ts") && !f.endsWith(".tsx") && !f.endsWith(".astro")) continue;
    const s = fs.readFileSync(p, "utf8");
    for (const t of targets) {
      if (s.includes('"' + t + '"') || s.includes("'" + t + "'") || s.includes("@/" + t)) {
        (hits[t] ||= []).push(p);
      }
    }
  }
  return hits;
}
const hits = walk("src", {});
for (const [t, ps] of Object.entries(hits)) console.log(t + ": " + [...new Set(ps)].join(", "));

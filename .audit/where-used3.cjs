const fs = require("fs"), path = require("path");
function walk(d, needle, out) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) { walk(p, needle, out); continue; }
    const s = fs.readFileSync(p, "utf8");
    if (s.includes(needle)) out.push(p.replace(/\\/g, "/"));
  }
  return out;
}
console.log("best-travel refs:", walk("src", "best-travel", []).join(", ") || "none");
console.log("weather.ts refs:", walk("src", "guide/weather", []).join(", ") || "none");
console.log("payment-guide refs:", walk("src", "payment-guide", []).join(", ") || "none");

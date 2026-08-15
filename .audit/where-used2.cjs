const fs = require("fs"), path = require("path");
const roots = ["src"];
const re = /from\s+["'][^"']*?(best-travel-times|guide\/weather|payment\/payment-guide|guide\/business)[^"']*["']/g;
function walk(d, out) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) { walk(p, out); continue; }
    if (!f.endsWith(".ts") && !f.endsWith(".tsx") && !f.endsWith(".astro")) continue;
    const s = fs.readFileSync(p, "utf8");
    let m;
    while ((m = re.exec(s))) out.push(p.replace(/\\/g, "/") + " :: " + m[1] + " :: " + m[0].trim());
  }
  return out;
}
console.log(walk("src", []).join("\n"));

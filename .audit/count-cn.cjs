const fs = require("fs"), path = require("path");
const roots = ["src/data", "src/lib"];
const out = [];
function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) { walk(p); continue; }
    if (!f.endsWith(".ts") && !f.endsWith(".json")) continue;
    const s = fs.readFileSync(p, "utf8");
    const cn = (s.match(/\w*Cn\s*:\s*["\[]/g) || []).length;
    if (cn) out.push(cn + "  " + p);
  }
}
for (const r of roots) if (fs.existsSync(r)) walk(r);
out.sort((a, b) => +b.split(" ")[0] - +a.split(" ")[0]);
console.log(out.join("\n"));

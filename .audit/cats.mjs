import fs from "node:fs";
import path from "node:path";
const files = [];
function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith(".json")) files.push(p); } }
walk("src/data/cities-i18n/ja");
const cats = new Set();
for (const f of files) {
  const data = JSON.parse(fs.readFileSync(f, "utf8"));
  for (const a of data.attractions || []) if (a.category) cats.add(a.category);
}
console.log([...cats].sort().join(", "));

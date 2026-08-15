const fs = require("fs"), path = require("path");
const pages = [];
function walk(d, prefix) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) { walk(p, prefix + "/" + f); continue; }
    if (!f.endsWith(".astro")) continue;
    pages.push((prefix + "/" + f).replace(/\/index\.astro$/, "").replace(/\.astro$/, ""));
  }
}
walk("src/pages/[lang]", "");
const scanned = JSON.parse(fs.readFileSync(".audit/ja-js-scan.json", "utf8"));
console.log("template routes under [lang]:", pages.length);
for (const p of pages.sort()) {
  console.log(p);
}

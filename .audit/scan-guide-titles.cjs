const fs = require("fs");
const path = require("path");
const dirs = ["src/pages/[lang]/guide", "src/pages/[lang]/guide/business"];
for (const d of dirs) {
  for (const f of fs.readdirSync(d)) {
    if (!f.endsWith(".astro")) continue;
    const src = fs.readFileSync(path.join(d, f), "utf8");
    const m = src.match(/const pageTitle = ([^\n]+)/);
    if (m) console.log(f, "::", m[1].trim().slice(0, 140));
  }
}

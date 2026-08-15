const fs = require("fs");
const src = fs.readFileSync("src/pages/[lang]/guide/attractions.astro", "utf8");
const idx = src.indexOf("Forbidden City");
console.log(idx);
if (idx > 0) console.log(src.slice(Math.max(0, idx - 1500), idx + 800));

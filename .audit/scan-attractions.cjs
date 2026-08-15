const fs = require("fs");
const src = fs.readFileSync("src/pages/[lang]/city/[slug]/attractions.astro", "utf8");
const idx = src.indexOf("catLabels");
console.log(src.slice(idx + 1150, idx + 1500));

const fs = require("fs");
const src = fs.readFileSync("src/pages/[lang]/city/[slug]/attractions.astro", "utf8");
const i = src.indexOf("const catLabels =");
console.log(src.slice(i, i + 300));

const fs = require("fs");
const src = fs.readFileSync("src/pages/[lang]/city/[slug].astro", "utf8");
const idx = src.indexOf("AppRecommendationsSection");
console.log(src.slice(idx - 300, idx + 700));

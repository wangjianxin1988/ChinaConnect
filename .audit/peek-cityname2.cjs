const fs = require("fs");
const s = fs.readFileSync("src/pages/[lang]/city/[slug]/attractions.astro", "utf8");
const idx = s.indexOf("localCityName");
console.log(s.slice(Math.max(0, idx - 400), idx + 300));

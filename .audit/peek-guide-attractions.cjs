const fs = require("fs");
const s = fs.readFileSync("src/pages/[lang]/guide/attractions.astro", "utf8");
console.log(s.slice(0, 3000));

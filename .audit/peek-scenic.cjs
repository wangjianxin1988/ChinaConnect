const fs = require("fs");
const s = fs.readFileSync("src/pages/[lang]/scenic-spots/index.astro", "utf8");
console.log(s.slice(0, 2200));

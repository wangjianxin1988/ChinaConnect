const fs = require("fs");
const s = fs.readFileSync("src/pages/[lang]/food/[id].astro", "utf8");
console.log(s.slice(2500, 4500));

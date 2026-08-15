const fs = require("fs");
const s = fs.readFileSync("src/pages/[lang]/guide/business/index.astro", "utf8");
const m = s.match(/href:[^\n]+/g) || [];
console.log(m.join("\n"));

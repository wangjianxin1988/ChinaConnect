const fs = require("fs");
const s = fs.readFileSync("src/pages/[lang]/guide/business/index.astro", "utf8");
const i = s.indexOf("guide/business/invitation-letter");
console.log(JSON.stringify(s.slice(i - 30, i + 45)));

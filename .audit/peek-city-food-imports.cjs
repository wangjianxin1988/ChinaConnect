const fs = require("fs");
const s = fs.readFileSync("src/pages/[lang]/city/[slug]/food.astro", "utf8");
const imports = s.match(/import[^\n]+/g) || [];
console.log(imports.join("\n"));

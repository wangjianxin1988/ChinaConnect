const fs = require("fs");
const s = fs.readFileSync("src/i18n/translations.ts", "utf8");
console.log("length:", s.length);
// find ja section start and print a sample
const idx = s.indexOf("ja:");
console.log("ja section index:", idx);
console.log(s.slice(idx, idx + 800));

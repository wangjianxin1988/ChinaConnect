const fs = require("fs");
const s = fs.readFileSync("src/i18n/translations.ts", "utf8");
const m = s.match(/city\.beijing\.name[^\n]*/);
console.log(m ? m[0] : "not found");
const m2 = s.match(/city\.guangzhou\.name[^\n]*/);
console.log(m2 ? m2[0] : "guangzhou not found");

import fs from "node:fs";
const s = fs.readFileSync("src/i18n/translations.ts", "utf8");
const jaStart = s.indexOf("ja: {");
const i = s.indexOf("nav: {", jaStart);
const end = s.indexOf("\n    },\n", i);
console.log(s.slice(i, end + 8).slice(0, 900));

const fs = require("fs");
const s = fs.readFileSync("src/i18n/translations.ts", "utf8");
for (const pat of ['"city.beijing.name"', 'city.beijing', 'city.name:']) {
  const i = s.indexOf(pat);
  console.log(pat, "->", i);
}

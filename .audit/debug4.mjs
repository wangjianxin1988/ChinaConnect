import fs from "node:fs";
const text = fs.readFileSync("src/i18n/translations.ts", "utf8");
const lines = text.split(/\r?\n/);
let koStart = -1;
for (let i = 0; i < lines.length; i += 1) {
  if (/^  ko: \{/.test(lines[i])) { koStart = i; break; }
}
console.log("koStart line:", koStart + 1);
// Print lines around scenicSpots in raw file
for (let i = 12825; i < 12840; i += 1) console.log(i + 1, JSON.stringify(lines[i]));

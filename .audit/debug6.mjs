import fs from "node:fs";
const text = fs.readFileSync("src/i18n/translations.ts", "utf8");
const lines = text.split(/\r?\n/);
for (let i = 8629; i < 12910; i += 1) {
  if (/^\s*th\s*:\s*\{/.test(lines[i])) console.log("th: { at line", i + 1, JSON.stringify(lines[i]));
}

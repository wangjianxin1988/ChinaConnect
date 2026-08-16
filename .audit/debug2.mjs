import fs from "node:fs";
const text = fs.readFileSync("src/i18n/translations.ts", "utf8");
const lines = text.split(/\r?\n/);
const LANGS = ["en", "ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"];
// find scenicSpots occurrences with line numbers
for (let i = 0; i < lines.length; i += 1) {
  if (lines[i].trim() === "scenicSpots: {") {
    // find current top-level block: scan backwards for ^  lang: {
    let j = i;
    let block = "?";
    while (j >= 0) {
      const m = /^  (["']?)([a-zA-Z-]{2,10})\1: \{/.exec(lines[j]);
      if (m) { block = m[2]; break; }
      j -= 1;
    }
    console.log("line", i + 1, "block:", block);
  }
}

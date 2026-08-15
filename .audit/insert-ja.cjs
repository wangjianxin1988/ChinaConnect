const fs = require("fs");
const p = "src/i18n/translations.ts";
let lines = fs.readFileSync(p, "utf8").split(/\r?\n/);
const jaStart = 4326; // line index of "  ja: {"
const koStart = 8607;

// Insertion helper: find anchor (exact line content) within ja block, insert new lines after it
function insertAfter(anchor, newLines) {
  for (let i = jaStart; i < koStart; i++) {
    if (lines[i] === anchor) {
      lines.splice(i + 1, 0, ...newLines);
      koStart += newLines.length; // keep koStart in sync
      return true;
    }
  }
  console.log("ANCHOR NOT FOUND:", anchor);
  return false;
}
// NOTE: koStart captured by value in closure — use mutable var instead

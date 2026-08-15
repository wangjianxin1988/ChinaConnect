const fs = require("fs");
const s = fs.readFileSync("src/pages/[lang]/food/index.astro", "utf8");
const lines = s.split("\n");
// find lines that reference category rendering
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (l.includes("CATEGORY_ORDER") || l.includes("getCategoryLabel") || l.includes("labels[lang]") || l.includes("labels[") || l.includes("category.label") || l.includes(".label(")) console.log((i + 1) + ": " + l.trim().slice(0, 160));
}
console.log("---- total lines:", lines.length);

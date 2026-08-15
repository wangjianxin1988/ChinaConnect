const fs = require("fs");
const s = fs.readFileSync("src/pages/[lang]/food/index.astro", "utf8");
console.log("=== [lang]/food/index.astro imports/usage ===");
const m = s.match(/import[^\n]+/g) || [];
console.log(m.join("\n"));
// dirty hardcoded lines
const lines = s.split("\n");
lines.forEach((l, i) => {
  if (/[\u4e00-\u9fff]/.test(l) && (l.includes(">") || l.includes("=")) && !l.trim().startsWith("//") && !l.includes("import")) {
    const t = l.trim();
    if (t.length < 120 && t.length > 3) console.log((i + 1) + ": " + t);
  }
});

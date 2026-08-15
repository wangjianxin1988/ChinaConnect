const fs = require("fs");
const s = fs.readFileSync("src/pages/[lang]/city/[slug]/hotels.astro", "utf8");
const lines = s.split("\n");
lines.forEach((l, i) => {
  if (/[\u4e00-\u9fff]/.test(l) && (l.includes(">") || l.includes("=")) && !l.trim().startsWith("//") && !l.includes("import")) {
    const t = l.trim();
    if (t.length < 130 && t.length > 4) console.log((i + 1) + ": " + t);
  }
});

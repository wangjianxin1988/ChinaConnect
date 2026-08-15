const fs = require("fs");
const s = fs.readFileSync("src/components/apps/AppRecommendationsSection.tsx", "utf8");
const lines = s.split("\n");
lines.forEach((l, i) => {
  if (/[\u4e00-\u9fff]/.test(l) && !l.trim().startsWith("//") && !l.includes("import") && !l.includes("nameZh") && !l.includes("labelZh")) {
    const t = l.trim();
    if (t.length < 130 && t.length > 3) console.log((i + 1) + ": " + t);
  }
});
console.log("--- category label usage ---");
lines.forEach((l, i) => { if (l.includes("labelZh") || l.includes("CATEGORY")) console.log((i + 1) + ": " + l.trim().slice(0, 120)); });

const fs = require("fs");
const s = fs.readFileSync("src/pages/[lang]/food/index.astro", "utf8");
const lines = s.split("\n");
lines.forEach((l, i) => {
  if (/CATEGORY_CONFIG|labels\[|\.label|labelZh/.test(l) && (i < 120 || i > 180)) console.log((i + 1) + ": " + l.trim().slice(0, 140));
});

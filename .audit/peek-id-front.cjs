const fs = require("fs");
const p = "src/pages/[lang]/food/[id].astro";
const s = fs.readFileSync(p, "utf8");
const lines = s.split("\n");
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (l.includes("restaurantDetail") && i < 70) console.log((i + 1) + ": " + l);
}

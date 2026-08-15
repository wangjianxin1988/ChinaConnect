const fs = require("fs");
const s = fs.readFileSync("src/components/city/AttractionsSection.tsx", "utf8");
const lines = s.split("\n");
lines.forEach((l, i) => {
  if (/category|\.type|badge/i.test(l) && !l.trim().startsWith("//")) {
    const t = l.trim();
    if (t.length < 130) console.log((i + 1) + ": " + t);
  }
});

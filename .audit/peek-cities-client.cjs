const fs = require("fs");
const s = fs.readFileSync("src/components/city/CitiesListClient.tsx", "utf8");
const lines = s.split("\n");
lines.forEach((l, i) => {
  if (/[\u4e00-\u9fff]/.test(l) && !l.trim().startsWith("//") && !l.includes("import") && !l.includes("nameZh")) {
    const t = l.trim();
    if (t.length < 110 && t.length > 3) console.log((i + 1) + ": " + t);
  }
});

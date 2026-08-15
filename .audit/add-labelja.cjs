const fs = require("fs");
const p = "src/data/cities/tier-data.ts";
let s = fs.readFileSync(p, "utf8");
const orig = s;
const tiers = {
  S: ["label: \"S-Tier\",", 'labelJa: "S級都市",'],
  A: ["label: \"A-Tier\",", 'labelJa: "A級都市",'],
  B: ["label: \"B-Tier\",", 'labelJa: "B級都市",'],
  C: ["label: \"C-Tier\",", 'labelJa: "C級都市",'],
  D: ["label: \"D-Tier\",", 'labelJa: "D級都市",'],
};
let n = 0;
for (const [tier, [a, b]] of Object.entries(tiers)) {
  const idx = s.indexOf(a);
  if (idx === -1) { console.log("NOT FOUND for " + tier); continue; }
  s = s.slice(0, idx) + a + "\n    " + b + s.slice(idx + a.length);
  n++;
}
fs.writeFileSync(p, s);
console.log("added labelJa for", n, "tiers; changed:", orig !== s);

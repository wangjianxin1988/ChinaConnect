const fs = require("fs");
const s = fs.readFileSync("src/components/city/CitiesListClient.tsx", "utf8");
console.log("length:", s.length);
// search for tier labels
for (const pat of ["S级", "A级", "B级", "长三角", "山东", "tier", "region"]) {
  const i = s.indexOf(pat);
  if (i !== -1) console.log("'" + pat + "' at " + i + ": " + s.slice(Math.max(0, i - 150), i + 150).replace(/\n/g, " "));
}

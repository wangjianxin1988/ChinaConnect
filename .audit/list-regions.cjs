const fs = require("fs");
const s = fs.readFileSync("src/data/cities/tier-data.ts", "utf8");
const regions = [...new Set([...s.matchAll(/region:\s*"([^"]+)"/g)].map((m) => m[1]))];
console.log(regions.join(", "));

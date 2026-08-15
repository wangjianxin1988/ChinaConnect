const fs = require("fs");
const s = fs.readFileSync("src/data/cities/tier-data.ts", "utf8");
const i = s.indexOf("TIER_CONFIG");
console.log(s.slice(i, i + 900));

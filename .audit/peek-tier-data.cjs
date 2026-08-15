const fs = require("fs");
const s = fs.readFileSync("src/data/cities/tier-data.ts", "utf8");
console.log(s.slice(0, 2000));

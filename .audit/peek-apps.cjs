const fs = require("fs");
const s = fs.readFileSync("src/data/apps/app-recommendations.ts", "utf8");
console.log("length:", s.length);
console.log(s.slice(0, 2500));

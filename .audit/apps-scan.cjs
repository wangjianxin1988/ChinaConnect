const fs = require("fs");
const src = fs.readFileSync("src/data/apps/app-recommendations.ts", "utf8");
const idx = src.indexOf("Trip.com Trains");
console.log(src.slice(idx - 400, idx + 500));

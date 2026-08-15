const fs = require("fs");
const s = fs.readFileSync("src/data/food/categories.ts", "utf8");
console.log(s.slice(0, 3500));

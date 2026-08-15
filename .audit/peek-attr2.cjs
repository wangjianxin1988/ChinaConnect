const fs = require("fs");
const s = fs.readFileSync("src/components/city/AttractionsSection.tsx", "utf8");
console.log("length:", s.length);
const i = s.indexOf("category");
console.log(s.slice(Math.max(0, i - 300), i + 300));

const fs = require("fs");
const s = fs.readFileSync("src/components/city/AttractionCard.tsx", "utf8");
console.log("length:", s.length);
const i = s.indexOf("category");
console.log(i === -1 ? "no category ref" : s.slice(Math.max(0, i - 250), i + 250));

const fs = require("fs");
const s = fs.readFileSync("src/components/Guide/AccommodationGuideClient.tsx", "utf8");
const i = s.indexOf("featuresCn.map");
console.log(s.slice(i - 100, i + 700));

const fs = require("fs");
const s = fs.readFileSync("src/components/city/CityTierBadge.tsx", "utf8");
const i = s.indexOf("labelZh");
console.log(s.slice(Math.max(0, i - 400), i + 400));

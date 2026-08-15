const fs = require("fs");
const src = fs.readFileSync("src/components/city/CityMap.tsx", "utf8");
const i = src.indexOf("<DynamicMap");
console.log(src.slice(i, i + 500));

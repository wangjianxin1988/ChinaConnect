const fs = require("fs");
const src = fs.readFileSync("src/components/city/CityMap.tsx", "utf8");
const idx = src.indexOf("interface CityMapProps");
console.log(idx > 0 ? src.slice(idx, idx + 400) : "no props interface");
const i2 = src.indexOf("Loading map");
console.log("--- loading map ctx ---");
console.log(src.slice(i2 - 500, i2 + 250));

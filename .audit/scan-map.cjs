const fs = require("fs");
const src = fs.readFileSync("src/components/Map/DynamicMap.tsx", "utf8");
const idx = src.indexOf("Loading map");
console.log(src.slice(Math.max(0, idx - 700), idx + 200));

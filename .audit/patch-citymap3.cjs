const fs = require("fs");
const p = "src/components/city/CityMap.tsx";
let src = fs.readFileSync(p, "utf8");
const r = src.replace('<DynamicMap\n        initialLocation={initialLocation}', '<DynamicMap\n        lang={lang}\n        initialLocation={initialLocation}');
fs.writeFileSync(p, src.replace(r === src ? src : r, r));
console.log("passed lang to DynamicMap:", r !== src || src.includes("lang={lang}"));

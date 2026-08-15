const fs = require("fs");
const s = fs.readFileSync("src/components/city/CitiesListClient.tsx", "utf8");
const idx = s.indexOf(".region");
console.log(s.slice(Math.max(0, idx - 500), idx + 500));

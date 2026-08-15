const fs = require("fs");
const s = fs.readFileSync("src/components/city/CitiesListClient.tsx", "utf8");
const i = s.indexOf("const t =");
console.log(s.slice(Math.max(0, i - 300), i + 300));

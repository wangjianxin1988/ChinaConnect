const fs = require("fs");
const s = fs.readFileSync("src/lib/sos-service-worker.ts", "utf8");
const i = s.indexOf("Cn");
console.log(s.slice(Math.max(0, i - 600), i + 800));

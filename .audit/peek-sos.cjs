const fs = require("fs");
const s = fs.readFileSync("src/lib/sos-service-worker.ts", "utf8");
const re = /\w*Cn\s*:\s*["']([^"']+)["']/g;
let x;
while ((x = re.exec(s))) console.log("Cn:", x[1]);

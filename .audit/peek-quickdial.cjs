const fs = require("fs");
const s = fs.readFileSync("src/components/Emergency/QuickDial.tsx", "utf8");
console.log(s.slice(0, 2000));

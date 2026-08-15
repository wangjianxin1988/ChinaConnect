const fs = require("fs");
const p = "src/data/cities/tier-data.ts";
let s = fs.readFileSync(p, "utf8");
const orig = s;
s = s.replace(
  "    label: string;\n    labelZh: string;",
  "    label: string;\n    labelJa: string;\n    labelZh: string;"
);
fs.writeFileSync(p, s);
console.log("changed:", orig !== s);

const fs = require("fs");
const p = ".audit/gen-guide-ja-overrides.mjs";
let s = fs.readFileSync(p, "utf8");
const old = `  "src/data/guide/transport.ts","src/data/guide/visa.ts","src/data/cultural-warnings.ts",
  "src/data/price-transparency.ts","src/data/scam-prevention.ts"
];`;
const nw = `  "src/data/guide/transport.ts","src/data/guide/visa.ts","src/data/cultural-warnings.ts",
  "src/data/price-transparency.ts","src/data/scam-prevention.ts",
  "src/data/guide/business/company-registration.ts","src/data/guide/business/etiquette.ts",
  "src/data/guide/business/expo-calendar.ts","src/data/guide/business/invitation-letter.ts",
  "src/data/guide/business/translation.ts"
];`;
if (s.includes(old)) { s = s.replace(old, nw); fs.writeFileSync(p, s); console.log("FILES list updated"); }
else console.log("pattern not found");

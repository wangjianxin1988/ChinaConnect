import fs from "node:fs";
const s = fs.readFileSync("src/i18n/translations.ts", "utf8");
const re = /\n  (\w+|"[^"]+"): \{/g;
const out = [];
let m;
while ((m = re.exec(s))) out.push(m[1]);
console.log(out.slice(0, 14).join(" | "));

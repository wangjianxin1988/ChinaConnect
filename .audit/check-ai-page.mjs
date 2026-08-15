import fs from "node:fs";
const src = fs.readFileSync("src/i18n/translations.ts", "utf8");
const m = src.match(/ja: \{[\s\S]*?aiPage: \{/);
const start = m.index + m[0].length - "aiPage: {".length;
let depth = 0, end = -1;
for (let i = start; i < src.length; i++) { if (src[i] === "{") depth++; else if (src[i] === "}") { depth--; if (depth === 0) { end = i; break; } } }
const block = src.slice(start, end + 1);
const keys = [...block.matchAll(/^\s{6}(\w+):/gm)].map((x) => x[1]);
console.log("ja aiPage keys:", keys.join(", "));
console.log("has description:", keys.includes("description"));
console.log("has pageDescription:", keys.includes("pageDescription"));

import fs from "node:fs";
const s = fs.readFileSync("src/i18n/translations.ts", "utf8");
// find all top-level namespace keys in en block
const enBlock = s.slice(s.indexOf("en: {"), s.indexOf("\n  },\n", s.indexOf("en: {")));
const ns = [...enBlock.matchAll(/^\s{4}(\w+): \{/gm)].map(m => m[1]);
console.log("en namespaces count:", ns.length);
console.log(ns.join(", "));

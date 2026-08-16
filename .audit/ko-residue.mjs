import fs from "node:fs";
import { isKeepableToken } from "../scripts/lib/translation-accept.mjs";
const strings = JSON.parse(fs.readFileSync(".audit/guide-strings.json","utf8")).strings;
const text = fs.readFileSync("src/data/guide/overrides-ko.ts","utf8");
const re = /^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$/gm;
const un = (s)=>s.replace(/\\"/g,'"').replace(/\\\\/g,'\\').replace(/\\n/g,"\n");
const map = new Map();
for (const m of text.matchAll(re)) map.set(un(m[1]), un(m[2]));
const dis = /[\u3400-\u9fff\u3040-\u30ff\u0400-\u04ff\u0600-\u06ff\u0e00-\u0e7f]/;
console.log("=== BAD (identity non-keepable) ===");
for (const k of strings) {
  const v = map.get(k);
  if (v === k && !isKeepableToken(k)) console.log("  ", JSON.stringify(k.slice(0,120)));
}
console.log("=== CONT (disallowed scripts in value) ===");
for (const k of strings) {
  const v = map.get(k);
  if (v !== k && dis.test(v)) console.log("  ", JSON.stringify(k.slice(0,70)), "=>", JSON.stringify(v.slice(0,110)));
}

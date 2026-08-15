import fs from "node:fs";
const s = fs.readFileSync("src/i18n/translations.ts", "utf8");
// find ja block start
const jaStart = s.indexOf("ja: {");
const i = s.indexOf("businessGuidePage: {", jaStart);
const end = s.indexOf("\n    },\n", i);
const sec = s.slice(i, end);
const keys = [...sec.matchAll(/^\s{6}(\w+):/gm)].map((m) => m[1]);
console.log("JA businessGuidePage keys", keys.length);
for (const k of keys) {
  const re = new RegExp("^\\s{6}" + k + ': "((?:[^"\\\\]|\\\\.)*)"', "m");
  const m = sec.match(re);
  console.log(k, "=>", m ? m[1].slice(0, 100) : "(?)");
}

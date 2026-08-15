import fs from "node:fs";
const s = fs.readFileSync("src/i18n/translations.ts", "utf8");
const start = s.indexOf("ja: {");
const i = s.indexOf("guidePage: {", start);
const end = s.indexOf("\n    },\n", i);
const sec = s.slice(i, end);
const keys = [...sec.matchAll(/^\s{6}(\w+):/gm)].map((m) => m[1]);
console.log("JA guidePage keys", keys.length);
const want = keys.filter((k) => /expo|invitation|registration|etiquette|translation|TitleShort|Subtitle|StageTitle|StageDescription/.test(k));
for (const k of want) {
  const re = new RegExp("^\\s{6}" + k + ': "((?:[^"\\\\]|\\\\.)*)"', "m");
  const m = sec.match(re);
  console.log(k, "=>", m ? m[1].slice(0, 90) : "(?)");
}

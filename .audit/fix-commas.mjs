import fs from "node:fs";

// Fix translations.ts: translationTitle missing comma before registrationDescription
const p1 = "src/i18n/translations.ts";
let s = fs.readFileSync(p1, "utf8").replace(/\r\n/g, "\n");
const re = /translationTitle: "([^"]*)"( *)registrationDescription:/g;
let count = 0;
s = s.replace(re, (m, title, spaces) => {
  count++;
  return `translationTitle: "${title}",\n      registrationDescription:`;
});
const tmp1 = p1 + ".tmp";
fs.writeFileSync(tmp1, s);
fs.renameSync(tmp1, p1);
console.log("translations.ts comma fixes:", count);

// Fix ja-overrides.ts: add comma after last original entry
const p2 = "src/data/guide/ja-overrides.ts";
let o = fs.readFileSync(p2, "utf8").replace(/\r\n/g, "\n");
const re2 = /("预防措施": "予防対策")(\n\s*")/;
const m2 = re2.exec(o);
if (m2) {
  o = o.slice(0, m2.index) + m2[1] + "," + m2[2] + o.slice(m2.index + m2[0].length);
  console.log("ja-overrides comma fixed");
} else {
  console.log("ja-overrides pattern not found");
}
const tmp2 = p2 + ".tmp";
fs.writeFileSync(tmp2, o);
fs.renameSync(tmp2, p2);

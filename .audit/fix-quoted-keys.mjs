import fs from "node:fs";
const p = "src/i18n/components-strings.ts";
let s = fs.readFileSync(p, "utf8");
let n = 0;
// fix unquoted zh-CN / zh-TW keys (line-start, 4-space indent)
const re1 = /^    zh-CN:/gm;
const re2 = /^    zh-TW:/gm;
const c1 = (s.match(re1) || []).length;
const c2 = (s.match(re2) || []).length;
s = s.replace(re1, '    "zh-CN":').replace(re2, '    "zh-TW":');
n = c1 + c2;
fs.writeFileSync(p + ".tmp", s);
fs.renameSync(p + ".tmp", p);
console.log("fixed unquoted keys:", n);

import fs from "node:fs";
const f = "src/i18n/translations.ts";
let s = fs.readFileSync(f, "utf8");
const jaIdx = s.indexOf("ja: {");
const before = s.slice(0, jaIdx);
const after = s.slice(jaIdx);
const from = "taxTip2: \"Minimum purchase: 500 CNY at participating stores\"";
const to = "taxTip2: \"対象店舗での最低購入額は500元\"";
if (!after.includes(from)) { console.error("not found in ja block"); process.exit(1); }
fs.writeFileSync(f, before + after.split(from).join(to), "utf8");
console.log("ok");

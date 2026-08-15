import fs from "fs";
const file = "src/pages/[lang]/city/[slug].astro";
let t = fs.readFileSync(file, "utf8");
const old1 = `{method.method === 'Alipay' ? '💳' : method.method === 'WeChat Pay' ? '💩' : method.method === 'Cash' ? '💵' : '💰'}`;
const new1 = `{(method.method || method.nameEn) === 'Alipay' ? '💳' : (method.method || method.nameEn) === 'WeChat Pay' ? '💩' : (method.method || method.nameEn) === 'Cash' ? '💵' : '💰'}`;
const old2 = `{ct(lang, payKey(method.method), method.method)}`;
const new2 = `{ct(lang, payKey(method.method || method.nameEn), method.method || method.nameEn)}`;
if (!t.includes(old1) || !t.includes(old2)) { console.error("pattern not found"); process.exit(1); }
t = t.replace(old1, new1).replace(old2, new2);
fs.writeFileSync(file, t, "utf8");
console.log("patched payment fallback");

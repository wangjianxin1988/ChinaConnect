import fs from "node:fs";
const SIMP = new Set("东场门车华广无亿观电话语汉银红绿边达这还让认说读题确设计论记讲请谢对错买卖进开关统继续线组纸张当时际间问试验证标规则单据选择编辑译预订换货费项账户码务机价学长短马鸟鱼龙凤飞风兰丝乐书画齐齿龟铜铁钢沟桥灶亩烟询邮证题颖频伟仅汉沪苏杭徽赣粤闽湘鄂豫冀晋鲁辽吉黑滇黔蜀渝陇蒙疆藏青宁桂琼台港澳".split(""));
const files = [];
const walkDir = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
  const p = dir + "/" + e.name;
  if (e.isDirectory()) walkDir(p); else if (e.name.endsWith(".json")) files.push(p);
});
walkDir("src/data/cities-i18n/ja");
const byFile = {};
let total = 0;
for (const f of files) {
  const data = JSON.parse(fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n"));
  const hits = [];
  (function walk(obj, path) {
    if (Array.isArray(obj)) { obj.forEach((v, i) => walk(v, path + "[" + i + "]")); return; }
    if (obj && typeof obj === "object") { for (const k of Object.keys(obj)) walk(obj[k], path ? path + "." + k : k); return; }
    if (typeof obj === "string" && obj.length > 1 && obj.length < 300) {
      const c = [...obj].filter((ch) => SIMP.has(ch));
      if (c.length > 0) hits.push({ path, value: obj, chars: [...new Set(c)].join("") });
    }
  })(data, "");
  if (hits.length) { byFile[f] = hits; total += hits.length; }
}
console.log("files with simplified-only residue:", Object.keys(byFile).length, "strings:", total);
for (const [f, hits] of Object.entries(byFile)) {
  console.log("=== " + f + " (" + hits.length + ")");
  for (const h of hits.slice(0, 8)) console.log("  [" + h.chars + "] " + h.path + " => " + JSON.stringify(h.value).slice(0, 110));
  if (hits.length > 8) console.log("  ... +" + (hits.length - 8) + " more");
}

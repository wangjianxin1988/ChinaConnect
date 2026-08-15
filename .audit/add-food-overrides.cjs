const fs = require("fs");
const p = "src/data/food/ja-food-overrides.ts";
let s = fs.readFileSync(p, "utf8");
const orig = s;
const adds = {
  "上海市黄浦区中山东一路18号": "上海市黄浦区中山東一路18号",
  "泰安门": "泰安門",
  "上海市黄浦区中山东二路12号": "上海市黄浦区中山東二路12号",
  "原味椰子炖鸡": "原味ココナッツ蒸し鶏",
  "花旗参炖竹丝鸡": "花旗参蒸し烏骨鶏",
  "南京市秦淮区夫子庙平江府路": "南京市秦淮区夫子廟平江府路",
};
let endIdx = s.lastIndexOf("};");
for (const [k, v] of Object.entries(adds)) {
  if (s.includes(JSON.stringify(k))) { console.log("already:", k); continue; }
  const line = "  " + JSON.stringify(k) + ": " + JSON.stringify(v) + ",\n";
  s = s.slice(0, endIdx) + line + s.slice(endIdx);
}
fs.writeFileSync(p, s);
console.log("changed:", orig !== s);

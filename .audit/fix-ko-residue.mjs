import fs from "node:fs";
const real = new Set(JSON.parse(fs.readFileSync(".audit/guide-strings.json","utf8")).strings);
const file = "src/data/guide/overrides-ko.ts";
let text = fs.readFileSync(file,"utf8");
const re = /^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$/gm;
const un = (s)=>s.replace(/\\"/g,'"').replace(/\\\\/g,'\\').replace(/\\n/g,"\n");
const esc = (s)=>s.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n");
const map = new Map();
for (const m of text.matchAll(re)) map.set(un(m[1]), un(m[2]));
const fixes = {
  "来宾姓名": "방문자 성명",
  "约翰·史密斯": "존 스미스",
  "住宿安排": "숙박 안내",
  "将在办公室附近四星级酒店安排住宿": "사무실 근처 4성급 호텔에 숙소를 마련해 드립니다.",
  "Walmart, Carrefour - same prices": "월마트, 까르푸 - 동일한 가격",
  "High Risk": "높은 위험",
  "Medium Risk": "중간 위험",
  "外资常设机构不是独立法人实体，收入归入外国母公司": "외국 상설 기관(PE)은 독립 법인 실체가 아니며, 그 소득은 외국 모회사에 귀속됩니다.",
  "等主人说\"请\"或先举杯敬酒后，再动筷子。": "주인이 식사를 권하거나 먼저 잔을 들어 건배한 후에야 젓가락을 드세요.",
};
for (const [k,v] of Object.entries(fixes)) {
  if (!map.has(k)) { console.log("WARN key not in map:", k.slice(0,50)); }
  map.set(k, v);
}
// write only real keys
const entries = [...real].map((k) => `  "${esc(k)}": "${esc(map.get(k) ?? k)}",`).join("\n");
const content = `// Auto-generated ko override dictionary for guide data.
// Key: original string (EN or ZH) -> Korean.
export const KO_GUIDE_OVERRIDES: Record<string, string> = {\n${entries}\n};\n`;
fs.writeFileSync(file, content, "utf8");
console.log("written", real.size, "entries with", Object.keys(fixes).length, "manual fixes");

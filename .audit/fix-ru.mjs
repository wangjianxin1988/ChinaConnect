import fs from "node:fs";
const real = new Set(JSON.parse(fs.readFileSync(".audit/guide-strings.json","utf8")).strings);
const file = "src/data/guide/overrides-ru.ts";
let text = fs.readFileSync(file,"utf8");
const re = /^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$/gm;
const un = (s)=>s.replace(/\\"/g,'"').replace(/\\\\/g,'\\').replace(/\\n/g,"\n");
const esc = (s)=>s.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n");
const map = new Map();
for (const m of text.matchAll(re)) map.set(un(m[1]), un(m[2]));
const fixes = {
  "Customize protocol": "Индивидуальный протокол",
  "上海市浦东新区商务路123号A栋10楼": "Шанхай, новый район Пудун, ул. Шанъу, дом 123, корпус А, 10-й этаж",
  "KFC/McDonalds": "KFC/McDonald's",
};
for (const [k,v] of Object.entries(fixes)) {
  if (!map.has(k)) console.log("WARN key not in map:", k.slice(0,40));
  map.set(k, v);
}
const entries = [...real].map((k) => `  "${esc(k)}": "${esc(map.get(k) ?? k)}",`).join("\n");
const content = `// Auto-generated ru override dictionary for guide data.
// Key: original string (EN or ZH) -> Russian.
export const RU_GUIDE_OVERRIDES: Record<string, string> = {\n${entries}\n};\n`;
fs.writeFileSync(file, content, "utf8");
console.log("written", real.size);

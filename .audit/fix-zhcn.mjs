import fs from "node:fs";
const file = "src/data/guide/overrides-zh-CN.ts";
let text = fs.readFileSync(file,"utf8");
const re = /^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$/gm;
const un = (s)=>s.replace(/\\"/g,'"').replace(/\\\\/g,'\\').replace(/\\n/g,"\n");
const esc = (s)=>s.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n");
const map = new Map();
for (const m of text.matchAll(re)) map.set(un(m[1]), un(m[2]));
map.set("Contact Person", "联系人");
const real = new Set(JSON.parse(fs.readFileSync(".audit/guide-strings.json","utf8")).strings);
const entries = [...real].map((k) => `  "${esc(k)}": "${esc(map.get(k) ?? k)}",`).join("\n");
const content = `// Auto-generated zh-CN override dictionary for guide data.
// Key: original string (EN or ZH) -> Simplified Chinese.
export const ZH_CN_GUIDE_OVERRIDES: Record<string, string> = {\n${entries}\n};\n`;
fs.writeFileSync(file, content, "utf8");
console.log("zh-CN fixed, entries:", real.size);

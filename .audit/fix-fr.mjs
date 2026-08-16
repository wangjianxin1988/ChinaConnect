import fs from "node:fs";
const real = new Set(JSON.parse(fs.readFileSync(".audit/guide-strings.json","utf8")).strings);
const file = "src/data/guide/overrides-fr.ts";
let text = fs.readFileSync(file,"utf8");
const re = /^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$/gm;
const un = (s)=>s.replace(/\\"/g,'"').replace(/\\\\/g,'\\').replace(/\\n/g,"\n");
const esc = (s)=>s.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n");
const map = new Map();
for (const m of text.matchAll(re)) map.set(un(m[1]), un(m[2]));
const fixes = {
  "Mobile payments, taxi, food delivery": "Paiements mobiles, taxi, livraison de repas",
  "快速速度": "Vitesse rapide",
  "Taxi (80-150 CNY, 40-60 min)": "Taxi (80–150 CNY, 40-60 min)",
  "Didi (60-100 CNY)": "Didi (60–100 CNY)",
  "Taxi (150-250 CNY, 60-90 min)": "Taxi (150–250 CNY, 60-90 min)",
  "Taxi (50-80 CNY, 20-40 min)": "Taxi (50–80 CNY, 20-40 min)",
  "Bus (6-20 CNY)": "Bus (6–20 CNY)",
  "Maglev + Metro": "Maglev + métro",
  "15+20 min": "15 + 20 min",
  "综合": "Complet",
  "联系邮箱": "E-mail de contact",
  "西藏": "Tibet",
  "Quick Info": "Infos rapides",
  "サービス": "Service",
};
for (const [k,v] of Object.entries(fixes)) {
  if (!map.has(k)) console.log("WARN key not in map:", k.slice(0,40));
  map.set(k, v);
}
const entries = [...real].map((k) => `  "${esc(k)}": "${esc(map.get(k) ?? k)}",`).join("\n");
const content = `// Auto-generated fr override dictionary for guide data.
// Key: original string (EN or ZH) -> French.
export const FR_GUIDE_OVERRIDES: Record<string, string> = {\n${entries}\n};\n`;
fs.writeFileSync(file, content, "utf8");
console.log("written", real.size);

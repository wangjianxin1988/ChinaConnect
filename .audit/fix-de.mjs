import fs from "node:fs";
const real = new Set(JSON.parse(fs.readFileSync(".audit/guide-strings.json","utf8")).strings);
const file = "src/data/guide/overrides-de.ts";
let text = fs.readFileSync(file,"utf8");
const re = /^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$/gm;
const un = (s)=>s.replace(/\\"/g,'"').replace(/\\\\/g,'\\').replace(/\\n/g,"\n");
const esc = (s)=>s.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n");
const map = new Map();
for (const m of text.matchAll(re)) map.set(un(m[1]), un(m[2]));
const jpKey = [...real].find((k) => k.includes("VPNをダウンロードして設定"));
const fixes = {
  "平季": "Nebensaison",
  "Offline translation, camera translation": "Offline-Übersetzung, Kamera-Übersetzung",
  "Navigation": "Navigation",
  "2号线（5元，30分钟）": "Linie 2 (5 ¥, 30 Min.)",
  "Tofu with chili sauce": "Tofu mit Chilisauce",
  "在车站查看英文线路图": "Englische Liniennetzkarte am Bahnhof ansehen",
  "Travel insurance required": "Reiseversicherung erforderlich",
  "亚洲最大规模的纺织面料及辅料博览会。": "Die größte Textil- und Stoffmesse Asiens.",
  "来宾姓名": "Name des Gastes",
  "上海市浦东新区商务路123号A栋10楼": "Shanghai, Pudong New Area, Shangwu-Straße 123, Gebäude A, 10. Stock",
  "联系邮箱": "Kontakt-E-Mail",
  "Reference Number": "Referenznummer",
  "Problem:": "Problem:",
  "问题：": "Problem:",
  "Proxy:": "Proxy:",
  [jpKey]: "Laden Sie ein VPN herunter und richten Sie es ein, BEVOR Sie nach China reisen. Die meisten VPN-Websites sind im Inland blockiert und im App Store ist Ihr bevorzugtes VPN möglicherweise nicht verfügbar. Installieren und testen Sie es vor der Abreise.",
  "サービス": "Service",
};
for (const [k,v] of Object.entries(fixes)) {
  if (!map.has(k)) console.log("WARN key not in map:", k.slice(0,40));
  map.set(k, v);
}
const entries = [...real].map((k) => `  "${esc(k)}": "${esc(map.get(k) ?? k)}",`).join("\n");
const content = `// Auto-generated de override dictionary for guide data.
// Key: original string (EN or ZH) -> German.
export const DE_GUIDE_OVERRIDES: Record<string, string> = {\n${entries}\n};\n`;
fs.writeFileSync(file, content, "utf8");
console.log("written", real.size);

import fs from "node:fs";
import path from "node:path";
const dir = "src/data/cities-i18n/ja";
for (const f of fs.readdirSync(dir).filter(x => x.endsWith(".json"))) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  for (const p of d.payment || []) {
    const hasMethod = typeof p.method === "string" && p.method.length > 0;
    const hasName = typeof p.nameEn === "string" && p.nameEn.length > 0;
    if (!hasMethod || !p.icon) console.log(f, "| method:", JSON.stringify(p.method), "| nameEn:", JSON.stringify(p.nameEn), "| icon:", JSON.stringify(p.icon), "| id:", JSON.stringify(p.id));
  }
}

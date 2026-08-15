import fs from "node:fs";
import path from "node:path";
const dir = "src/data/cities-i18n/ja";
let withMethod = 0, withName = 0, missingBoth = 0, total = 0;
const formats = {};
for (const f of fs.readdirSync(dir).filter(x => x.endsWith(".json"))) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  for (const p of d.payment || []) {
    total++;
    const hasMethod = typeof p.method === "string" && p.method.length > 0;
    const hasName = typeof p.nameEn === "string" && p.nameEn.length > 0;
    if (hasMethod) withMethod++; else if (hasName) withName++; else missingBoth++;
    const sig = (hasMethod ? "M" : "-") + (hasName ? "N" : "-") + (p.icon ? "I" : "-");
    formats[sig] = (formats[sig] || 0) + 1;
  }
}
console.log("total payment entries:", total, "| with method:", withMethod, "| with nameEn:", withName, "| missing both:", missingBoth);
console.log("formats:", JSON.stringify(formats));

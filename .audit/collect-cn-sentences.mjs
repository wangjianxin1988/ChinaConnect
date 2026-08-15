import fs from "node:fs";
// Step 1: collect unique Chinese-sentence strings from all ja city JSONs
const dir = "src/data/cities-i18n/ja";
const locations = {}; // value -> [{file, path}]
const files = fs.readdirSync(dir).filter((x) => x.endsWith(".json"));
for (const f of files) {
  const data = JSON.parse(fs.readFileSync(dir + "/" + f, "utf8").replace(/\r\n/g, "\n"));
  (function walk(obj, path) {
    if (Array.isArray(obj)) { obj.forEach((v, i) => walk(v, path + "[" + i + "]")); return; }
    if (obj && typeof obj === "object") { for (const k of Object.keys(obj)) walk(obj[k], path ? path + "." + k : k); return; }
    if (typeof obj === "string" && obj.length >= 4 && obj.length <= 120) {
      const hasKana = /[\u3040-\u30ff]/.test(obj);
      const han = (obj.match(/[\u4e00-\u9fff]/g) || []).length;
      const rest = obj.replace(/[\u4e00-\u9fff\u3040-\u30ff0-9０-９a-zA-Z\s，。、！？·\-—/（）()%％¥$€:：,.;;.!?~〜]/g, "");
      if (!hasKana && han >= 4 && rest.length === 0 && /[，。、！？]$/.test(obj)) {
        if (!locations[obj]) locations[obj] = [];
        locations[obj].push({ file: f, path });
      }
    }
  })(data, "");
}
const unique = Object.keys(locations);
console.log("unique Chinese sentences:", unique.length);
fs.writeFileSync(".audit/cn-sentence-locations.json", JSON.stringify(locations, null, 1));
// sample
for (const s of unique.slice(0, 40)) console.log("  ", JSON.stringify(s));

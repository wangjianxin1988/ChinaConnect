import fs from "node:fs";
const dir = "src/data/cities-i18n/ja";
const out = [];
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
  const data = JSON.parse(fs.readFileSync(dir + "/" + f, "utf8").replace(/\r\n/g, "\n"));
  (function walk(obj, path) {
    if (Array.isArray(obj)) { obj.forEach((v, i) => walk(v, path + "[" + i + "]")); return; }
    if (obj && typeof obj === "object") { for (const k of Object.keys(obj)) walk(obj[k], path ? path + "." + k : k); return; }
    if (typeof obj === "string" && obj.length >= 4 && obj.length <= 120) {
      const hasKana = /[\u3040-\u30ff]/.test(obj);
      const han = (obj.match(/[\u4e00-\u9fff]/g) || []).length;
      const rest = obj.replace(/[\u4e00-\u9fff\u3040-\u30ff0-9０-９a-zA-Z\s，。、！？·\-—/（）()%％¥$€:：,.;;.!?~〜]/g, "");
      // pure hanzi + punctuation, no kana, no latin/numbers-heavy
      if (!hasKana && han >= 4 && rest.length === 0 && /[，。、！？]$/.test(obj)) {
        out.push({ f, path, value: obj });
      }
    }
  })(data, "");
}
console.log("candidate Chinese sentences:", out.length);
for (const o of out) console.log(o.f, o.path, "=>", JSON.stringify(o.value));

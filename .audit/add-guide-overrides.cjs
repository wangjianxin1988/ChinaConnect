const fs = require("fs");
const p = "src/data/guide/ja-overrides.ts";
let s = fs.readFileSync(p, "utf8");
const orig = s;
const adds = {
  "China Unicom (中国联通)": "China Unicom（中国聯通）",
  "China Telecom (中国电信)": "China Telecom（中国電信）",
  "NFC感应支付": "NFCかざして支払い",
  "文件笔译": "文書翻訳",
  "商务文件、合同、报告、营销材料翻译。标准交付周期为每3,000字1-3个工作日。": "商務文書、契約書、報告書、マーケティング資料の翻訳。標準納期は3,000字ごとに1〜3営業日。",
};
// insert before the final "};"
const endIdx = s.lastIndexOf("};");
for (const [k, v] of Object.entries(adds)) {
  if (s.includes(JSON.stringify(k))) { console.log("already present:", k); continue; }
  const line = "  " + JSON.stringify(k) + ": " + JSON.stringify(v) + ",\n";
  s = s.slice(0, endIdx) + line + s.slice(endIdx);
}
fs.writeFileSync(p, s);
console.log("changed:", orig !== s);

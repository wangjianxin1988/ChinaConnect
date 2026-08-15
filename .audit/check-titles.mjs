import fs from "node:fs";
const d = JSON.parse(fs.readFileSync(".audit/ja-js-scan.json", "utf8"));
const rows = [];
for (const [url, p] of Object.entries(d)) {
  const t = (p.title || "").trim();
  if (/[A-Za-z]{3}/.test(t) && !/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(t)) {
    rows.push({ url, t });
  } else if (t.includes(" - ChinaConnect") && !/[\u3040-\u30ff]/.test(t.split(" - ChinaConnect")[0])) {
    rows.push({ url, t });
  }
}
console.log("pages with english-ish title:", rows.length);
for (const r of rows) console.log(r.url, "=>", r.t.slice(0, 90));

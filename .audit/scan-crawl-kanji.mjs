import fs from "node:fs";
const d = JSON.parse(fs.readFileSync(".audit/ja-js-scan.json", "utf8"));
const rows = [];
for (const [url, p] of Object.entries(d)) {
  const text = (p.text || "") + "\n" + (p.title || "");
  const lines = text.split(/\n/).map((c) => c.trim()).filter((c) => c.length >= 2 && c.length <= 80);
  const dirty = lines.filter((c) => {
    if (/[\u3040-\u30ff]/.test(c)) return false;
    const han = (c.match(/[\u4e00-\u9fff]/g) || []).length;
    if (han < 4) return false;
    const rest = c.replace(/[\u4e00-\u9fff\u3040-\u30ff0-9０-９a-zA-Z\s，。、！？·\-—/（）()%％¥$€:：,.;;.!?~〜]/g, "");
    return rest.length === 0 && /[。]$/.test(c);
  });
  if (dirty.length) rows.push({ url, samples: dirty.slice(0, 6) });
}
console.log("pages with kanji-only sentence lines:", rows.length);
for (const r of rows.slice(0, 40)) {
  console.log(r.url);
  r.samples.forEach((s) => console.log("   ", s));
}

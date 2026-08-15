import fs from "node:fs";
const data = JSON.parse(fs.readFileSync(".audit/ja-city-english.json", "utf8"));
const byField = {};
let total = 0;
for (const [file, hits] of Object.entries(data)) {
  for (const h of hits) {
    const parts = h.path.split(".");
    const last = parts[parts.length - 1].replace(/\[\d+\]/g, "");
    byField[last] = byField[last] || { count: 0, sample: h.value };
    byField[last].count++;
    total++;
  }
}
console.log("total", total);
for (const [k, v] of Object.entries(byField).sort((a, b) => b[1].count - a[1].count)) {
  console.log(k.padEnd(22), String(v.count).padStart(5), "|", JSON.stringify(String(v.sample).slice(0, 70)));
}

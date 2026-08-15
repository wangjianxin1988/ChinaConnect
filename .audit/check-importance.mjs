import fs from "node:fs";
import path from "node:path";
const dir = "src/data/cities-i18n/ja";
const bad = {};
const values = {};
for (const f of fs.readdirSync(dir).filter(x => x.endsWith(".json"))) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  for (const t of d.culturalTips || []) {
    values[t.importance] = (values[t.importance] || 0) + 1;
    if (!["high", "medium", "low"].includes(t.importance)) {
      (bad[f] = bad[f] || []).push({ title: t.title, importance: t.importance });
    }
  }
}
console.log("importance values:", JSON.stringify(values));
const files = Object.keys(bad);
console.log("files with bad importance:", files.length);
for (const f of files.slice(0, 8)) {
  console.log(f, JSON.stringify(bad[f].slice(0, 6)));
}

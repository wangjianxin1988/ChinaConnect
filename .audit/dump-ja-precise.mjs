import fs from "node:fs";
const d = JSON.parse(fs.readFileSync(".audit/ja-city-english-precise.json", "utf8"));
const byFile = new Map();
for (const r of d) {
  if (!byFile.has(r.file)) byFile.set(r.file, []);
  byFile.get(r.file).push(r);
}
let total = 0;
for (const [f, rows] of [...byFile.entries()].sort()) {
  console.log("===== " + f + " (" + rows.length + ") =====");
  total += rows.length;
  for (const r of rows) {
    console.log("  " + r.path + " | " + JSON.stringify(r.text));
  }
}
console.log("\nTOTAL:", total);

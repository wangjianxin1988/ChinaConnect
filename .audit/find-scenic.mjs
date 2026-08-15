import fs from "node:fs";
import cp from "node:child_process";
const out = cp.execSync('rg -l "Scenic Spots" src --glob "*.astro" --glob "*.tsx" --glob "*.ts"', { encoding: "utf8" });
console.log("FILES:", out.split(/\r?\n/).filter(Boolean).join(", "));
for (const f of out.split(/\r?\n/).filter(Boolean)) {
  const s = fs.readFileSync(f, "utf8");
  const lines = s.split(/\r?\n/);
  lines.forEach((l, i) => { if (l.includes("Scenic Spots")) console.log(f + ":" + (i + 1) + ": " + l.trim().slice(0, 150)); });
}

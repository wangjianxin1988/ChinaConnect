import fs from "node:fs";
import cp from "node:child_process";
const out = cp.execSync('rg -l "Scenic Spots|sectionScenic|scenic_spots" src/components src/pages', { encoding: "utf8" });
for (const f of out.split(/\r?\n/).filter(Boolean)) {
  const s = fs.readFileSync(f, "utf8");
  const lines = s.split(/\r?\n/);
  lines.forEach((l, i) => { if (/Scenic Spots|sectionScenic|scenic_spots/.test(l)) console.log(f + ":" + (i + 1) + ": " + l.trim().slice(0, 170)); });
}

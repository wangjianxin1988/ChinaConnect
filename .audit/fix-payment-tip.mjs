import fs from "node:fs";
const p = "src/data/guide/ja-overrides.ts";
let s = fs.readFileSync(p, "utf8");
const add = '  "Use \\"Traveler\\" mode for easier setup": "「トラベラー」モードを使うと簡単に設定できます",\n';
if (!s.includes("Use \\\"Traveler\\\" mode for easier setup")) {
  s = s.replace(/\n\};[\s]*$/, "\n" + add + "};");
  fs.writeFileSync(p + ".tmp", s);
  fs.renameSync(p + ".tmp", p);
  console.log("added Traveler tip override");
} else console.log("already present");

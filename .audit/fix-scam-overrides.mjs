import fs from "node:fs";
const p = "src/data/guide/ja-overrides.ts";
let s = fs.readFileSync(p, "utf8");
const add = '  "真实案例": "実際の事例",\n  "警示特征": "警告サイン",\n  "预防方法": "予防方法",\n  "应对方法": "対処方法",\n';
if (!s.includes('"真实案例"')) {
  s = s.replace(/\n\};[\s]*$/, "\n" + add + "};");
  fs.writeFileSync(p + ".tmp", s);
  fs.renameSync(p + ".tmp", p);
  console.log("added 真实案例 overrides");
} else console.log("already present");

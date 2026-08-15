const fs = require("fs");
const fixes = {
  "src/data/cities-i18n/ja/chengdu.json": [
    ['"成都味回锅肉"', '"成都風回鍋肉"'],
    ['"成都味回锅肉 (回锅肉)"', '"成都風回鍋肉（回鍋肉）"'],
  ],
  "src/data/cities-i18n/ja/fuzhou.json": [
    ['"福州大药房"', '"福州大薬房"'],
  ],
  "src/data/cities-i18n/ja/hangzhou.json": [
    ['"杭帮菜館"', '"杭州菜館"'],
    ['"杭州纳德大酒店"', '"杭州納徳大酒店"'],
  ],
  "src/data/cities-i18n/ja/harbin.json": [
    ['"中谊街、道理区"', '"中誼街、道里区"'],
  ],
};
for (const [f, reps] of Object.entries(fixes)) {
  let s = fs.readFileSync(f, "utf8");
  const orig = s;
  for (const [a, b] of reps) {
    if (!s.includes(a)) { console.log("NOT FOUND in " + f + ": " + a); continue; }
    s = s.split(a).join(b);
  }
  if (s !== orig) fs.writeFileSync(f, s);
}
console.log("done simple fixes");

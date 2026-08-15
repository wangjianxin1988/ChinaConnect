const fs = require("fs");
const src = fs.readFileSync("src/i18n/translations.ts", "utf8");
for (const k of ["宿泊ガイド - ChinaConnect", "コミュニケーションガイド - ChinaConnect", "文化的タブーと注意点 - ChinaConnect", "出国ガイド - ChinaConnect", "食事ガイド - ChinaConnect", "緊急時対応ガイド - ChinaConnect", "中国完全旅行ガイド - ChinaConnect", "詐欺防止ガイド - ChinaConnect", "価格の透明性 - ChinaConnect"]) {
  console.log(k, "->", (src.match(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length);
}

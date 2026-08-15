const fs = require("fs");
const p = "src/pages/[lang]/guide/attractions.astro";
let src = fs.readFileSync(p, "utf8");

// Replace hardcoded English bullets with lang-conditional versions
const bullets = [
  // Beijing
  ["Forbidden City - Imperial palace complex", "故宮博物院 — 皇室の宮殿建築群"],
  ["Great Wall - Iconic ancient fortification", "万里の長城 — 象徴的な古代の要塞"],
  ["Temple of Heaven - UNESCO heritage site", "天壇 — ユネスコ世界遺産"],
  // Shanghai
  ["The Bund - Historic waterfront promenade", "外灘 — 歴史あるウォーターフロント遊歩道"],
  ["Yu Garden - Classical Chinese garden", "豫園 — 古典的な中国庭園"],
  ["Shanghai Tower - World's fastest elevator", "上海タワー — 世界最速のエレベーター"],
  // Xi'an
  ["Terracotta Warriors - Ancient army statue", "兵馬俑 — 古代の兵士の像"],
  ["City Wall - Best-preserved city walls", "西安城壁 — 保存状態の良い城壁"],
  ["Muslim Quarter - Street food paradise", "ムスリムクォーター — 屋台グルメの楽園"],
  // Chengdu
  ["Giant Panda Base - Panda conservation", "ジャイアントパンダ基地 — パンダ保護施設"],
  ["Jinli Street - Traditional shopping street", "錦里古街 — 伝統的な商店街"],
  ["Leshan Giant Buddha - UNESCO heritage", "楽山大仏 — ユネスコ世界遺産"],
];
let n = 0;
for (const [en, ja] of bullets) {
  const pat = new RegExp("• " + en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
  const cnt = (src.match(pat) || []).length;
  src = src.replace(pat, "{lang === \"ja\" ? `• " + ja + "` : `• " + en + "`}");
  n += cnt;
}
fs.writeFileSync(p, src);
console.log("bullets replaced:", n);

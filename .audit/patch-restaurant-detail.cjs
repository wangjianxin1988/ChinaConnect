const fs = require("fs");
const p = "src/components/food/RestaurantDetail.tsx";
let src = fs.readFileSync(p, "utf8");
function replaceAll(src, pattern, replacement) {
  const re = new RegExp(pattern, "g");
  const count = (src.match(re) || []).length;
  return { out: src.replace(re, replacement), count };
}
{
  const pat = "⭐ \\{restaurant\\.michelin_stars\\}-Star Michelin";
  const repl = "⭐ {t(`${restaurant.michelin_stars}つ星 ミシュラン`, `${restaurant.michelin_stars}星 米其林`, `${restaurant.michelin_stars}-Star Michelin`)}";
  const r = replaceAll(src, pat, repl);
  console.log("michelin badge:", r.count);
  src = r.out;
}
{
  const pat = "💎 \\{restaurant\\.heizhenzhu_rank\\} Black Pearl";
  const repl = "💎 {t(`${restaurant.heizhenzhu_rank}ダイヤ ブラックパール`, `${restaurant.heizhenzhu_rank}钻 黑珍珠`, `${restaurant.heizhenzhu_rank} Black Pearl`)}";
  const r = replaceAll(src, pat, repl);
  console.log("blackpearl badge:", r.count);
  src = r.out;
}
fs.writeFileSync(p, src);

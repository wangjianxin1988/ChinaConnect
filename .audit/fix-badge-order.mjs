import fs from "node:fs";
const p = "src/components/food/RestaurantDetail.tsx";
let s = fs.readFileSync(p, "utf8");
const old1 = "⭐ {t(`${restaurant.michelin_stars}つ星 ミシュラン`, `${restaurant.michelin_stars}星 米其林`, `${restaurant.michelin_stars}-Star Michelin`)}";
const new1 = "⭐ {t(`${restaurant.michelin_stars}-Star Michelin`, `${restaurant.michelin_stars}星 米其林`, `${restaurant.michelin_stars}つ星 ミシュラン`)}";
const old2 = "💎 {t(`${restaurant.heizhenzhu_rank}ダイヤ ブラックパール`, `${restaurant.heizhenzhu_rank}钻 黑珍珠`, `${restaurant.heizhenzhu_rank} Black Pearl`)}";
const new2 = "💎 {t(`${restaurant.heizhenzhu_rank} Black Pearl`, `${restaurant.heizhenzhu_rank}钻 黑珍珠`, `${restaurant.heizhenzhu_rank}ダイヤ ブラックパール`)}";
let n = 0;
if (s.includes(old1)) { s = s.split(old1).join(new1); n++; }
if (s.includes(old2)) { s = s.split(old2).join(new2); n++; }
fs.writeFileSync(p + ".tmp", s);
fs.renameSync(p + ".tmp", p);
console.log("badge arg order fixed:", n);

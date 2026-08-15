const fs = require("fs");
const p = "src/pages/[lang]/city/[slug]/food.astro";
let src = fs.readFileSync(p, "utf8");

// 1) pageDescription ja
const oldDesc = `const pageDescription = \`${'${city.nameEn}'} (${'${city.name}'}) Food Guide: complete Michelin, Black Pearl, and local picks\`;`;
const newDesc = `const pageDescription = lang === "ja"
  ? \`${'${localCityName}'}のグルメガイド：ミシュラン、ブラックパール、地元の人気店を網羅\`
  : \`${'${city.nameEn}'} (${'${city.name}'}) Food Guide: complete Michelin, Black Pearl, and local picks\`;`;
if (src.includes(oldDesc)) src = src.split(oldDesc).join(newDesc);

// 2) getBadgeLabel localized
const oldBadge = `function getBadgeLabel(type: Restaurant["type"]) {
  if (type === "michelin") return "Michelin";
  if (type === "blackpearl") return "Black Pearl";
  return "Local Favorite";
}`;
const newBadge = `function getBadgeLabel(type: Restaurant["type"], lang: string) {
  if (lang === "ja") {
    if (type === "michelin") return "ミシュラン";
    if (type === "blackpearl") return "ブラックパール";
    return "地元のおすすめ";
  }
  if (type === "michelin") return "Michelin";
  if (type === "blackpearl") return "Black Pearl";
  return "Local Favorite";
}`;
if (src.includes(oldBadge)) src = src.split(oldBadge).join(newBadge);

// 3) Primary name: for ja use restaurant.name, else nameEn
const oldName = `<h3 class="text-lg font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                    {restaurant.nameEn}
                  </h3>
                  <p class="text-gray-500 text-sm truncate">{restaurant.name}</p>`;
const newName = `<h3 class="text-lg font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                    {lang === "ja" ? restaurant.name : restaurant.nameEn}
                  </h3>
                  <p class="text-gray-500 text-sm truncate">{lang === "ja" ? restaurant.nameEn : restaurant.name}</p>`;
if (src.includes(oldName)) src = src.split(oldName).join(newName);

// 4) Badge display
const oldBadgeDisp = `{getBadgeLabel(restaurant.type)}
                {restaurant.type === "michelin" && restaurant.star ? \`${'${restaurant.star}'}-star\` : ""}
                {restaurant.type === "blackpearl" && restaurant.diamond ? \`${'${restaurant.diamond}'}-diamond\` : ""}`;
const newBadgeDisp = `{getBadgeLabel(restaurant.type, lang)}
                {restaurant.type === "michelin" && restaurant.star ? (lang === "ja" ? \`${'${restaurant.star}'}つ星\` : \`${'${restaurant.star}'}-star\`) : ""}
                {restaurant.type === "blackpearl" && restaurant.diamond ? (lang === "ja" ? \`${'${restaurant.diamond}'}ダイヤ\` : \`${'${restaurant.diamond}'}-diamond\`) : ""}`;
if (src.includes(oldBadgeDisp)) src = src.split(oldBadgeDisp).join(newBadgeDisp);

fs.writeFileSync(p, src);
console.log("patched:", src.includes("getBadgeLabel(restaurant.type, lang)"), src.includes("lang === \"ja\" ? restaurant.name : restaurant.nameEn"), src.includes("のグルメガイド"));

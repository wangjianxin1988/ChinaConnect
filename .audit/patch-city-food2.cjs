const fs = require("fs");
const p = "src/pages/[lang]/city/[slug]/food.astro";
let src = fs.readFileSync(p, "utf8");

function replaceAll(src, pattern, replacement) {
  const re = new RegExp(pattern, "g");
  let out = src, m;
  const found = [];
  while ((m = re.exec(out))) found.push(m[0]);
  out = out.replace(re, replacement);
  return { out, count: found.length };
}

// Primary name for ja
{
  const pat = "<h3 class=\"text-lg font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors\">\\r?\\n\\s*\\{restaurant\\.nameEn\\}\\r?\\n\\s*<\\/h3>\\r?\\n\\s*<p class=\"text-gray-500 text-sm truncate\">\\{restaurant\\.name\\}<\\/p>";
  const repl = "<h3 class=\"text-lg font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors\">\n                    {lang === \"ja\" ? restaurant.name : restaurant.nameEn}\n                  </h3>\n                  <p class=\"text-gray-500 text-sm truncate\">{lang === \"ja\" ? restaurant.nameEn : restaurant.name}</p>";
  const r = replaceAll(src, pat, repl);
  console.log("name patch matches:", r.count);
  src = r.out;
}

// Badge function
{
  const pat = "function getBadgeLabel\\(type: Restaurant\\[\"type\"\\]\\) \\{[^}]*?return \"Local Favorite\";\\r?\\n\\}";
  const repl = "function getBadgeLabel(type: Restaurant[\"type\"], lang: string) {\n  if (lang === \"ja\") {\n    if (type === \"michelin\") return \"ミシュラン\";\n    if (type === \"blackpearl\") return \"ブラックパール\";\n    return \"地元のおすすめ\";\n  }\n  if (type === \"michelin\") return \"Michelin\";\n  if (type === \"blackpearl\") return \"Black Pearl\";\n  return \"Local Favorite\";\n}";
  const r = replaceAll(src, pat, repl);
  console.log("badge fn matches:", r.count);
  src = r.out;
}

// Badge display
{
  const pat = "\\{getBadgeLabel\\(restaurant\\.type\\)\\}\\r?\\n\\s*\\{restaurant\\.type === \"michelin\" && restaurant\\.star \\? `\\$\\{restaurant\\.star\\}-star` : \"\"\\}\\r?\\n\\s*\\{restaurant\\.type === \"blackpearl\" && restaurant\\.diamond \\? `\\$\\{restaurant\\.diamond\\}-diamond` : \"\"\\}";
  const repl = "{getBadgeLabel(restaurant.type, lang)}\n                {restaurant.type === \"michelin\" && restaurant.star ? (lang === \"ja\" ? `${restaurant.star}つ星` : `${restaurant.star}-star`) : \"\"}\n                {restaurant.type === \"blackpearl\" && restaurant.diamond ? (lang === \"ja\" ? `${restaurant.diamond}ダイヤ` : `${restaurant.diamond}-diamond`) : \"\"}";
  const r = replaceAll(src, pat, repl);
  console.log("badge display matches:", r.count);
  src = r.out;
}

fs.writeFileSync(p, src);
console.log("final check:", src.includes("getBadgeLabel(restaurant.type, lang)"), src.includes("lang === \"ja\" ? restaurant.name : restaurant.nameEn"));

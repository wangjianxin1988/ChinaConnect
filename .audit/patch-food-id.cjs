const fs = require("fs");
const p = "src/pages/[lang]/food/[id].astro";
let s = fs.readFileSync(p, "utf8");
const orig = s;
s = s.replace(
  'import { getRestaurantById, restaurants } from "@/data/food/restaurants";',
  'import { getRestaurantById, restaurants } from "@/data/food/restaurants";\nimport { JA_FOOD_OVERRIDES } from "@/data/food/ja-food-overrides";'
);
s = s.replace(
  "const showTitleCn = lang === \"zh-CN\" || lang === \"zh-TW\";",
  'const showTitleCn = lang === "zh-CN" || lang === "zh-TW";\n\nconst jaFood = (t: string | undefined): string =>\n  lang === "ja" && t ? JA_FOOD_OVERRIDES[t] || t : (t || "");'
);
s = s.replace(
  "  name: restaurant.name,\n  name_en: restaurant.nameEn,\n  cuisine: restaurant.cuisine,",
  "  name: jaFood(restaurant.name),\n  name_en: restaurant.nameEn,\n  cuisine: jaFood(restaurant.cuisine),"
);
s = s.replace(
  "  address: restaurant.address,\n  address_zh: restaurant.addressEn,",
  "  address: jaFood(restaurant.address),\n  address_zh: restaurant.addressEn,"
);
s = s.replace(
  "  tags: restaurant.tags || [],",
  "  tags: (restaurant.tags || []).map((t) => jaFood(t)),"
);
s = s.replace(
  "  description: restaurant.description,\n  description_zh: restaurant.descriptionEn,",
  "  description: jaFood(restaurant.description),\n  description_zh: restaurant.descriptionEn,"
);
s = s.replace(
  '<RestaurantDetail restaurant={restaurantDetail} client:load />',
  '<RestaurantDetail restaurant={restaurantDetail} lang={lang} client:load />'
);
s = s.replace(
  'href={`/food?city=${restaurant.city}`}',
  'href={`/${lang}/food?city=${restaurant.city}`}'
);
s = s.replace(
  '<a href="/food"',
  '<a href={`/${lang}/food`}'
);
s = s.replace(
  '<a href={`/food/${r.id}`}',
  '<a href={`/${lang}/food/${r.id}`}'
);
fs.writeFileSync(p, s);
console.log("changed:", orig !== s);

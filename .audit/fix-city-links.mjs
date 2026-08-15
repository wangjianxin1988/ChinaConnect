import fs from "node:fs";

const p = "src/pages/[lang]/city/[slug].astro";
let s = fs.readFileSync(p, "utf8");
const changes = [];

// 1. add langPrefix helper after isJapanese
const anchor = 'const isJapanese = lang === "ja";';
if (s.includes(anchor)) {
  s = s.replace(anchor, anchor + "\nconst langPrefix = lang === \"en\" ? \"\" : `/${lang}`;");
  changes.push("langPrefix");
} else {
  console.error("ANCHOR NOT FOUND: isJapanese");
  process.exit(1);
}

// 2. breadcrumb home link
const oldHome = '<a href="/" class="text-blue-200 hover:text-white transition-colors" data-i18n="cityPage.home">{_lookup("cityPage.home")}</a>';
const newHome = '<a href={`${langPrefix}/`} class="text-blue-200 hover:text-white transition-colors" data-i18n="nav.home">{_lookup("nav.home")}</a>';
if (s.includes(oldHome)) { s = s.split(oldHome).join(newHome); changes.push("homeLink"); }
else console.error("NOT FOUND: home link");

// 3. breadcrumb cities link
const oldCities = '<a href="/#cities" class="text-blue-200 hover:text-white transition-colors">Cities</a>';
const newCities = '<a href={`${langPrefix}/#cities`} class="text-blue-200 hover:text-white transition-colors" data-i18n="nav.cities">{_lookup("nav.cities")}</a>';
if (s.includes(oldCities)) { s = s.split(oldCities).join(newCities); changes.push("citiesLink"); }
else console.error("NOT FOUND: cities link");

// 4. food map link
const oldFood = 'href={`/food?city=${city.slug}`}';
const newFood = 'href={`${langPrefix}/food?city=${city.slug}`}';
if (s.includes(oldFood)) { s = s.split(oldFood).join(newFood); changes.push("foodLink"); }
else console.error("NOT FOUND: food link");

// 5. hotel category card links
const oldHotelCat = 'href={`/city/${city.slug}/hotels?category=${cat.key}`}';
const newHotelCat = 'href={`${langPrefix}/city/${city.slug}/hotels?category=${cat.key}`}';
if (s.includes(oldHotelCat)) { s = s.split(oldHotelCat).join(newHotelCat); changes.push("hotelCatLink"); }
else console.error("NOT FOUND: hotel cat link");

// 6. view all hotels link
const oldHotels = 'href={`/city/${city.slug}/hotels`}';
const newHotels = 'href={`${langPrefix}/city/${city.slug}/hotels`}';
if (s.includes(oldHotels)) { s = s.split(oldHotels).join(newHotels); changes.push("hotelsLink"); }
else console.error("NOT FOUND: hotels link");

fs.writeFileSync(p + ".tmp", s);
fs.renameSync(p + ".tmp", p);
console.log("done:", changes.join(", "));

const fs = require("fs");
const p = "src/pages/[lang]/food/index.astro";
let s = fs.readFileSync(p, "utf8");
const orig = s;
s = s.replace(
  'import { cities, citiesMeta } from "@/data/cities/index";',
  'import { cities, citiesMeta } from "@/data/cities/index";\nimport { getCityData } from "@/data/cities-i18n";'
);
// compute localized city name helper after lang is defined
s = s.replace(
  'const lang = getLangFromUrl(Astro.url) || "en";',
  'const lang = getLangFromUrl(Astro.url) || "en";\nconst cityNameFor = (slug: string): string =>\n  (lang === "en" ? null : getCityData(slug, lang)?.name) || citiesMeta[slug]?.nameEn || slug;'
);
s = s.replace('<h3 class="text-xl font-bold">{city.nameZh}</h3>', '<h3 class="text-xl font-bold">{cityNameFor(city.slug)}</h3>');
s = s.replace('alt={city.nameZh}', 'alt={cityNameFor(city.slug)}');
s = s.replace('href={`/city/${city.slug}/food`}', 'href={`/${lang}/city/${city.slug}/food`}');
s = s.replace('href="/city/shanghai"', 'href={`/${lang}/city/shanghai`}');
fs.writeFileSync(p, s);
console.log("changed:", orig !== s);

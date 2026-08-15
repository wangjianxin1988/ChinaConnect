const fs = require("fs");
const p = "src/pages/[lang]/food/index.astro";
let s = fs.readFileSync(p, "utf8");
const orig = s;
s = s.replace(
  'const lang = (Astro.params.lang as string) || "en";',
  'const lang = (Astro.params.lang as string) || "en";\nconst cityNameFor = (slug: string): string =>\n  (lang === "en" ? null : getCityData(slug, lang)?.name) || citiesMeta.find((m) => m.slug === slug)?.nameEn || slug;'
);
fs.writeFileSync(p, s);
console.log("changed:", orig !== s);
const lines = s.split("\n");
for (let i = 15; i < 28; i++) console.log((i + 1) + ": " + lines[i].slice(0, 150));

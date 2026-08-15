import fs from "node:fs";

const p = "src/pages/[lang]/city/[slug].astro";
let s = fs.readFileSync(p, "utf8");
const changes = [];

// 1. city schema url
const oldUrl = "url: `https://chinaengage.org/city/${city.slug}`,";
const newUrl = "url: `https://chinaengage.org${langPrefix}/city/${city.slug}`,";
if (s.includes(oldUrl)) { s = s.split(oldUrl).join(newUrl); changes.push("schemaUrl"); }
else console.error("NOT FOUND: schema url");

// 2. breadcrumb names + items
const oldB1 = '      name: "Home",\n      item: "https://chinaengage.org",';
const newB1 = '      name: translations[lang]?.nav?.home ?? "Home",\n      item: `https://chinaengage.org${langPrefix}`,';
if (s.includes(oldB1)) { s = s.split(oldB1).join(newB1); changes.push("bcHome"); }
else console.error("NOT FOUND: bc home");

const oldB2 = '      name: "Cities",\n      item: "https://chinaengage.org/#cities",';
const newB2 = '      name: translations[lang]?.nav?.cities ?? "Cities",\n      item: `https://chinaengage.org${langPrefix}/#cities`,';
if (s.includes(oldB2)) { s = s.split(oldB2).join(newB2); changes.push("bcCities"); }
else console.error("NOT FOUND: bc cities");

const oldB3 = '      name: city.nameEn,\n      item: `https://chinaengage.org/city/${city.slug}`,';
const newB3 = '      name: localCityName,\n      item: `https://chinaengage.org${langPrefix}/city/${city.slug}`,';
if (s.includes(oldB3)) { s = s.split(oldB3).join(newB3); changes.push("bcCity"); }
else console.error("NOT FOUND: bc city");

// 3. ja hreflang
const oldH = 'const zhCityUrl = `${SITE_URL}/zh/city/${city.slug}`;';
const newH = 'const zhCityUrl = `${SITE_URL}/zh/city/${city.slug}`;\nconst jaCityUrl = `${SITE_URL}/ja/city/${city.slug}`;';
if (s.includes(oldH)) { s = s.split(oldH).join(newH); changes.push("jaCityUrl"); }
else console.error("NOT FOUND: zhCityUrl");

const oldHL = '<link rel="alternate" hreflang="en" href={enCityUrl} />\n  <link rel="alternate" hreflang="zh-CN" href={zhCityUrl} />';
const newHL = '<link rel="alternate" hreflang="en" href={enCityUrl} />\n  <link rel="alternate" hreflang="ja" href={jaCityUrl} />\n  <link rel="alternate" hreflang="zh-CN" href={zhCityUrl} />';
if (s.includes(oldHL)) { s = s.split(oldHL).join(newHL); changes.push("jaHreflang"); }
else console.error("NOT FOUND: hreflang block");

fs.writeFileSync(p + ".tmp", s);
fs.renameSync(p + ".tmp", p);
console.log("done:", changes.join(", "));

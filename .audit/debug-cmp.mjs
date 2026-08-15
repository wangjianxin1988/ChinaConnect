import fs from "node:fs";
const en = JSON.parse(fs.readFileSync("src/data/cities/beijing.json", "utf8"));
const ja = JSON.parse(fs.readFileSync("src/data/cities-i18n/ja/beijing.json", "utf8"));
console.log("EN r3 desc:", JSON.stringify(en.restaurants[3].description));
console.log("JA r3 desc:", JSON.stringify(ja.restaurants[3].description));
console.log("EN r1 tags:", JSON.stringify(en.restaurants[1].tags));
console.log("JA r1 tags:", JSON.stringify(ja.restaurants[1].tags));
console.log("EN attractions44:", JSON.stringify(en.attractions[44]?.openingHours));
console.log("JA attractions44:", JSON.stringify(ja.attractions[44]?.openingHours));

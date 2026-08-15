const fs = require("fs");
const d = JSON.parse(fs.readFileSync("src/data/cities-i18n/ja/beijing.json", "utf8"));
const r = d.restaurants[0];
console.log("restaurant 0:", JSON.stringify({ name: r.name, nameEn: r.nameEn, description: (r.description||"").slice(0,60), cuisine: r.cuisine }, null, 1));

const fs = require("fs");
const d = JSON.parse(fs.readFileSync("src/data/cities-i18n/ja/guangzhou.json", "utf8"));
console.log("guangzhou ja name:", d.name, "| nameEn:", d.nameEn, "| slug:", d.slug);
const b = JSON.parse(fs.readFileSync("src/data/cities-i18n/ja/beijing.json", "utf8"));
console.log("beijing ja name:", b.name, "| nameEn:", b.nameEn);

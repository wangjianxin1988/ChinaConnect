const fs = require("fs");
const d = JSON.parse(fs.readFileSync("src/data/cities-i18n/ja/beijing.json", "utf8"));
const cats = {};
for (const a of d.attractions) cats[a.category] = (cats[a.category] || 0) + 1;
console.log("beijing ja categories:", JSON.stringify(cats));
const g = JSON.parse(fs.readFileSync("src/data/cities-i18n/ja/guangzhou.json", "utf8"));
const cats2 = {};
for (const a of g.attractions) cats2[a.category] = (cats2[a.category] || 0) + 1;
console.log("guangzhou ja categories:", JSON.stringify(cats2));

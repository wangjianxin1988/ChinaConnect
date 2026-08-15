const fs = require("fs");
const p = "src/components/hotel/HotelCategoryFilter.tsx";
let s = fs.readFileSync(p, "utf8");
const orig = s;
s = s.replace('labels: { ja: "すべて"', 'labels: { en: "All", ja: "すべて"');
s = s.replace('const langKey = (lang || "en") as string;', 'const langKey = (lang || "en") as keyof typeof ALL_CONFIG.labels;');
fs.writeFileSync(p, s);
console.log("changed:", orig !== s);

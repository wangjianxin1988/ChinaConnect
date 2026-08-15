const fs = require("fs");
const src = fs.readFileSync("src/pages/[lang]/guide/attractions.astro", "utf8");
const i = src.indexOf("Popular Attractions by City");
const end = src.indexOf("</div>", i + 100);
// find the section closing
const seg = src.slice(i, i + 2600);
console.log(seg.slice(1400));

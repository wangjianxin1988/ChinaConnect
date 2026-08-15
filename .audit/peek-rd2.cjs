const fs = require("fs");
const s = fs.readFileSync("src/components/food/RestaurantDetail.tsx", "utf8");
const re = /\/\s*[^\n]{0,40}[\u4e00-\u9fff][^\n]{0,40}/g;
const lines = s.split("\n");
lines.forEach((l, i) => {
  if (/[\u4e00-\u9fff]/.test(l) && (l.includes("/") || l.includes("="))) {
    console.log((i + 1) + ": " + l.trim().slice(0, 120));
  }
});

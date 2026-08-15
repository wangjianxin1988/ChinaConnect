import fs from "node:fs";
const s = fs.readFileSync("src/components/food/RestaurantDetail.tsx", "utf8");
const strs = [...s.matchAll(/"[A-Za-z][A-Za-z ,'&:!?.-]{4,}"/g)].map((m) => m[0]);
const uniq = [...new Set(strs)];
for (const u of uniq) console.log(u);
console.log("count", uniq.length);

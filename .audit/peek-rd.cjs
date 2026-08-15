const fs = require("fs");
const s = fs.readFileSync("src/components/food/RestaurantDetail.tsx", "utf8");
// find where name/address/description rendered
for (const pat of ["restaurant.name", "name_en", "address_zh", "description_zh", "cuisine_zh", "restaurant.address", "restaurant.description"]) {
  const idx = s.indexOf(pat);
  if (idx === -1) continue;
  console.log("=== " + pat + " @ " + idx + " ===");
  console.log(s.slice(Math.max(0, idx - 200), idx + 200).replace(/\n/g, " ").slice(0, 420));
  console.log();
}

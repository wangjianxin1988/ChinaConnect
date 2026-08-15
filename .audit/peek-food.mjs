import fs from "node:fs";
const checks = [
  ["src/data/food/cities-food-data.ts", "cities-food-data"],
  ["src/data/food/sample-restaurants.ts", "sample-restaurants"],
  ["src/data/food/cities.ts", "data/food/cities"],
];
for (const [f, needle] of checks) {
  const s = fs.readFileSync(f, "utf8");
  console.log("=== " + f + " first lines ===");
  console.log(s.split("\n").slice(0, 12).join("\n"));
}

const fs = require("fs");
const lines = fs.readFileSync("src/components/food/RestaurantDetail.tsx", "utf8").split("\n");
for (let i = 280; i < 470; i++) console.log((i + 1) + ": " + lines[i]);

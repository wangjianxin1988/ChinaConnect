const fs = require("fs");
const s = fs.readFileSync("src/components/apps/AppRecommendationsSection.tsx", "utf8");
const lines = s.split("\n");
for (let i = 125; i < 200; i++) console.log((i + 1) + ": " + lines[i].slice(0, 160));

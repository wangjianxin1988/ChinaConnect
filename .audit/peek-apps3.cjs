const fs = require("fs");
const s = fs.readFileSync("src/components/apps/AppRecommendationsSection.tsx", "utf8");
const lines = s.split("\n");
for (let i = 0; i < 60; i++) console.log((i + 1) + ": " + lines[i].slice(0, 150));
console.log("...");
for (let i = 95; i < 125; i++) console.log((i + 1) + ": " + lines[i].slice(0, 150));

const fs = require("fs");
const s = fs.readFileSync("src/pages/[lang]/index.astro", "utf8");
const lines = s.split("\n");
for (let i = 25; i < 60; i++) console.log((i + 1) + ": " + lines[i]);

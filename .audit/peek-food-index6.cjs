const fs = require("fs");
const lines = fs.readFileSync("src/pages/[lang]/food/index.astro", "utf8").split("\n");
for (let i = 200; i < 300; i++) console.log((i + 1) + ": " + lines[i].slice(0, 150));

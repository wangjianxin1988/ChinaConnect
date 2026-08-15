const fs = require("fs");
const lines = fs.readFileSync("src/pages/[lang]/food/[id].astro", "utf8").split("\n");
for (let i = 40; i < 80; i++) console.log((i + 1) + ": " + lines[i]);

const fs = require("fs");
const lines = fs.readFileSync("src/pages/[lang]/food/[id].astro", "utf8").split("\n");
for (let i = 100; i < lines.length; i++) console.log((i + 1) + ": " + lines[i].slice(0, 150));

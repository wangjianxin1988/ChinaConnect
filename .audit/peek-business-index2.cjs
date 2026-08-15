const fs = require("fs");
const s = fs.readFileSync("src/pages/[lang]/guide/business/index.astro", "utf8");
const lines = s.split("\n");
for (let i = 60; i < lines.length; i++) console.log((i + 1) + ": " + lines[i].slice(0, 140));

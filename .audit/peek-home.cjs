const fs = require("fs"), path = require("path");
const p = "src/pages/[lang]/index.astro";
const s = fs.readFileSync(p, "utf8");
// find where city names render
const lines = s.split("\n");
lines.forEach((l, i) => {
  if (l.includes("nameZh") || (l.includes("city.") && l.includes("name"))) console.log((i + 1) + ": " + l.trim().slice(0, 140));
});
console.log("total lines:", lines.length);

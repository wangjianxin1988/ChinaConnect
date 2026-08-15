import fs from "node:fs";
const s = fs.readFileSync("src/pages/[lang]/city/[slug].astro", "utf8");
const lines = s.split(/\r?\n/);
lines.forEach((l, i) => { if (/Scenic|scenic|sectionScenic|scenicSpots/i.test(l)) console.log((i + 1) + ": " + l.trim().slice(0, 160)); });

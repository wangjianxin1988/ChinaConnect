const fs = require("fs");
const p = "src/components/Guide/PDFGenerator.tsx";
const s = fs.readFileSync(p, "utf8");
const lines = s.split("\n");
console.log("=== first 25 lines ===");
for (let i = 0; i < Math.min(25, lines.length); i++) console.log((i + 1) + ": " + lines[i]);
console.log("=== around 110-120 ===");
for (let i = 108; i < 122; i++) console.log((i + 1) + ": " + (lines[i] || "").slice(0, 120));

const fs = require("fs");
const s = fs.readFileSync("src/components/Guide/InvitationLetterClient.tsx", "utf8");
const lines = s.split("\n");
console.log("line 1-14 imports:");
for (let i = 0; i < Math.min(14, lines.length); i++) console.log((i + 1) + ": " + lines[i]);
console.log("--- around 195 ---");
for (let i = 190; i < 200; i++) console.log((i + 1) + ": " + (lines[i]||"").slice(0,100));

const fs = require("fs");
const src = fs.readFileSync("src/data/guide/ja-overrides.ts", "utf8");
for (const q of ["Canton Fair Complex", "Twice yearly (Spring & Autumn)", "National Exhibition and Convention Center (Hongqiao)", "Canton Fair official site (representative)", "China Briefing business culture guides", "Use \"Traveler\" mode for easier setup"]) {
  console.log(JSON.stringify(q), "->", src.includes(q) ? "FOUND" : "MISSING");
}
// check the file structure: count entries
const body = src.replace(/^export const JA_GUIDE_OVERRIDES[^=]*= /, "").replace(/;\s*$/, "");
let entries = 0;
try { const obj = JSON.parse(body); entries = Object.keys(obj).length; } catch (e) { console.log("parse fail:", e.message.slice(0,120)); }
console.log("entries:", entries);

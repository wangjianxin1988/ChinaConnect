import fs from "node:fs";
const SIMP = JSON.parse(fs.readFileSync(".audit/simplified-set.json", "utf8"));
const locs = JSON.parse(fs.readFileSync(".audit/ja-city-translate-locations.json", "utf8"));
const simpRe = new RegExp("[" + SIMP.join("") + "]");
const cn = Object.keys(locs).filter((s) => simpRe.test(s));
const charSet = new Set();
for (const s of cn) for (const ch of s) if (simpRe.test(ch)) charSet.add(ch);
console.log("unique simplified chars in CN strings (" + charSet.size + "):");
console.log([...charSet].sort().join(" "));

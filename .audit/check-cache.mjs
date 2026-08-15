import fs from "node:fs";
const cache = JSON.parse(fs.readFileSync(".audit/ja-translation-cache.json", "utf8"));
const locs = JSON.parse(fs.readFileSync(".audit/ja-city-translate-locations.json", "utf8"));
const keys = Object.keys(locs);
let inCache = 0, missing = [];
for (const k of keys) { if (cache[k]) inCache++; else missing.push(k); }
console.log("total:", keys.length, "| in cache:", inCache, "| missing:", missing.length);
console.log(missing.join("\n"));

import fs from "node:fs";
const cache = JSON.parse(fs.readFileSync(".audit/ja-translation-cache.json", "utf8"));
const locs = JSON.parse(fs.readFileSync(".audit/ja-city-translate-locations.json", "utf8"));
for (const k of Object.keys(locs)) {
  if (!cache[k]) console.log("NO TRANSLATION:", JSON.stringify(k));
  else if (cache[k] === k) console.log("UNCHANGED:", JSON.stringify(k));
}

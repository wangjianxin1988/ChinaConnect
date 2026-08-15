const fs = require("fs");
const CACHE = JSON.parse(fs.readFileSync(".audit/ja-translation-cache.json", "utf8"));
for (const k of ["Major international airports worldwide", "Varies by origin (8-14 hours)", "Download Alipay app before arrival"]) {
  console.log(JSON.stringify(k), "->", JSON.stringify(CACHE[k] || "(not in cache)").slice(0, 80));
}
// count cache keys that are English and map to Japanese
let enToJa = 0, sample = [];
for (const [k, v] of Object.entries(CACHE)) {
  if (/^[\x00-\x7F\s,.'()-]+$/.test(k) && /[\u3040-\u30ff]/.test(v)) {
    enToJa++;
    if (sample.length < 8) sample.push(k + " => " + v.slice(0, 40));
  }
}
console.log("EN->JA cache entries:", enToJa);
console.log(sample.join("\n"));

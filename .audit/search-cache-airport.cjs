const fs = require("fs");
const CACHE = JSON.parse(fs.readFileSync(".audit/ja-translation-cache.json", "utf8"));
const hits = Object.entries(CACHE).filter(([k]) => /airport|空港/i.test(k) || /international/i.test(k));
console.log("cache hits:", hits.length);
hits.slice(0, 20).forEach(([k, v]) => console.log("  " + k.slice(0, 70) + "  =>  " + v.slice(0, 70)));

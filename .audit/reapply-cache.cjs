const fs = require("fs");
const path = require("path");
const CACHE = JSON.parse(fs.readFileSync(".audit/ja-translation-cache.json", "utf8"));
const DIR = "src/data/cities-i18n/ja";
let applied = 0, filesTouched = 0;
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".json"))) {
  const fp = path.join(DIR, f);
  const data = JSON.parse(fs.readFileSync(fp, "utf8"));
  let changed = 0;
  const fix = (obj) => {
    if (typeof obj === "string") {
      const v = CACHE[obj];
      if (typeof v === "string" && v !== obj) { changed++; return v; }
      return obj;
    }
    if (Array.isArray(obj)) return obj.map(fix);
    if (obj && typeof obj === "object") {
      for (const k of Object.keys(obj)) obj[k] = fix(obj[k]);
      return obj;
    }
    return obj;
  };
  const fixed = fix(data);
  if (changed) { fs.writeFileSync(fp, JSON.stringify(fixed, null, 2), "utf8"); applied += changed; filesTouched++; }
}
console.log("applied", applied, "translations across", filesTouched, "files");

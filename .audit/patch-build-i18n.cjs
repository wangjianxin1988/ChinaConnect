const fs = require("fs");
const p = "build-i18n-content.mjs";
let s = fs.readFileSync(p, "utf8");
const orig = s;
s = s.replace(
  `  for (const f of files) {
    const d = JSON.parse(readFileSync(f, 'utf8'));
    const slug = d.slug;
    const merged = JSON.parse(JSON.stringify(d));`,
  `  for (const f of files) {
    const d = JSON.parse(readFileSync(f, 'utf8'));
    const slug = d.slug;
    // Preserve existing per-language translations: build on top of the current
    // lang file when present, so already-translated values are never reverted
    // to the base (Chinese) source by a rebuild.
    const existingFile = join(langDir, slug + '.json');
    let base = d;
    if (existsSync(existingFile)) {
      try { base = JSON.parse(readFileSync(existingFile, 'utf8')); } catch {}
    }
    const merged = JSON.parse(JSON.stringify(base));`
);
fs.writeFileSync(p, s);
console.log("changed:", orig !== s);

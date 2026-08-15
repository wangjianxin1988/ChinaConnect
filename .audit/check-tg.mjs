import fs from "node:fs";
const tr = fs.readFileSync("src/i18n/translations.ts", "utf8");
// Extract each top-level section's keys from en block (first ~4500 lines contains en)
const enPart = tr.split("\n").slice(0, 4500).join("\n");
const sections = {};
for (const m of enPart.matchAll(/\n    (\w+): \{([\s\S]*?)\n    \},/g)) {
  const keys = [...m[2].matchAll(/^\s{6}(\w+):/gm)].map((x) => x[1]);
  sections[m[1]] = new Set(keys);
}
const comps = fs.readdirSync("src/components/Guide").filter((f) => f.endsWith(".tsx"));
for (const f of comps) {
  const src = fs.readFileSync("src/components/Guide/" + f, "utf8");
  const tgm = src.match(/const tg = \(t\.(\w+)/);
  if (!tgm) continue;
  const sec = tgm[1];
  const keys = new Set();
  for (const m of src.matchAll(/tg\.(\w+)/g)) keys.add(m[1]);
  const missing = [...keys].filter((k) => !sections[sec]?.has(k));
  if (missing.length) console.log(f + " [" + sec + "] missing keys: " + missing.join(", "));
}

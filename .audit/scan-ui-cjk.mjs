import fs from "node:fs";

const targets = ["src/i18n/components-strings.ts", "src/i18n/translations.ts"];
const LANGS = ["ko", "th", "vi", "ru", "fr", "de", "ar", "fa"];
const CJK = /[\u3400-\u9fff]/;

for (const f of targets) {
  if (!fs.existsSync(f)) continue;
  const txt = fs.readFileSync(f, "utf8");
  const lines = txt.split(/\r?\n/);
  const hits = {};
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const m = /^\s*(ko|th|vi|ru|fr|de|ar|fa)\s*:\s*['"`](.*)['"`],?\s*$/.exec(line);
    if (m && LANGS.includes(m[1])) {
      const lang = m[1];
      const val = m[2];
      if (CJK.test(val)) {
        (hits[lang] = hits[lang] || []).push({ line: i + 1, val: val.slice(0, 90) });
      }
    }
  }
  console.log("===", f, "===");
  let total = 0;
  for (const lang of LANGS) {
    const arr = hits[lang] || [];
    total += arr.length;
    console.log(`[${lang}] ${arr.length}`);
    arr.slice(0, 6).forEach((h) => console.log(`   L${h.line} ${h.val}`));
  }
  console.log(`TOTAL: ${total}`);
}

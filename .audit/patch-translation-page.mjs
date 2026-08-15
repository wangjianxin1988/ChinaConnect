import fs from "node:fs";
const p = "src/pages/[lang]/guide/business/translation.astro";
let s = fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n");
s = s.replace('title={translations.en.businessGuidePage?.translationTitle || "Translation & Interpreting Services - ChinaConnect"}',
  'title={(translations[lang] || translations.en).businessGuidePage?.translationTitle || "Translation & Interpreting Services - ChinaConnect"}');
s = s.replace('description={translations.en.businessGuidePage?.translationDescription || "Book vetted interpreters and translators for meetings, conferences, and negotiations in China."}',
  'description={(translations[lang] || translations.en).businessGuidePage?.translationDescription || "Book vetted interpreters and translators for meetings, conferences, and negotiations in China."}');
// intro paragraph
s = s.replace(/<p class="text-muted-foreground max-w-2xl">\s*Book professional interpreters[\s\S]*?<\/p>/,
  '<p class="text-muted-foreground max-w-2xl" data-i18n="businessGuidePage.translationDescription">\n        Book professional interpreters and translators for your business visits in China.\n        From consecutive interpreting at meetings to certified document translation for visa applications.\n      </p>');
const tmp = p + ".tmp";
fs.writeFileSync(tmp, s);
fs.renameSync(tmp, p);
console.log("patched translation.astro");

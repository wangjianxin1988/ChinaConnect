import fs from "fs";
const file = "build-i18n-content.mjs";
let t = fs.readFileSync(file, "utf8");
const old = `        if (m.highlights && baseAttr) {
          m.highlights = m.highlights.map((h, i) => (h === baseAttr.highlights[i] ? (tr['attr.' + a.id + '.highlight.' + i] || h) : h));
        }`;
const neu = `        if (m.highlights && baseAttr) {
          const baseHighlights = baseAttr.highlights || baseAttr.highopts || [];
          m.highlights = m.highlights.map((h, i) => (h === baseHighlights[i] ? (tr['attr.' + a.id + '.highlight.' + i] || h) : h));
        }`;
if (!t.includes(old)) { console.error("pattern not found"); process.exit(1); }
t = t.replace(old, neu);
fs.writeFileSync(file, t, "utf8");
console.log("patched build-i18n-content.mjs");

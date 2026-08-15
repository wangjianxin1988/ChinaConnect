const fs = require("fs"), path = require("path");
const dir = "src/pages/[lang]/guide";
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".astro")) continue;
  const s = fs.readFileSync(path.join(dir, f), "utf8");
  const clientRefs = [...s.matchAll(/<([A-Z]\w*Client)\b[^>]*\/>/g)].map((m) => m[1]);
  if (clientRefs.length) {
    const hasLang = /lang=\{(?:lang|i18n)\}/.test(s);
    console.log(f + ": clients=" + [...new Set(clientRefs)].join(",") + (hasLang ? " [lang passed]" : " [NO lang passed]"));
  }
}

const fs = require("fs"), path = require("path");
const dir = "src/pages/[lang]/guide";
function walk(d, out) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) { walk(p, out); continue; }
    if (!f.endsWith(".astro")) continue;
    const s = fs.readFileSync(p, "utf8");
    const clientRefs = [...s.matchAll(/<([A-Z]\w*Client)\b[^>]*\/>/g)].map((m) => m[1]);
    if (clientRefs.length) {
      const hasLang = /lang=\{lang\}/.test(s) || /lang=\{i18n\}/.test(s);
      console.log(p.replace(/\\/g, "/") + ": clients=" + [...new Set(clientRefs)].join(",") + (hasLang ? " [lang passed]" : " [CHECK]"));
    }
  }
  return out;
}
walk(dir, []);

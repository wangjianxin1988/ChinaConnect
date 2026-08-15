import fs from "node:fs";
const s = fs.readFileSync("src/i18n/translations.ts", "utf8");
const langRe = /^  ([a-zA-Z-]+|"[a-zA-Z-]+"): \{/gm;
const langBlocks = [];
let m;
while ((m = langRe.exec(s))) {
  const start = m.index;
  const rest = s.slice(start);
  const close = rest.search(/\n  \},/m);
  langBlocks.push({ name: m[1].replace(/"/g, ""), body: rest.slice(0, close) });
}
const langs = ["en", "ja", "ko", "th", "vi", "ru", "fr", "de", "ar", "fa", "zh-CN", "zh-TW"];
for (const lang of langs) {
  const b = langBlocks.find((x) => x.name === lang);
  if (!b) { console.log(lang, "NO BLOCK"); continue; }
  const cb = b.body.indexOf("cityPage: {");
  if (cb < 0) { console.log(lang, "no cityPage"); continue; }
  const end = b.body.indexOf("    },", cb);
  const cityBlock = b.body.slice(cb, end);
  const suf = /pageTitleSuffix: "([^"]*)"/.exec(cityBlock);
  const pt = /pageTitle: "([^"]*)"/.exec(cityBlock);
  console.log(lang.padEnd(6), "suffix:", suf ? JSON.stringify(suf[1]) : "(MISSING)", "pageTitle:", pt ? JSON.stringify(pt[1]) : "(none)");
}

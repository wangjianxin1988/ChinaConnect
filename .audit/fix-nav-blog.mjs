import fs from "node:fs";
const map = { en: "Blog", ja: "ブログ", ko: "블로그", "zh-CN": "博客", "zh-TW": "部落格", th: "ブログ".replace("ブログ","บล็อก"), vi: "Blog", ru: "Блог", fr: "Blog", de: "Blog", ar: "مدونة", fa: "وبلاگ" };
let s = fs.readFileSync("src/i18n/translations.ts", "utf8").replace(/\r\n/g, "\n");
const langRe = /^  ([a-zA-Z-]+|"[a-zA-Z-]+"): \{/gm;
const blocks = [];
let m;
while ((m = langRe.exec(s))) blocks.push({ name: m[1].replace(/"/g, ""), start: m.index });
let fixed = 0;
for (const lang of Object.keys(map)) {
  const block = blocks.find((b) => b.name === lang);
  if (!block) { console.log("no block", lang); continue; }
  const rest = s.slice(block.start);
  const close = rest.search(/\n  \},/m);
  const body = rest.slice(0, close);
  const nav = body.indexOf("nav: {");
  if (nav < 0) { console.log("no nav", lang); continue; }
  const sub = body.slice(nav);
  const subClose = sub.indexOf("\n    },");
  const target = block.start + nav;
  const navBlock = sub.slice(0, subClose);
  const re = /blog: "([^"]*)"/;
  if (!re.test(navBlock)) { console.log("no blog key", lang); continue; }
  const abs = target + navBlock.indexOf('blog: "');
  const lineEnd = s.indexOf("\n", abs);
  const before = s.slice(abs, lineEnd);
  s = s.slice(0, abs) + `blog: ${JSON.stringify(map[lang])}` + s.slice(lineEnd);
  fixed++;
}
const tmp = "src/i18n/translations.ts.tmp";
fs.writeFileSync(tmp, s);
fs.renameSync(tmp, "src/i18n/translations.ts");
console.log("nav.blog fixed for", fixed, "languages");

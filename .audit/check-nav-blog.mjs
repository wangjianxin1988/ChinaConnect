import fs from "node:fs";
const s = fs.readFileSync("src/i18n/translations.ts", "utf8");
const langRe = /^  ([a-zA-Z-]+|"[a-zA-Z-]+"): \{/gm;
const blocks = [];
let m;
while ((m = langRe.exec(s))) {
  const rest = s.slice(m.index);
  const close = rest.search(/\n  \},/m);
  blocks.push({ name: m[1].replace(/"/g, ""), body: rest.slice(0, close) });
}
for (const b of blocks) {
  const nav = b.body.indexOf("nav: {");
  if (nav < 0) { console.log(b.name, "no nav"); continue; }
  const end = b.body.indexOf("    },", nav);
  const blk = b.body.slice(nav, end);
  const blog = /blog: "([^"]*)"/.exec(blk);
  console.log(b.name.padEnd(6), "nav.blog:", blog ? JSON.stringify(blog[1]) : "(MISSING)");
}

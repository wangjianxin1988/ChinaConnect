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
const en = blocks.find((b) => b.name === "en").body;
const enNavStart = en.indexOf("nav: {");
const enNavEnd = en.indexOf("    },", enNavStart);
const enNav = en.slice(enNavStart, enNavEnd);
const keys = [...enNav.matchAll(/^\s{6}([a-zA-Z0-9_]+):/gm)].map((x) => x[1]);
console.log("nav keys:", keys.length);
for (const b of blocks) {
  const nav = b.body.indexOf("nav: {");
  if (nav < 0) { console.log(b.name, "no nav"); continue; }
  const end = b.body.indexOf("    },", nav);
  const blk = b.body.slice(nav, end);
  const missing = [];
  for (const k of keys) {
    const re = new RegExp("^\\s{6}" + k + ': "([^"]*)"', "m");
    const mv = blk.match(re);
    if (!mv) { missing.push(k + ":(none)"); continue; }
    if (mv[1] === enNav.match(new RegExp("^\\s{6}" + k + ': "([^"]*)"', "m"))[1] && k !== "blog" && b.name !== "en") {
      // identical to en — flag
      missing.push(k + ":=en");
    }
  }
  if (missing.length) console.log(b.name.padEnd(6), "->", missing.join(", "));
}

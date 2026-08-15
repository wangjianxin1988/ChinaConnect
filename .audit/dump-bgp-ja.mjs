import fs from "node:fs";
const s = fs.readFileSync("src/i18n/translations.ts", "utf8");
const langRe = /^  ([a-zA-Z-]+|"[a-zA-Z-]+"): \{/gm;
let m; const blocks = [];
while ((m = langRe.exec(s))) {
  const rest = s.slice(m.index);
  const close = rest.search(/\n  \},/m);
  blocks.push({ name: m[1].replace(/"/g, ""), body: rest.slice(0, close) });
}
const ja = blocks.find((b) => b.name === "ja").body;
const cb = ja.indexOf("businessGuidePage: {");
const end = ja.indexOf("    },", cb);
console.log(ja.slice(cb, end));

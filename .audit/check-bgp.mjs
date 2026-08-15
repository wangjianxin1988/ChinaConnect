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
for (const b of langBlocks) {
  const cb = b.body.indexOf("businessGuidePage: {");
  if (cb < 0) { console.log(b.name, "no businessGuidePage"); continue; }
  const end = b.body.indexOf("    },", cb);
  const keys = b.body.slice(cb, end);
  const regShort = /registrationShort: "([^"]*)"/.exec(keys);
  const regTitle = /registrationTitle: "([^"]*)"/.exec(keys);
  const etiquette = /etiquetteTitle: "([^"]*)"/.exec(keys);
  const expo = /expoTitle: "([^"]*)"/.exec(keys);
  const invitation = /invitationTitle: "([^"]*)"/.exec(keys);
  const translation = /translationTitle: "([^"]*)"/.exec(keys);
  console.log(b.name.padEnd(6), "regShort:", regShort ? JSON.stringify(regShort[1]) : "-", "| regTitle:", regTitle ? JSON.stringify(regTitle[1]) : "-", "| etiq:", etiquette ? JSON.stringify(etiquette[1]) : "-", "| expo:", expo ? JSON.stringify(expo[1]) : "-", "| inv:", invitation ? JSON.stringify(invitation[1]) : "-", "| trans:", translation ? JSON.stringify(translation[1]) : "-");
}

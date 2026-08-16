import fs from "node:fs";
const txt = fs.readFileSync("src/i18n/translations.ts", "utf8");
const lines = txt.split(/\r?\n/);
const langRe = /^  (en|ja|ko|zh-CN|zh-TW|th|vi|ru|fr|de|ar|fa): \{/;
let cur = null;
const found = {};
for (let i = 0; i < lines.length; i += 1) {
  const lm = langRe.exec(lines[i]);
  if (lm) { cur = lm[1]; continue; }
  if (cur && lines[i].trim() === "scenicSpots: {") {
    const end = Math.min(lines.length, i + 1 + 30);
    found[cur] = lines.slice(i + 1, end).join("\n");
  }
}
for (const lang of Object.keys(found)) {
  const body = found[lang];
  const title = (body.match(/title: "([^"]*)"/) || [])[1];
  const subtitle = (body.match(/subtitle: "([^"]*)"/) || [])[1];
  const spots = (body.match(/spotsCount: "([^"]*)"/) || [])[1];
  console.log(lang.padEnd(6), "title:", title, "| spotsCount:", spots, "| subtitle:", (subtitle || "").slice(0, 40));
}

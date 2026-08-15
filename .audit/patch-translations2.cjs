const fs = require("fs");
const p = "src/i18n/translations.ts";
let src = fs.readFileSync(p, "utf8");
// Undo the wrong insertion
const bad = 'ja: {\n    aiPage: { description: "中国旅行のパーソナルアシスタント — 旅程、現地情報、リアルタイムガイダンス。", },\n    accommodationGuide';
if (src.includes(bad)) {
  src = src.split(bad).join("ja: {\n    accommodationGuide");
  console.log("undone");
}
// Now insert description into the existing ja aiPage block: add after "dailyUsage" or before "description: ..." hmm. Insert after "pageDescription" key in ja aiPage.
const anchor = '      pageDescription: "中国旅行に関するあらゆる質問にお答えします。",';
if (src.includes(anchor)) {
  src = src.split(anchor).join(anchor + '\n      description: "中国旅行のパーソナルアシスタント — 旅程、現地情報、リアルタイムガイダンス。",');
  console.log("description inserted into ja aiPage");
} else {
  console.log("ANCHOR NOT FOUND");
}
fs.writeFileSync(p, src);

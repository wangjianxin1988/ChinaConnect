const fs = require('fs');
const text = fs.readFileSync('src/i18n/translations.ts', 'utf8');
const lines = text.split(/\r\n/);
// 找 zh-CN 和 zh-TW 块起始
let zhCNLine = -1, zhTWLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('\"zh-CN\": {')) zhCNLine = i;
  if (lines[i].includes('\"zh-TW\": {')) zhTWLine = i;
}
console.log('zh-CN line:', zhCNLine);
console.log('zh-TW line:', zhTWLine);
// 看 zh-TW 内部
for (let i = zhTWLine; i < zhTWLine + 50; i++) {
  console.log((i+1) + ': ' + lines[i].substring(0, 100));
}

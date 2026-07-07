const fs = require('fs');
const text = fs.readFileSync('src/i18n/translations.ts', 'utf8');
// 在 translations record 之后找 zh 块
const recordStart = text.indexOf('export const translations');
const rec = text.substring(recordStart);
['en','ja','ko','zh-CN','zh-TW','th','vi','ru','fr','de','ar','fa'].forEach(l => {
  const found = rec.includes('\n  ' + l + ': {');
  const foundQ = rec.includes('\n  \"' + l + '\": {');
  console.log(l + ': plain=' + found + ' quoted=' + foundQ);
});
// 找 zh 实际是怎么写的
const m = rec.match(/zh[\s\S]{0,30}/g);
if (m) console.log('zh matches:', m.slice(0, 3));

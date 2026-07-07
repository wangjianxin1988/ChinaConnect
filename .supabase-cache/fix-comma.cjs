const fs = require('fs');
const path = 'src/i18n/translations.ts';
let text = fs.readFileSync(path, 'utf8');
const NL = '\r\n';

// 修正: 找到 "business: ... \r\n  \r\n      tagline:" 模式，business 后面加逗号
const re = new RegExp(
  '(business:\\s*"[^"]*")(\\s*' + NL + '\\s*)' + NL + '(\\s*tagline:)',
  'g'
);
let count = 0;
text = text.replace(re, (m, biz, blank) => {
  count++;
  return biz + ',' + blank + NL + '    ' + blank.trim() + 'tagline:';
});
console.log('Fixed', count, 'missing commas');
fs.writeFileSync(path, text, 'utf8');

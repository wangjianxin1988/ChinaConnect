const fs = require('fs');
const path = 'src/i18n/translations.ts';
let text = fs.readFileSync(path, 'utf8');
const re = /(business:\s*"[^"]*"\r\n    \r\n      tagline:[^\r]*)/g;
let count = 0;
text = text.replace(re, (m, biz) => {
  count++;
  // 替换为: business: "...",\r\n      tagline: ...
  return biz.replace(/(\r\n    \r\n      )/, ',\r\n      ');
});
console.log('Fixed', count, 'blocks');
fs.writeFileSync(path, text, 'utf8');

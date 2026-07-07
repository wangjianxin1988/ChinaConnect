const fs = require('fs');
const path = 'src/i18n/translations.ts';
let text = fs.readFileSync(path, 'utf8');
const NL = '\r\n';

const re = /(business:\s*"[^"]*")(\n    \r\n      tagline:[^\n]*)/g;
let count = 0;
text = text.replace(re, (m, biz, rest) => {
  count++;
  return biz + ',' + NL + '      ' + rest.replace(/\n    \r\n      /, '').trimStart();
});
console.log('Fixed', count, 'blocks');
fs.writeFileSync(path, text, 'utf8');

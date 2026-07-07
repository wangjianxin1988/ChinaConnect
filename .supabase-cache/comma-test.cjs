const fs = require('fs');
const path = 'src/i18n/translations.ts';
let text = fs.readFileSync(path, 'utf8');

// 找 'business: "..."\n    \r\n      tagline:' 模式
const m = text.match(/business:\s*"[^"]*"\n    \r\n      tagline:/);
console.log('Match found:', !!m);
if (m) {
  const re = new RegExp('(business:\\s*"[^"]*")(\\n    \\r\\n      tagline:[^\\n]*)', 'g');
  let count = 0;
  text = text.replace(re, (mm, biz, rest) => {
    count++;
    return biz + ',\r\n      ' + rest.replace(/\n    \r\n      /, '').trimStart();
  });
  console.log('Replaced', count);
  fs.writeFileSync(path, text, 'utf8');
}

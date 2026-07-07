const fs = require('fs');
const text = fs.readFileSync('src/i18n/translations.ts', 'utf8');
const idx = text.indexOf('zh-CN');
console.log(JSON.stringify(text.substring(idx - 5, idx + 20)));

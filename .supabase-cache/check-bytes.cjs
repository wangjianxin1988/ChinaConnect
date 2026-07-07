const fs = require('fs');
const text = fs.readFileSync('src/i18n/translations.ts', 'utf8');
const pos = text.indexOf('business: \"Business Express\"');
const slice = text.substring(pos, pos + 100);
console.log(JSON.stringify(slice));

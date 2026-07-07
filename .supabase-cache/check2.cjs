const fs = require('fs');
const text = fs.readFileSync('src/i18n/translations.ts', 'utf8');
const pos = text.indexOf('business: \"Business Express\"');
console.log('byte codes around position 2170:');
const slice = text.substring(pos, pos + 120);
console.log(JSON.stringify(slice));

const fs = require('fs');
const text = fs.readFileSync('src/i18n/translations.ts', 'utf8');
const recStart = text.indexOf('export const translations');
const recBrace = text.indexOf('{', recStart);
console.log('recBrace pos:', recBrace);
const slice = text.substring(recBrace, recBrace + 50);
console.log('after brace:', JSON.stringify(slice));
const recEnd = text.indexOf('};', recBrace);
console.log('recEnd pos:', recEnd);

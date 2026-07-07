const fs = require('fs');
const text = fs.readFileSync('src/i18n/translations.ts', 'utf8');
const hasCRLF = text.includes('\r\n');
console.log('Has CRLF:', hasCRLF);
console.log('Total length:', text.length);
const navStart = text.indexOf('nav: {');
const snippet = text.substring(navStart, navStart + 200);
console.log('Raw nav start (with escaping):');
console.log(JSON.stringify(snippet));

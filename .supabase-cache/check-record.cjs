const fs = require('fs');
const text = fs.readFileSync('src/i18n/translations.ts', 'utf8');

const recordStart = text.indexOf('export const translations');
const recordBrace = text.indexOf('{', recordStart);
console.log('recordBrace pos:', recordBrace);
console.log('first 500 chars after { :');
console.log(text.substring(recordBrace, recordBrace + 500));

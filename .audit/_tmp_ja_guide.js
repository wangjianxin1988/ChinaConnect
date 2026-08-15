const src = require('fs').readFileSync('src/i18n/translations.ts','utf8');
const jaStart = src.indexOf('ja: {');
const jaGuide = src.indexOf('guidePage:', jaStart);
const jaEnd = src.indexOf('\n    },', jaGuide);
const block = src.slice(jaGuide, jaEnd);
const keys = [...block.matchAll(/([A-Za-z0-9_]+):\s*"([^"]*)"/g)].map(m => m[1] + ' = ' + m[2]);
console.log('ja guidePage keys count:', keys.length);
keys.forEach(k => console.log(k));

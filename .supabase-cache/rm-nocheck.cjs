const fs = require('fs');
const path = 'src/pages/ai.astro';
let text = fs.readFileSync(path, 'utf8');
// 去掉 // @ts-nocheck
text = text.replace(/^\/\/ @ts-nocheck\r?\n/, '');
fs.writeFileSync(path, text, 'utf8');
console.log('Removed @ts-nocheck from ai.astro');

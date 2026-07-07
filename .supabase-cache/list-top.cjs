const fs = require('fs');
const text = fs.readFileSync('src/i18n/translations.ts', 'utf8');
const ifaceStart = text.indexOf('export interface Translations');
const ifaceEnd = text.indexOf('}\n', ifaceStart);
const ifaceText = text.substring(ifaceStart, ifaceEnd + 1);
// 列出所有顶级字段
const topFields = [];
const re = /^\s+(\w+):\s*\{/gm;
let m;
while ((m = re.exec(ifaceText)) !== null) topFields.push(m[1]);
console.log('Top-level interface fields:', topFields.join(', '));
console.log('Count:', topFields.length);

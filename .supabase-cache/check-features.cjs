const fs = require('fs');
const text = fs.readFileSync('src/i18n/translations.ts', 'utf8');

// 检查 features 是否在接口中
const ifaceStart = text.indexOf('export interface Translations');
const ifaceEnd = text.indexOf('}\n', ifaceStart);
const ifaceText = text.substring(ifaceStart, ifaceEnd + 1);
const hasFeaturesIface = /\\bfeatures\\s*:\\s*\\{/.test(ifaceText);
console.log('features: in interface:', hasFeaturesIface);

// 找 features: 在文件中的所有出现
const matches = text.match(/^\\s+features:\\s*\\{/gm) || [];
console.log('features: { occurrences in file:', matches.length);

// 看看第一个 features 块位置
const fpos = text.indexOf('features: {');
console.log('First features: { at pos:', fpos);
if (fpos > 0) {
  const ifaceStart = text.indexOf('export interface Translations');
  console.log('Interface starts at:', ifaceStart, '- features is in data' + (fpos > ifaceStart ? ' (after iface)' : ' (in iface)'));
}

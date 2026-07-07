const fs = require('fs');
const text = fs.readFileSync('src/i18n/translations.ts', 'utf8');
const lines = text.split(/\r\n/);
// 输出 zh-TW 内部所有行
for (let i = 714; i < lines.length; i++) {
  console.log((i+1) + ': ' + lines[i].substring(0, 100));
  if (lines[i].trim() === '};' && i > 850) break;
}

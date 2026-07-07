const fs = require('fs');
const path = 'src/layouts/Layout.astro';
let text = fs.readFileSync(path, 'utf8');
// 修复: // @ts-nocheck 必须后接空行
if (text.startsWith('// @ts-nocheck\r\n---')) {
  text = '// @ts-nocheck\r\n\r\n---\r\n' + text.substring('// @ts-nocheck\r\n---'.length);
  fs.writeFileSync(path, text, 'utf8');
  console.log('Fixed Layout.astro with CRLF');
} else if (text.startsWith('// @ts-nocheck\n---')) {
  text = '// @ts-nocheck\n\n---\n' + text.substring('// @ts-nocheck\n---'.length);
  fs.writeFileSync(path, text, 'utf8');
  console.log('Fixed Layout.astro with LF');
} else {
  console.log('Layout.astro format different:', JSON.stringify(text.substring(0, 20)));
}

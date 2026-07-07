const fs = require('fs');
const path = 'src/layouts/Layout.astro';
let text = fs.readFileSync(path, 'utf8');
// 修复: // @ts-nocheck 必须在 frontmatter 之外 (--- 之前)
// 当前的格式是: "// @ts-nocheck\n---\n..." (无空行) - 改成 "// @ts-nocheck\n\n---\n..."
if (text.startsWith('// @ts-nocheck\n---')) {
  text = '// @ts-nocheck\n\n---\n' + text.substring('// @ts-nocheck\n---'.length);
  fs.writeFileSync(path, text, 'utf8');
  console.log('Fixed Layout.astro');
} else {
  console.log('Layout.astro format is fine or different');
}

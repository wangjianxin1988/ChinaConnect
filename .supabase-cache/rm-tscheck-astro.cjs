const fs = require('fs');
const path = require('path');

function walk(dir, files = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (f.name === 'node_modules' || f.name === '.git' || f.name === 'dist' || f.name === '.astro') continue;
      walk(p, files);
    } else if (p.endsWith('.astro')) {
      files.push(p);
    }
  }
  return files;
}

const files = walk('src');
let count = 0;
for (const f of files) {
  let text = fs.readFileSync(f, 'utf8');
  // 移除 // @ts-nocheck 顶部 (Astro 不需要这个，跳过 TS check 不会影响 build)
  if (text.startsWith('// @ts-nocheck\n\n---\n')) {
    text = '---\n' + text.substring('// @ts-nocheck\n\n---\n'.length);
    fs.writeFileSync(f, text, 'utf8');
    count++;
  } else if (text.startsWith('// @ts-nocheck\r\n\r\n---\r\n')) {
    text = '---\r\n' + text.substring('// @ts-nocheck\r\n\r\n---\r\n'.length);
    fs.writeFileSync(f, text, 'utf8');
    count++;
  }
}
console.log('Removed // @ts-nocheck from', count, '.astro files');

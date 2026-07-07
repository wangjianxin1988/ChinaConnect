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
  let changed = false;
  // CRLF
  if (text.startsWith('// @ts-nocheck\r\n---')) {
    text = '// @ts-nocheck\r\n\r\n---\r\n' + text.substring('// @ts-nocheck\r\n---'.length);
    changed = true;
  } else if (text.startsWith('// @ts-nocheck\n---')) {
    text = '// @ts-nocheck\n\n---\n' + text.substring('// @ts-nocheck\n---'.length);
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(f, text, 'utf8');
    count++;
  }
}
console.log('Fixed', count, '.astro files');

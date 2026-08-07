import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['src', 'public', 'scripts', 'astro.config.mjs', 'wrangler.toml'];
const targets = [];
const skipDirs = new Set(['node_modules', '.git', 'dist', '.astro', '.wrangler', '.claude', '.agents', '.supabase-cache', '.supabase-schema']);

function walk(dir) {
  for (const e of readdirSync(dir)) {
    if (skipDirs.has(e)) continue;
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (/\.(astro|ts|tsx|js|mjs|json|md|mdx|css|html|xml|txt|toml)$/.test(e)) targets.push(p);
  }
}

for (const r of roots) {
  try {
    const s = statSync(r);
    if (s.isDirectory()) walk(r);
    else targets.push(r);
  } catch {}
}

let totalChanges = 0;
const changedFiles = [];
for (const f of targets) {
  const orig = readFileSync(f, 'utf8');
  const next = orig.replace(/chinaconnect\.com/g, 'chinaconnect.io');
  if (next !== orig) {
    writeFileSync(f, next);
    const count = (orig.match(/chinaconnect\.com/g) || []).length;
    totalChanges += count;
    changedFiles.push(f + ' (' + count + ')');
  }
}
console.log('Changed files:');
changedFiles.forEach(f => console.log('  ' + f));
console.log('Total replacements:', totalChanges);
# -*- coding: utf-8 -*-
import io
p = 'scripts/fix-city-data-eng.mjs'
s = io.open(p, encoding='utf-8').read()
s = s.replace("const dryRun = args.includes(\"--dry-run\");", "const dryRun = args.includes(\"--dry-run\");\nconst showSample = args.includes(\"--sample\");")
s = s.replace("  console.log(`[${lang}] actionable fields: ${actionable.length}`);", "  console.log(`[${lang}] actionable fields: ${actionable.length}`);\n  if (showSample) { for (const a of actionable.slice(0, 15)) console.log(`    ${a.file} ${a.path} = ${JSON.stringify(a.value).slice(0, 90)}`); }")
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('patched')

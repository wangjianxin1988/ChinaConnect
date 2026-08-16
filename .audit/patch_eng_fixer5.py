# -*- coding: utf-8 -*-
import io
p = 'scripts/fix-city-data-eng.mjs'
lines = io.open(p, encoding='utf-8').read().split('\n')
# replace lines 215..238 (index 214..237) with generalized CJK pass
new_block = [
  "  // Additional pass: any leftover CJK value (non-zh langs) where EN source is",
  "  // clean English and ja is Japanese -> translate EN source into target.",
  "  if (lang !== \"zh-CN\" && lang !== \"zh-TW\") {",
  "    for (const fn of fs.readdirSync(langDir).filter((f) => f.endsWith(\".json\"))) {",
  "      const target = allTarget[fn];",
  "      const slug = fn.replace(/\\.json$/, \"\");",
  "      const enFile = path.join(SRC, `${slug}.json`);",
  "      const jaFile = path.join(BASE, \"ja\", fn);",
  "      if (!fs.existsSync(enFile) || !fs.existsSync(jaFile)) continue;",
  "      const enFields = walk(JSON.parse(fs.readFileSync(enFile, \"utf8\")));",
  "      const jaFields = walk(JSON.parse(fs.readFileSync(jaFile, \"utf8\")));",
  "      for (const [p, v] of Object.entries(walk(target))) {",
  "        if (!CJK_RE.test(v)) continue;",
  "        if (p.endsWith(\".name\") || p.endsWith(\".nameEn\") || p.endsWith(\".category\") || p.endsWith(\".importance\")) continue;",
  "        if (p === \"name\") continue;",
  "        if (p.includes(\"emergencyContacts\")) continue;",
  "        if (isKeepableToken(v)) continue;",
  "        const enV = enFields[p];",
  "        const jaV = jaFields[p];",
  "        if (typeof enV !== \"string\" || typeof jaV !== \"string\") continue;",
  "        if (!/[\u3040-\u30ff\u3400-\u9fff]/.test(jaV)) continue;",
  "        if (!actionable.some((x) => x.file === fn && x.path === p)) {",
  "          actionable.push({ file: fn, path: p, value: v, enValue: enV, jaValue: jaV });",
  "        }",
  "      }",
  "    }",
  "  }",
]
# sanity: verify the slice boundaries
assert lines[214].startswith('  // Additional pass: CJK-containing price fields'), lines[214]
assert lines[238].startswith('  console.log(`[${lang}] actionable fields'), lines[238]
lines[214:238] = new_block
io.open(p, 'w', encoding='utf-8', newline='\n').write('\n'.join(lines))
print('replaced; total lines now', len(lines))

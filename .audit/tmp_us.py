import io, re
s = io.open('src/i18n/translations.ts', encoding='utf-8').read()
# find underscore-only keys
for m in re.finditer(r'^(\s+)(_+):\s*"([^"]*)"', s, re.M):
    print(repr(m.group(2)[:20]), '=>', repr(m.group(3)[:80]))
    if m.start() > 2000000: break

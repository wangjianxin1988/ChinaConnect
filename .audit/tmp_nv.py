import io, re
s = io.open('src/i18n/translations.ts', encoding='utf-8').read()
i = s.find('  ko: {')
j = s.find('  th: {')
seg = s[i:j]
# find lines with key: non-string values
for ln, l in enumerate(seg.split(chr(10))):
    m = re.match(r'^\s+([A-Za-z0-9_]+):\s*([^"{\s][^,]*),?$', l)
    if m:
        print('line', ln, ':', l.strip()[:100])

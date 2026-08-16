import io, re
s = io.open('src/i18n/translations.ts', encoding='utf-8').read()
i = s.find('  ko: {')
j = s.find('  th: {')
seg = s[i:j]
m = re.search(r'foodSubtitle: "([^"]*)"', seg)
print('ko foodSubtitle:', m.group(1) if m else 'NOT FOUND')
m2 = re.search(r'foodHighlightsSubtitle: "([^"]*)"', seg)
print('ko foodHighlightsSubtitle:', m2.group(1) if m2 else 'NOT FOUND')

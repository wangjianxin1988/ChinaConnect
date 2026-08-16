import io, re
s = io.open('src/pages/[lang]/city/[slug].astro', encoding='utf-8').read()
print('LEN', len(s))
# find the t() or ct() helper
for kw in ['function t(', 'const t =', 'function ct(', 'const ct =', 'foodHighlightsTitle', 'foodSubtitle']:
    i = s.find(kw)
    print('====', kw, 'at', i)
    if i >= 0:
        print(s[max(0,i-200):i+400].replace('\n', ' ')[:600])

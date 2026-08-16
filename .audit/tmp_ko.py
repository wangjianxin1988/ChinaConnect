import io, re
s = io.open('src/i18n/translations.ts', encoding='utf-8').read()
i = s.find('  ko: {')
seg = s[i:i+120000]
j = seg.find('cities')
print('cities at', j)
print(seg[j-200:j+1200])

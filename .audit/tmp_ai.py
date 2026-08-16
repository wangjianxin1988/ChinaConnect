import io, re
s = io.open('src/i18n/translations.ts', encoding='utf-8').read()
i = s.find('  en: {')
seg = s[i:i+40000]
j = seg.find('aiPage')
print('aiPage at', j)
print(seg[j-1500:j+300])

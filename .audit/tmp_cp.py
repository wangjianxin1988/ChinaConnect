import io, re
s = io.open('src/i18n/translations.ts', encoding='utf-8').read()
# find cityPage section in ko
i = s.find('  ko: {')
seg = s[i:i+118000]
j = seg.find('cityPage')
print('cityPage found at', j)
print(seg[j:j+1500])

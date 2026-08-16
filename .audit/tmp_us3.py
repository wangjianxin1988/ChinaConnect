import io, re
s = io.open('src/i18n/translations.ts', encoding='utf-8').read()
i = s.find('hard.at.least.')
print(repr(s[i-200:i+100]))

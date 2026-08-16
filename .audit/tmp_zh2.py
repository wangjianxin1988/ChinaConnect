import io
s = io.open('src/i18n/translations.ts', encoding='utf-8').read()
i = s.find('"zh-CN": {')
print('idx', i)
print(s[i-800:i+300])

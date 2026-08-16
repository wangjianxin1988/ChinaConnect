import io
s = io.open('src/i18n/components-strings.ts', encoding='utf-8').read()
print(s[:2500])

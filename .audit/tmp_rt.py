import io
s = io.open('src/lib/i18n-runtime.ts', encoding='utf-8').read()
print('LEN', len(s))
print(s[:4000])

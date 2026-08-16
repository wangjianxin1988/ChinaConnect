import io
s = io.open('scripts/lib/translation-accept.mjs', encoding='utf-8').read()
print('LEN', len(s))
print(s[:5000])

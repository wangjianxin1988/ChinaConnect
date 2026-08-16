import io
s = io.open('scripts/fix-city-data-cjk-v2.mjs', encoding='utf-8').read()
print('LEN', len(s))
# print last 5000 chars
print(s[-5000:])

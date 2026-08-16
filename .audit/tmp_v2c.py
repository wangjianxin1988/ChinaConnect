import io
s = io.open('scripts/fix-city-data-cjk-v2.mjs', encoding='utf-8').read()
i = s.find('function main')
print('idx', i)
print(s[i:i+4000])

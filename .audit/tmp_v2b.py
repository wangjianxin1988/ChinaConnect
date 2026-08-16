import io
s = io.open('scripts/fix-city-data-cjk-v2.mjs', encoding='utf-8').read()
i = s.find('async function main')
print(s[i:i+3500])

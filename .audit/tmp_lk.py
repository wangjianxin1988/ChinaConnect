import io, re
s = io.open('src/pages/[lang]/city/[slug].astro', encoding='utf-8').read()
m = re.search(r'(?:const|function)\s+_lookup[\s\S]{0,700}', s)
print(m.group(0) if m else 'not found')
# count hardcoded ternaries / isJapanese usage
print('isJapanese occurrences:', s.count('isJapanese'))
# count _lookup usages
print('_lookup usages:', len(re.findall(r'_lookup\(', s)))

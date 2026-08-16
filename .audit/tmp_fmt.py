import io, re
s = io.open('src/i18n/translations.ts', encoding='utf-8').read()
print('backticks:', s.count('`'))
print('template strings sample:', re.findall(r'`[^`]*`', s)[:5])
# how many double-quoted values
print('double-quoted values:', len(re.findall(r':\s*"((?:[^"\\]|\\.)*)"', s)))
# check for single-quoted values
print('single-quoted:', len(re.findall(r":\s*'[^']*'", s)))
# check the file head/tail
print(s[:300])
print('...')
print(s[-200:])

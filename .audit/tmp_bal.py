import io, re
s = io.open('src/i18n/translations.ts', encoding='utf-8').read()
i = s.find('  ko: {')
j = s.find('  th: {')
seg = s[i:j]
depth = 0
min_depth = 0
line = 1
for idx, c in enumerate(seg):
    if c == '{': depth += 1
    elif c == '}': depth -= 1
    if depth < min_depth:
        print('UNBALANCED at offset', idx, 'depth', depth, 'line', seg[:idx].count(chr(10)))
        break
    if c == chr(10): line += 1
print('final depth:', depth)
# count braces
print('open braces:', seg.count('{'), 'close braces:', seg.count('}'))
# check for suspicious unescaped quotes: count quotes in each line for lines with values
bad_lines = []
for ln, l in enumerate(seg.split(chr(10))):
    if l.count('"') % 2 != 0:
        bad_lines.append((ln, l[:100]))
print('odd-quote lines:', len(bad_lines))
for ln, l in bad_lines[:10]:
    print('  line', ln, ':', l)

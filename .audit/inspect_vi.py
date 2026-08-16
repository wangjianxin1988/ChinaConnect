import io, re
data = io.open('src/data/guide/overrides-vi.ts', encoding='utf-8').read()
pat = re.compile(r'^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$', re.M)
n = 0
for m in pat.finditer(data):
    k, v = m.group(1), m.group(2)
    if re.search(r'[à-ÿÀ-Ý]', k) and not re.search(r'[\u3400-\u9fff]', k):
        print(repr(k[:90]), '=>', repr(v[:90]))
        n += 1
print('count', n)

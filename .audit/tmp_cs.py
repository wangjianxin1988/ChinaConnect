import io, re
s = io.open('src/i18n/components-strings.ts', encoding='utf-8').read()
print('LEN', len(s))
m = re.findall(r'^  ([a-zA-Z-]+):\s*\{', s, re.M)
print('langs:', m)
# find food highlight related keys
for key in ['hl_', 'discover', 'attractions', 'getting']:
    idxs = [mm.start() for mm in re.finditer(key, s)]
    print(key, len(idxs))

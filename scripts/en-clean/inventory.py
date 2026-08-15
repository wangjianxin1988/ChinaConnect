# -*- coding: utf-8 -*-
"""Inventory CJK strings in EN source cities/*.json for cleanup planning."""
import io, re, sys, json, glob
from collections import Counter, defaultdict

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
CJK = re.compile(r'[\u3400-\u9fff]')
files = sorted(glob.glob(r'src/data/cities/*.json'))

def walk(o, path, out):
    if isinstance(o, dict):
        for k, v in o.items():
            p = path + '.' + k if path else k
            walk(v, p, out)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            walk(v, path + '[' + str(i) + ']', out)
    else:
        if isinstance(o, str) and CJK.search(o):
            out.append((path, o))

def norm_field(path):
    parts = [x for x in re.split(r'[.[\]]+', path) if x]
    if not parts: return 'root'
    if parts[-1] == 'name': return 'name'
    if parts[-1] == 'nameEn': return 'nameEn'
    return parts[0] + '.' + parts[-1]

entries = []          # (slug, field_norm, full_path, value)
uniq = defaultdict(Counter)   # field_norm -> value counts (only NON-name values)
name_values = Counter()       # name field values
nameen_values = Counter()     # nameEn values with CJK
for f in files:
    slug = f.split('\\')[-1][:-5]
    d = json.load(open(f, encoding='utf-8'))
    out = []
    walk(d, '', out)
    for path, value in out:
        fn = norm_field(path)
        entries.append((slug, fn, path, value))
        if fn == 'name':
            name_values[value] += 1
        elif fn == 'nameEn':
            nameen_values[value] += 1
        else:
            uniq[fn][value] += 1

print('total CJK fields:', len(entries))
print('non-name fields:', sum(sum(c.values()) for c in uniq.values()))
print('name fields:', sum(name_values.values()))
print('nameEn-with-CJK fields:', sum(nameen_values.values()))
print()
print('=== non-name field categories ===')
for fn, c in sorted(uniq.items(), key=lambda x: -sum(x[1].values()))[:30]:
    print(f'{sum(c.values()):6d} fields / {len(c):5d} unique  {fn}')
print()
print('=== top 60 high-frequency non-name values ===')
allv = Counter()
for c in uniq.values():
    allv.update(c)
for v, n in allv.most_common(60):
    print(f'{n:5d}  {v[:90]}')
print()
print('=== top nameEn-with-CJK values (need English) ===')
for v, n in nameen_values.most_common(40):
    print(f'{n:5d}  {v[:90]}')
print()
print('=== top name values (kept for CJK) ===')
for v, n in name_values.most_common(30):
    print(f'{n:5d}  {v[:90]}')

# save detailed inventory for tooling
with open('.audit/en-inventory.json', 'w', encoding='utf-8') as fp:
    json.dump({
        'total': len(entries),
        'name': list(name_values.items()),
        'nameEn': list(nameen_values.items()),
        'nonName': {fn: list(c.items()) for fn, c in uniq.items()},
    }, fp, ensure_ascii=False, indent=1)
print()
print('saved .audit/en-inventory.json')

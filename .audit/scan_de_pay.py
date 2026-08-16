# -*- coding: utf-8 -*-
import io, json, os, re, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
# scan de for payment Universal in + Taxi to + other english-y 3-4 word phrases
base = 'src/data/cities-i18n/de'
pat = {}
for fn in sorted(os.listdir(base)):
    if not fn.endswith('.json'): continue
    slug = fn[:-5]
    data = json.load(io.open(os.path.join(base, fn), encoding='utf-8'))
    pmt = data.get('payment', [])
    for i, p in enumerate(pmt):
        d = p.get('description', '')
        if 'Universal' in d:
            pat.setdefault('Universal', []).append((slug, i, d))
        elif re.search(r'\b(Taxi|rental|bike)\b', d):
            pat.setdefault('other-en', []).append((slug, i, d))
for k, v in pat.items():
    print('=== %s (%d) ===' % (k, len(v)))
    for slug, i, d in v[:40]:
        print('  %s[%d] = %s' % (slug, i, d))

# -*- coding: utf-8 -*-
import io, json, os, re, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
def walk(o, pathStr=""):
    out = {}
    if isinstance(o, list):
        for i, v in enumerate(o):
            out.update(walk(v, "%s[%d]" % (pathStr, i)))
    elif isinstance(o, dict):
        for k, v in o.items():
            out.update(walk(v, "%s.%s" % (pathStr, k) if pathStr else k))
    elif isinstance(o, str):
        out[pathStr] = o
    return out
base = 'src/data/cities-i18n/de'
CJK = re.compile(r'[\u3400-\u9fff]')
n = 0; ex = []
for fn in sorted(os.listdir(base)):
    if not fn.endswith('.json'): continue
    target = json.load(io.open(os.path.join(base, fn), encoding='utf-8'))
    for p, v in walk(target).items():
        if isinstance(v, str) and CJK.search(v):
            n += 1
            if len(ex) < 10: ex.append((fn, p, v[:80]))
print('de CJK fields:', n)
for e in ex: print('  ', e)

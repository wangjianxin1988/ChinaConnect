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
def norm(v):
    return re.sub(r'[^a-z0-9\u3040-\u30ff\uac00-\ud7af\u0e00-\u0e7f\u0400-\u04ff\u0600-\u06ff\u3400-\u9fff]', '', str(v).lower())
base = 'src/data/cities-i18n/de'
rows = []
for fn in os.listdir(base):
    if not fn.endswith('.json'): continue
    slug = fn[:-5]
    target = json.load(io.open(os.path.join(base, fn), encoding='utf-8'))
    en = json.load(io.open('src/data/cities/%s.json' % slug, encoding='utf-8'))
    ja = json.load(io.open('src/data/cities-i18n/ja/%s' % fn, encoding='utf-8'))
    ef = walk(en); jf = walk(ja)
    for p, v in walk(target).items():
        if p in ('name','nameEn') or p.endswith('.name') or p.endswith('.nameEn') or p.endswith('.category') or p.endswith('.importance'): continue
        if 'emergencyContacts' in p: continue
        if not isinstance(v, str) or not re.search('[A-Za-z]', v): continue
        ev = ef.get(p); jv = jf.get(p)
        if not isinstance(ev, str) or not isinstance(jv, str): continue
        if norm(v) != norm(ev): continue
        if norm(jv) == norm(ev): continue
        if not re.search('[\u3040-\u30ff\u3400-\u9fff]', jv): continue
        words = re.findall(r"[A-Za-z']+", v)
        rows.append((len(words), p, v))
rows.sort(key=lambda r: -r[0])
print('TOTAL residual:', len(rows))
print('>=5 words:', len([r for r in rows if r[0] >= 5]))
print('3-4 words:', len([r for r in rows if 3 <= r[0] < 5]))
print()
for n, p, v in rows[:50]:
    print('%2d %s = %s' % (n, p, v[:120]))

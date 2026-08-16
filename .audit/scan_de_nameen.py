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
eng_nameen = []
cjk_nameen = []
total = 0
for fn in sorted(os.listdir(base)):
    if not fn.endswith('.json'): continue
    slug = fn[:-5]
    target = json.load(io.open(os.path.join(base, fn), encoding='utf-8'))
    en = json.load(io.open('src/data/cities/%s.json' % slug, encoding='utf-8'))
    ja = json.load(io.open('src/data/cities-i18n/ja/%s' % fn, encoding='utf-8'))
    ef = walk(en); jf = walk(ja)
    for p, v in walk(target).items():
        if p.endswith('.nameEn') or p == 'nameEn':
            total += 1
            ev = ef.get(p); jv = jf.get(p)
            if isinstance(ev, str) and norm(v) == norm(ev):
                eng_nameen.append((fn, p, v))
            elif isinstance(jv, str) and re.search('[\u3400-\u9fff]', v):
                cjk_nameen.append((fn, p, v))
print('total nameEn fields:', total)
print('still verbatim EN:', len(eng_nameen))
for e in eng_nameen[:20]: print('  ', e)
print('CJK nameEn:', len(cjk_nameen))
for e in cjk_nameen[:10]: print('  ', e)

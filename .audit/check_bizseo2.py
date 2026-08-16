# -*- coding: utf-8 -*-
import io, pickle, re, os, json
pkl = pickle.load(open('.audit/translations_parsed.pkl','rb'))
en_keys = set(k.split('.',1)[1] for k in pkl['data']['en'])
pat = re.compile(r'\.businessGuidePage\?\.(\w+)\s*\|\|\s*["\x27]([^"\x27]+)["\x27]', re.S)
missing = {}
for root in ['src/pages/[lang]/guide/business', 'src/pages/guide/business']:
    for dp, dn, fn in os.walk(root):
        for f in fn:
            if not f.endswith('.astro'): continue
            s = io.open(os.path.join(dp, f), encoding='utf-8').read()
            for m in pat.finditer(s):
                full = 'businessGuidePage.' + m.group(1)
                if full not in en_keys:
                    missing.setdefault(full, m.group(2))
for k, fb in sorted(missing.items()):
    print(k, '=>', fb[:70])
print('TOTAL missing business:', len(missing))

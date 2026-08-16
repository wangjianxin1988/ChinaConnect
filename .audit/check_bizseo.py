# -*- coding: utf-8 -*-
import io, pickle, re, os
pkl = pickle.load(open('.audit/translations_parsed.pkl','rb'))
for lang in ['en','ja']:
    keys = [k.split('.',1)[1] for k in pkl['data'][lang] if 'businessGuidePage' in k]
    print(lang, len(keys), sorted(keys)[:12])
pat = re.compile(r'\.businessGuidePage\?\.(\w+)\s*\|\|\s*["\x27]([^"\x27]+)["\x27]', re.S)
for root in ['src/pages/[lang]/guide/business', 'src/pages/guide/business']:
    for dp, dn, fn in os.walk(root):
        for f in fn:
            if not f.endswith('.astro'): continue
            s = io.open(os.path.join(dp, f), encoding='utf-8').read()
            for m in pat.finditer(s):
                print(os.path.join(dp, f).replace('\\', '/'), m.group(1), '=>', m.group(2)[:60])

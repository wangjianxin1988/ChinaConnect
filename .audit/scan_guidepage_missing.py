# -*- coding: utf-8 -*-
import io, re, os, pickle
pkl = pickle.load(open('.audit/translations_parsed.pkl','rb'))
en_keys = set(k.split('.',1)[1] for k in pkl['data']['en'])
# find JS access patterns to guidePage.* and businessGuidePage.* etc in src/pages
root = 'src/pages'
pat = re.compile(r'guidePage[\.\w]*')
missing = {}
for dp, dn, fn in os.walk(root):
    for f in fn:
        if not f.endswith('.astro'): continue
        p = os.path.join(dp, f)
        s = io.open(p, encoding='utf-8', errors='replace').read()
        # find translations[lang]?.guidePage?.key or .guidePage.key patterns
        for m in re.finditer(r'[\w.]*guidePage\?\.([\w]+)|[\w.]*guidePage\.([\w]+)', s):
            k = m.group(1) or m.group(2)
            if not k: continue
            full = 'guidePage.' + k
            if full not in en_keys:
                missing.setdefault(full, set()).add(p)
for k, ps in sorted(missing.items()):
    print(k, '| used in', len(ps), 'pages:', sorted(ps)[:3])
print('TOTAL missing guidePage keys used:', len(missing))

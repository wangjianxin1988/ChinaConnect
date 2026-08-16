# -*- coding: utf-8 -*-
import io, re, os, json, pickle
pkl = pickle.load(open('.audit/translations_parsed.pkl','rb'))
en_keys = set(k.split('.',1)[1] for k in pkl['data']['en'])
# patterns: translations[lang]?.SECT?.KEY || "fallback"  and (translations[lang]||translations.en).SECT?.KEY || "fallback"
pat = re.compile(r'\(?translations\[lang\]\s*\|\|\s*translations\.en\)?\.([A-Za-z]+)\?\.(\w+)\s*\|\|\s*["\x27]([^"\x27]+)["\x27]')
pat2 = re.compile(r'translations\[lang\]\?\.([A-Za-z]+)\?\.(\w+)\s*\|\|\s*["\x27]([^"\x27]+)["\x27]')
found = {}
for root in ['src/pages/[lang]/guide', 'src/pages/guide']:
    for dp, dn, fn in os.walk(root):
        for f in fn:
            if not f.endswith('.astro'): continue
            p = os.path.join(dp, f)
            s = io.open(p, encoding='utf-8', errors='replace').read()
            for pat_ in (pat, pat2):
                for m in pat_.finditer(s):
                    sect, key, fallback = m.group(1), m.group(2), m.group(3)
                    full = sect + '.' + key
                    if full not in en_keys:
                        found.setdefault(full, []).append((os.path.relpath(p), fallback))
for k, items in sorted(found.items()):
    print(k, '=>', items[0][1][:80], '| pages:', len(items))
print('TOTAL missing:', len(found))
json.dump({k: v[0][1] for k, v in found.items()}, io.open('.audit/seo_missing.json','w',encoding='utf-8'), ensure_ascii=False, indent=1)

# -*- coding: utf-8 -*-
import io, re, os, json
# extract pageTitle/pageDescription fallback strings from [lang]/guide/*.astro
root = 'src/pages/[lang]/guide'
out = {}
for dp, dn, fn in os.walk(root):
    for f in fn:
        if not f.endswith('.astro'): continue
        p = os.path.join(dp, f)
        s = io.open(p, encoding='utf-8', errors='replace').read()
        page = os.path.relpath(p, root).replace('\\','/').replace('.astro','').replace('/index','index')
        key = 'index' if page == 'index' else page
        title = None; desc = None
        tm = re.search(r'const pageTitle\s*=\s*(?:\(translations\[lang\] \|\| translations\.en\)\.guidePage\?\.(\w+)\s*\|\|\s*)?[\"\x27]([^\"\x27]+)[\"\x27]', s)
        dm = re.search(r'const pageDescription\s*=\s*(?:\(translations\[lang\] \|\| translations\.en\)\.guidePage\?\.(\w+)\s*\|\|\s*)?[\"\x27]([^\"\x27]+)[\"\x27]', s)
        if tm: title = tm.group(2)
        if dm: desc = dm.group(2)
        out[key] = {'title': title, 'desc': desc}
json.dump(out, io.open('.audit/guide_seo_fallbacks.json','w',encoding='utf-8'), ensure_ascii=False, indent=1)
for k, v in sorted(out.items()):
    print(k, '| T:', (v['title'] or '')[:60], '| D:', (v['desc'] or '')[:60])

# -*- coding: utf-8 -*-
import io, os
slugs = sorted(f[:-5] for f in os.listdir('src/data/cities') if f.endswith('.json'))
SECTIONS = ['transport','payment','sim','apps','culture','emergency']
missing = []
for slug in slugs:
    for s in SECTIONS:
        p = os.path.join('dist/en/city', slug, s, 'index.html')
        if not os.path.exists(p): missing.append('city/%s/%s/' % (slug, s))
print('en /en/city/* sections missing:', len(missing))
for m in missing[:10]: print('   ', m)
# also confirm EN root pages exist
for u in ['index.html','cities/index.html','attractions/index.html','emergency/index.html','ai/index.html','scenic-spots/index.html','food/index.html','guide/index.html','guide/transport/index.html']:
    print('root', u, os.path.exists(os.path.join('dist', u)))

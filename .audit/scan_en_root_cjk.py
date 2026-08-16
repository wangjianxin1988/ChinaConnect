# -*- coding: utf-8 -*-
import io, re, os
CJK = re.compile(r'[\u3400-\u9fff\u3000-\u303f\uff00-\uffef]')
TAG = re.compile(r'<[^>]+>')
def visible_text(html):
    html = re.sub(r'<script.*?</script>', ' ', html, flags=re.S)
    html = re.sub(r'<style.*?</style>', ' ', html, flags=re.S)
    html = re.sub(r'<!--.*?-->', ' ', html, flags=re.S)
    html = TAG.sub(' ', html)
    html = re.sub(r'&[a-zA-Z#0-9]+;', ' ', html)
    return re.sub(r'\s+', ' ', html)
total = 0; pages = []
EXCLUDE = {'dist/en', 'dist/ja', 'dist/ko', 'dist/zh-CN', 'dist/zh-TW', 'dist/th', 'dist/vi', 'dist/ru', 'dist/fr', 'dist/de', 'dist/ar', 'dist/fa', 'dist/_astro', 'dist/icons', 'dist/img', 'dist/screenshots'}
for dp, dn, fn in os.walk('dist'):
    rel = dp.replace('\\', '/')
    if any(rel == e or rel.startswith(e + '/') for e in EXCLUDE): continue
    for f in fn:
        if not f.endswith('.html'): continue
        p = os.path.join(dp, f)
        text = visible_text(io.open(p, encoding='utf-8', errors='replace').read())
        n = len(CJK.findall(text))
        if n:
            total += n; pages.append((p, n))
print('root EN pages with CJK:', len(pages), 'hits:', total)
for p, n in sorted(pages, key=lambda x: -x[1])[:20]:
    print('  %d  %s' % (n, p))

# -*- coding: utf-8 -*-
import io, re, os, sys
CJK = re.compile(r'[\u3400-\u9fff]')
TAG = re.compile(r'<[^>]+>')
def visible_text(html):
    html = re.sub(r'<script.*?</script>', ' ', html, flags=re.S)
    html = re.sub(r'<style.*?</style>', ' ', html, flags=re.S)
    html = re.sub(r'<!--.*?-->', ' ', html, flags=re.S)
    html = TAG.sub(' ', html)
    html = re.sub(r'&[a-zA-Z#0-9]+;', ' ', html)
    return re.sub(r'\s+', ' ', html)
root = 'dist/en'
total = 0; pages = []
for dp, dn, fn in os.walk(root):
    for f in fn:
        if not f.endswith('.html'): continue
        p = os.path.join(dp, f)
        html = io.open(p, encoding='utf-8', errors='replace').read()
        text = visible_text(html)
        hits = list(CJK.finditer(text))
        if hits:
            total += len(hits)
            pages.append((p, len(hits)))
            if len(pages) <= 15:
                print('====', p, len(hits))
                for m in hits[:6]:
                    print('   ...', text[max(0,m.start()-50):m.end()+50].strip(), '...')
print('pages with CJK:', len(pages), 'total hits:', total)
for p, n in sorted(pages, key=lambda x: -x[1])[:20]:
    print('  %d  %s' % (n, p))

# -*- coding: utf-8 -*-
import io, re, os
CJK = re.compile(r'[\u3400-\u9fff]')
TAG = re.compile(r'<[^>]+>')
def visible_text(html):
    html = re.sub(r'<script.*?</script>', ' ', html, flags=re.S)
    html = re.sub(r'<style.*?</style>', ' ', html, flags=re.S)
    html = re.sub(r'<!--.*?-->', ' ', html, flags=re.S)
    html = TAG.sub(' ', html)
    html = re.sub(r'&[a-zA-Z#0-9]+;', ' ', html)
    return re.sub(r'\s+', ' ', html)
# scan vi guide pages for CJK and long English sentences
for dp, dn, fn in os.walk('dist/vi/guide'):
    for f in fn:
        if not f.endswith('.html'): continue
        p = os.path.join(dp, f)
        text = visible_text(io.open(p, encoding='utf-8', errors='replace').read())
        cjk = len(CJK.findall(text))
        # find long runs of ascii words (english prose)
        eng = []
        for m in re.finditer(r'\b(?:[A-Za-z]{2,}\s+){5,}[A-Za-z]{2,}\b', text):
            seg = m.group(0)
            if len(seg) > 40: eng.append(seg[:100])
        if cjk or eng:
            print('====', p, 'cjk=', cjk, 'eng_runs=', len(eng))
            for e in eng[:4]: print('   EN:', e)
            if cjk:
                for m in list(CJK.finditer(text))[:3]:
                    print('   CJK ctx:', text[max(0,m.start()-40):m.end()+40])

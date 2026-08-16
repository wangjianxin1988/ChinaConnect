# -*- coding: utf-8 -*-
import io, re
import urllib.request
base = 'http://127.0.0.1:4322'
CJK = re.compile(r'[\u3400-\u9fff]+')
KANA = re.compile(r'[\u3040-\u30ff]')
def visible(html):
    s = re.sub(r'<script[^>]*>[\s\S]*?</script>', ' ', html)
    s = re.sub(r'<style[^>]*>[\s\S]*?</style>', ' ', s)
    s = re.sub(r'<!--[\s\S]*?-->', ' ', s)
    s = re.sub(r'<astro-island\b[\s\S]*?</astro-island>', ' ', s)
    s = re.sub(r'\s(?:props|ssr|data-astro-cid)="[^"]*"', ' ', s)
    s = re.sub(r'<[^>]+>', ' ', s)
    return s
paths = ['/ko/city/beijing/', '/ko/city/chongqing/']
for p in paths:
    raw = urllib.request.urlopen(base + p, timeout=20).read().decode('utf-8')
    v = visible(raw)
    frags = sorted(set(CJK.findall(v)))
    pure_cn = [f for f in frags if not KANA.search(f)]
    # english sentences: 4+ word latin runs
    en = re.findall(r"\b(?:[A-Za-z]{2,}\s+){3,}[A-Za-z]{2,}\b", v)
    en = sorted(set(e.strip() for e in en))[:10]
    print('%-30s pure-CN=%d %s' % (p, len(pure_cn), ' | '.join(pure_cn[:6])))
    print('   EN-sentences:', en)

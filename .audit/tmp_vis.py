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
paths = ['/fr/city/beijing/', '/fr/city/chengdu/', '/fr/city/changsha/', '/fr/city/chongqing/', '/fr/city/guangzhou/', '/fr/city/beijing/food/', '/fr/city/beijing/attractions/', '/fr/cities/', '/fr/']
for p in paths:
    try:
        raw = urllib.request.urlopen(base + p, timeout=20).read().decode('utf-8')
    except Exception as e:
        print(p, 'ERR', e); continue
    v = visible(raw)
    frags = sorted(set(CJK.findall(v)))
    # exclude pure kana? no - count CJK (incl kanji) but flag which contain no kana (pure Chinese)
    pure_cn = [f for f in frags if not KANA.search(f)]
    print('%-32s frags=%d  pure-CN=%d  %s' % (p, len(frags), len(pure_cn), ' | '.join(pure_cn[:8])))

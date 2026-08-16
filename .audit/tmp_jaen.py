# -*- coding: utf-8 -*-
import io, re
import urllib.request
base = 'http://127.0.0.1:4322'
def visible(html):
    s = re.sub(r'<script[^>]*>[\s\S]*?</script>', ' ', html)
    s = re.sub(r'<style[^>]*>[\s\S]*?</style>', ' ', s)
    s = re.sub(r'<!--[\s\S]*?-->', ' ', s)
    s = re.sub(r'<astro-island\b[\s\S]*?</astro-island>', ' ', s)
    s = re.sub(r'\s(?:props|ssr|data-astro-cid)="[^"]*"', ' ', s)
    s = re.sub(r'<[^>]+>', ' ', s)
    return s
targets = ['Discover local food highlights', 'Discover the best attractions', 'Download eSIM apps before arriving', 'Getting to and around', 'Always carry water in summer', 'Best in spring and autumn', 'Fog is common year', 'Airalo and Holafly offer China', 'Explore China with AI']
for lang in ['ja', 'ko']:
    raw = urllib.request.urlopen(base + '/%s/city/beijing/' % lang, timeout=20).read().decode('utf-8')
    v = visible(raw)
    print('==', lang)
    for t in targets:
        idx = v.find(t)
        if idx >= 0:
            print('   EN:', t, '=>', re.sub(r'\s+', ' ', v[max(0,idx-20):idx+len(t)+60]).strip()[:110])

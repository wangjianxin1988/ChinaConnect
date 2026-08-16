import urllib.request, re
for path in ['/ja/guide/accommodation/','/ja/guide/payment/','/ja/guide/']:
    try:
        html = urllib.request.urlopen('http://localhost:4322'+path, timeout=40).read().decode('utf-8','replace')
    except Exception as e:
        print(path, 'ERR', e); continue
    html2 = re.sub(r'<script[^>]*>.*?</script>',' ',html,flags=re.S)
    html2 = re.sub(r'<style[^>]*>.*?</style>',' ',html2,flags=re.S)
    html2 = re.sub(r'<!--.*?-->',' ',html2,flags=re.S)
    frags = [m.group(0) for m in re.finditer(r'[\u3400-\u9fff]{2,}', html2)]
    # keep only unique multi-char CJK runs longer than 1 that look like real text
    from collections import Counter
    c = Counter(frags)
    print(path, 'CJK runs:', len(c), 'unique:', len(c))
    for f, n in c.most_common(15):
        if len(f) >= 2:
            print('   ', n, repr(f[:60]))

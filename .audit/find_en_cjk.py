import urllib.request, io, re
def fetch(p):
    req = urllib.request.Request('http://127.0.0.1:4322'+p, headers={'User-Agent':'Mozilla/5.0'})
    html = urllib.request.urlopen(req, timeout=120).read().decode('utf-8', errors='replace')
    return html
for p in ['/emergency/', '/attractions/']:
    html = fetch(p)
    html2 = re.sub(r'<script[\s\S]*?</script>', ' ', html)
    html2 = re.sub(r'<style[\s\S]*?</style>', ' ', html2)
    print('===', p, '===')
    for m in re.finditer(r'[^\s<>\u3400-\u9fff]*[\u3400-\u9fff][^\s<>\u3400-\u9fff]*', html2):
        seg = m.group(0)
        # find surrounding context
        i = m.start()
        ctx = re.sub(r'<[^>]+>', ' ', html2[max(0,i-160):i+160])
        ctx = re.sub(r'\s+', ' ', ctx)
        print('  CJK:', repr(seg[:60]))
        print('    ctx:', ctx[:200])

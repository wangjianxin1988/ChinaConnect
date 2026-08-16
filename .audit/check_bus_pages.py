import urllib.request, io, re
def fetch(p):
    req = urllib.request.Request('http://127.0.0.1:4322'+p, headers={'User-Agent':'Mozilla/5.0'})
    html = urllib.request.urlopen(req, timeout=120).read().decode('utf-8', errors='replace')
    html2 = re.sub(r'<script[\s\S]*?</script>', ' ', html)
    html2 = re.sub(r'<style[\s\S]*?</style>', ' ', html2)
    txt = re.sub(r'<[^>]+>', ' ', html2)
    return re.sub(r'\s+', ' ', txt)
for lang in ['ja','ko','zh-CN','th','vi','ru','de']:
    txt = fetch('/%s/guide/business/' % lang)
    i = txt.find('Invitation')
    seg = txt[max(0,i-120):i+260] if i>=0 else 'NOT FOUND'
    print('===', lang, '===')
    print(seg[:400])

import urllib.request, io, re
def fetch(p):
    req = urllib.request.Request('http://127.0.0.1:4322'+p, headers={'User-Agent':'Mozilla/5.0'})
    html = urllib.request.urlopen(req, timeout=120).read().decode('utf-8', errors='replace')
    html2 = re.sub(r'<script[\s\S]*?</script>', ' ', html)
    html2 = re.sub(r'<style[\s\S]*?</style>', ' ', html2)
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', html2))
tests = [
  ('/ko/cities/', ['Showing', 'Search', 'cities', 'of']),
  ('/ru/city/beijing/', ['Population', 'Where to Stay', 'Getting Around']),
  ('/vi/city/beijing/', ['SIM & eSIM']),
  ('/ko/guide/', ['Stages 1-3', 'Learn more']),
  ('/th/scenic-spots/', ['Scenic Spots', 'Featured Scenic Cities']),
  ('/zh-CN/', ['Popular Cities', 'All rights reserved.']),
]
for p, kws in tests:
    txt = fetch(p)
    print('===', p, '===')
    for kw in kws:
        print('  ', kw, '=>', kw in txt)

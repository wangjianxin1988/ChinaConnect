import sys, re
sys.stdout.reconfigure(encoding="utf-8")
# where does 推奨 come from on the ko page?
import urllib.request
req = urllib.request.Request('http://localhost:4322/ko/city/beijing/apps/', headers={'User-Agent':'Mozilla/5.0'})
html = urllib.request.urlopen(req, timeout=60).read().decode('utf-8','replace')
for m in re.finditer(r'.{60}推奨.{30}', html):
    print(repr(m.group(0)))

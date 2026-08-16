# -*- coding: utf-8 -*-
import io, re
import urllib.request
raw = urllib.request.urlopen('http://127.0.0.1:4322/ko/city/beijing/', timeout=30).read().decode('utf-8')
idx = raw.find('Discover local food highlights')
print('idx:', idx)
while idx >= 0:
    print(repr(raw[max(0,idx-600):idx+200]))
    print('---')
    idx = raw.find('Discover local food highlights', idx+1)
    if idx > 400000: break

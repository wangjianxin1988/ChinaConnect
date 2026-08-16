# -*- coding: utf-8 -*-
import io, re, urllib.request
raw = urllib.request.urlopen('http://127.0.0.1:4322/ko/city/beijing/', timeout=30).read().decode('utf-8')
i = raw.find('cityPage.foodSubtitle')
print(raw[i-80:i+160] if i>=0 else 'foodSubtitle not found')
i2 = raw.find('Discover local food highlights')
print('EN still present:', i2 >= 0)
# also check the ko data-i18n values for a few fixed keys
for t in ['Loading more cities', 'Weather not available', 'View all attractions']:
    j = raw.find(t)
    print(t, '->', j >= 0)

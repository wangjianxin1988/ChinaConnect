# -*- coding: utf-8 -*-
import urllib.request, sys
sys.stdout.reconfigure(encoding='utf-8')
BASE = 'http://127.0.0.1:4322'
LANGS = ['en','ja','ko','zh-CN','zh-TW','th','vi','ru','fr','de','ar','fa']
GUIDES = ['', 'visa', 'payment', 'communication', 'transport', 'dining', 'attractions', 'accommodation',
          'cultural-warnings', 'scam-prevention', 'departure', 'emergency-procedures', 'transparency',
          'business', 'business/company-registration', 'business/etiquette', 'business/expo-calendar',
          'business/invitation-letter', 'business/translation']
MISC = ['', 'cities', 'food', 'attractions', 'scenic-spots', 'blog', 'ai', 'emergency']
def check(path):
    try:
        r = urllib.request.urlopen(BASE + path, timeout=20)
        return r.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception as e:
        return 'ERR'
bad = []
for lang in LANGS:
    if lang == 'en':
        for g in GUIDES:
            p = '/guide' + (('/' + g) if g else '')
            c = check(p)
            if c != 200: bad.append((lang, p, c))
        for m in MISC:
            p = '/' + m
            c = check(p)
            if c != 200: bad.append((lang, p, c))
    else:
        for g in GUIDES:
            p = '/' + lang + '/guide' + (('/' + g) if g else '')
            c = check(p)
            if c != 200: bad.append((lang, p, c))
        for m in MISC:
            p = '/' + lang + ('/' + m if m else '')
            c = check(p)
            if c != 200: bad.append((lang, p, c))
print('non-200 count:', len(bad))
for b in bad[:60]: print(' ', b)

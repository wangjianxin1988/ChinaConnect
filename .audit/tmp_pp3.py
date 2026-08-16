# -*- coding: utf-8 -*-
import io, json, re
d = json.loads(io.open('src/data/cities-i18n/ko/beijing.json', encoding='utf-8').read())
loc = d['transport']['local']
print('transport.local type:', type(loc).__name__, 'keys:', list(loc.keys())[:20] if isinstance(loc, dict) else len(loc))
if isinstance(loc, dict):
    for k, v in list(loc.items())[:6]:
        print(' ', k, type(v).__name__, '=', str(v)[:80])

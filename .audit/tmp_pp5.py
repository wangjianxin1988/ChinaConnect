# -*- coding: utf-8 -*-
import io, json
d = json.loads(io.open('src/data/cities-i18n/ko/chongqing.json', encoding='utf-8').read())
loc = d['transport']['local']
print('local type:', type(loc).__name__)
if isinstance(loc, dict):
    print('keys:', list(loc.keys()))
    for k in list(loc.keys()):
        if re := (re if False else None): pass
for k in list(loc.keys()):
    print(' ', k, '=', str(loc[k])[:80])

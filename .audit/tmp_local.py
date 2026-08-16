# -*- coding: utf-8 -*-
import io, json
d = json.loads(io.open('src/data/cities/chongqing.json', encoding='utf-8').read())
loc = d.get('transport', {}).get('local')
print('EN source transport.local type:', type(loc).__name__)
if isinstance(loc, dict):
    print('keys:', list(loc.keys()))
    for k in list(loc.keys()):
        print(' ', k, '=', str(loc[k])[:90])
elif isinstance(loc, list):
    print(loc[:3])

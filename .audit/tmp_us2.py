# -*- coding: utf-8 -*-
import io, pickle, re
pkl = pickle.load(open('.audit/translations_parsed.pkl', 'rb'))
data = pkl['data']
def strip(p): return p.split('.', 1)[1] if '.' in p else p
en = {strip(p): v for p, v in data['en'].items()}
us = {p: v for p, (v, a, b) in en.items() if re.fullmatch(r'_+', p)}
print('underscore-key paths in en:', len(us))
for p, v in list(us.items())[:30]:
    print('  ', p, '=', v[:60])
# in ko section which of these got translated
ko = {strip(p): v for p, v in data['ko'].items()}
changed = [p for p in us if p in ko and ko[p][0] != us[p][0]]
print('ko changed for underscore keys:', len(changed))

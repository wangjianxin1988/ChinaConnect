# -*- coding: utf-8 -*-
import io, pickle
pkl = pickle.load(open('.audit/translations_parsed.pkl', 'rb'))
data = pkl['data']
def strip(p): return p.split('.', 1)[1] if '.' in p else p
en = {strip(p): v for p, v in data['en'].items()}
ko = {strip(p): v for p, v in data['ko'].items()}
missing = [p for p in en if p not in ko]
print('missing from ko:', len(missing))
for p in missing[:40]:
    print('  ', p, '=', en[p][0][:60])

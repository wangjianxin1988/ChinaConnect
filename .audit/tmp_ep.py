# -*- coding: utf-8 -*-
import io, pickle
pkl = pickle.load(open('.audit/translations_parsed.pkl', 'rb'))
en = pkl['data']['en']
paths = list(en.keys())
print('en paths count:', len(paths))
for p in paths[:25]:
    print('  ', p, '=', en[p][0][:50])

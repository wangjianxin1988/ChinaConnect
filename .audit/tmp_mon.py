# -*- coding: utf-8 -*-
import io, pickle, re
pkl = pickle.load(open('.audit/translations_parsed.pkl', 'rb'))
en = pkl['data']['en']
monstrous = [p for p in en if p.count('.') > 8]
print('monstrous en paths:', len(monstrous))
# find the FIRST monstrous path and the shortest prefix of real keys
for p in monstrous[:3]:
    print('  ', p)
# find first key in en order that is monstrous
normal = [p for p in en if p.count('.') <= 8]
print('normal paths:', len(normal))

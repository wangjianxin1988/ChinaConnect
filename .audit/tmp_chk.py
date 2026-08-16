# -*- coding: utf-8 -*-
import io, pickle
pkl = pickle.load(open('.audit/translations_parsed.pkl', 'rb'))
d = pkl['data']
for p in ['cityPage.foodSubtitle', 'cityPage.attractionsLoadingMore', 'cityPage.attractionsShowing']:
    print(p)
    for lang in ['en', 'ko', 'ja', 'zh-CN']:
        v = d[lang].get(p)
        print('   ', lang, '=', repr(v[0]) if v else None)

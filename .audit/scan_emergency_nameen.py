# -*- coding: utf-8 -*-
import io, json, glob, os
LANGS = ['ja','ko','zh-CN','zh-TW','th','vi','ru','fr','de','ar','fa']
total_bad = 0
by_lang = {}
for lang in LANGS:
    n = 0
    examples = []
    for fp in sorted(glob.glob('src/data/cities-i18n/%s/*.json' % lang)):
        slug = os.path.basename(fp)[:-5]
        data = json.load(io.open(fp, encoding='utf-8'))
        en = json.load(io.open('src/data/cities/%s.json' % slug, encoding='utf-8'))
        ec = data.get('emergencyContacts', [])
        eec = en.get('emergencyContacts', [])
        for i in range(min(len(ec), len(eec))):
            if ec[i].get('nameEn') != eec[i].get('nameEn'):
                n += 1
                if len(examples) < 4:
                    examples.append('%s[%d] %s => %r (EN: %r)' % (slug, i, ec[i].get('type'), ec[i].get('nameEn','')[:40], eec[i].get('nameEn','')[:40]))
    by_lang[lang] = n
    total_bad += n
    print(lang, n)
    for e in examples: print('   ', e)
print('TOTAL nameEn mismatches:', total_bad)

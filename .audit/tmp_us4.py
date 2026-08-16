import io, os, glob, re
# extract the full paths of underscore-leaf keys
s = io.open('src/i18n/translations.ts', encoding='utf-8').read()
paths = set()
# find each "key: {" context by scanning backwards is hard; instead search components for the leaf value patterns
terms = ['hard.at.least', 'hard.complete.these', 'hard.for.emergencies', 'hard.i.want.to.explore', 'hard.minimum.purchase', 'hard.plan.a', 'hard.save.these.numbers', 'hard.standard.processing', 'hard.usage.resets', 'hard.yes.you.can.get.vat']
found = {}
for t in terms:
    hits = []
    for p in glob.glob('src/**/*.*', recursive=True):
        if not os.path.isfile(p): continue
        if any(x in p for x in ['.bak', 'node_modules', 'dist', '.astro']): continue
        try: c = io.open(p, encoding='utf-8', errors='replace').read()
        except Exception: continue
        if t in c and 'translations.ts' not in p:
            hits.append(p)
    found[t] = hits
for t, h in found.items():
    print('%-32s used-in: %s' % (t, h if h else 'NONE'))

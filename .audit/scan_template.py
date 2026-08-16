import io, re
files = {
 'guide/attractions': 'src/pages/guide/attractions.astro',
 'guide/communication': 'src/pages/guide/communication.astro',
 'guide/payment': 'src/pages/guide/payment.astro',
 'guide/transport': 'src/pages/guide/transport.astro',
 'guide/business/index': 'src/pages/guide/business/index.astro',
 'guide/index': 'src/pages/guide/index.astro',
 'scenic-spots/index': 'src/pages/scenic-spots/index.astro',
 'food/[id]': 'src/pages/[lang]/food/[id].astro',
 'food/index': 'src/pages/[lang]/food/index.astro',
 'cities/index': 'src/pages/[lang]/cities/index.astro',
}
pats = ['lang === "ja"', 'isJa', 'titleJa', '開く', '打开', 'Open', '景勝地', 'scenic spots', 'stageLabel', 'showTitleCn', 'filter全部']
for name, f in files.items():
    try:
        data = io.open(f, encoding='utf-8', errors='replace').read()
    except Exception as e:
        print(name, 'ERR', e); continue
    lines = data.splitlines()
    print('===', name, '===')
    for i, l in enumerate(lines, 1):
        if any(p in l for p in pats):
            print(' ', i, l.strip()[:150])

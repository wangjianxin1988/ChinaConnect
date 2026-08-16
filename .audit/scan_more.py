import io, os
def show(f, pats, limit=50, ctx=False):
    try:
        data = io.open(f, encoding='utf-8', errors='replace').read()
    except Exception as e:
        print(f, 'ERR', e); return
    lines = data.splitlines()
    hits = []
    for i, l in enumerate(lines, 1):
        if any(p in l for p in pats):
            hits.append((i, l.strip()))
    print('===', f, 'hits', len(hits), '===')
    for i, l in hits[:limit]:
        print(' ', i, l[:170])
show('src/pages/[lang]/food/[id].astro', ['showTitleCn','lang === "ja"','labelJa','labelEn'])
print()
show('src/pages/[lang]/food/index.astro', ['filter','labelKey','label:','showTitleCn','lang ==='])
print()
show('src/pages/[lang]/scenic-spots/index.astro', ['isJa','scenic_unit','nature_desc','lang ===','showTitleCn'])
print()
show('src/pages/[lang]/cities/index.astro', ['jaCities','translations[lang]','nameZh','data-i18n'])

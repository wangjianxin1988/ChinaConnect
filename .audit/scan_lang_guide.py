import io, re, glob
files = glob.glob('src/pages/[lang]/guide/**/*.astro', recursive=True)
pats = ['lang === "ja"', 'isJa', 'titleJa', '開く', '打开', 'Open', '景勝地', 'scenic spots', 'stageLabel', 'showTitleCn', 'lang === \'ja\'']
for f in sorted(files):
    try:
        data = io.open(f, encoding='utf-8', errors='replace').read()
    except Exception as e:
        print(f, 'ERR', e); continue
    lines = data.splitlines()
    hits = []
    for i, l in enumerate(lines, 1):
        if any(p in l for p in pats):
            hits.append((i, l.strip()))
    if hits:
        print('===', f, '===')
        for i, l in hits[:40]:
            print(' ', i, l[:150])

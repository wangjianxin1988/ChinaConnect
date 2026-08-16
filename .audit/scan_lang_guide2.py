import io, re, glob, os
root = 'src/pages/[lang]/guide'
files = []
for dirpath, dirs, names in os.walk(root):
    for n in names:
        if n.endswith('.astro'):
            files.append(os.path.join(dirpath, n))
pats = ['lang === "ja"', 'lang === \'ja\'', 'isJa', 'titleJa', '開く', '打开', '"Open"', '景勝地', 'scenic spots', 'stageLabel', 'showTitleCn']
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
        print('===', f.replace('\\','/'), '(', len(hits), ') ===')
        for i, l in hits[:60]:
            print(' ', i, l[:150])

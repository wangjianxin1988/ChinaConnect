import io, os, glob
hits = []
for p in glob.glob('src/**/*.*', recursive=True) + glob.glob('*.mjs') + glob.glob('*.ts'):
    if not os.path.isfile(p): continue
    if any(x in p for x in ['.bak', 'node_modules', 'dist', '.astro', 'playwright-report']): continue
    try:
        with io.open(p, encoding='utf-8', errors='replace') as f:
            s = f.read()
    except Exception: continue
    if 'data-i18n' in s or 'applyString' in s:
        hits.append((p, s.count('data-i18n'), s.count('applyString')))
for p, a, b in hits:
    print(p, 'data-i18n:', a, 'applyString:', b)

import io, os, glob, re
terms = ['Discover local food highlights', 'Discover the best attractions', 'Getting to and around', 'Download eSIM apps before arriving']
for t in terms:
    print('====', t)
    for p in glob.glob('src/**/*.*', recursive=True):
        if not os.path.isfile(p): continue
        if any(x in p for x in ['.bak', 'node_modules', 'dist', '.astro']): continue
        try: s = io.open(p, encoding='utf-8', errors='replace').read()
        except Exception: continue
        if t in s:
            for m in re.finditer(re.escape(t), s):
                print('   ', p, ':', re.sub(r'\s+', ' ', s[max(0,m.start()-60):m.end()+40]))

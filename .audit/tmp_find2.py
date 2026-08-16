import io, os, glob, re
terms = ['food highlights', 'best attractions', 'Getting to', 'Discover']
seen = set()
for t in terms:
    for p in glob.glob('src/**/*.*', recursive=True):
        if not os.path.isfile(p): continue
        if any(x in p for x in ['.bak', 'node_modules', 'dist', '.astro']): continue
        try: s = io.open(p, encoding='utf-8', errors='replace').read()
        except Exception: continue
        if t in s:
            for m in re.finditer(re.escape(t), s):
                key = (p, m.start())
                if key in seen: continue
                seen.add(key)
                print('%-46s %s' % (p, re.sub(r'\s+', ' ', s[max(0,m.start()-70):m.end()+30])[:130]))

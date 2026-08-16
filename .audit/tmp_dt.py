import io, os, glob, re
for p in glob.glob('src/**/*.*', recursive=True):
    if not os.path.isfile(p): continue
    if any(x in p for x in ['.bak', 'node_modules', 'dist', '.astro']): continue
    try: s = io.open(p, encoding='utf-8', errors='replace').read()
    except Exception: continue
    if 'data-translate' in s and ('querySelectorAll' in s or 'dataTranslate' in s or "['data-translate']" in s):
        print('====', p)
        i = s.find('data-translate')
        for m in re.finditer(r'data-translate', s):
            ctx = s[max(0,m.start()-100):m.start()+300].replace('\n', ' ')
            if 'querySelectorAll' in ctx or 'getAttribute' in ctx:
                print(ctx[:380])
                break

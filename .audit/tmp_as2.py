import io, os, glob, re
for p in glob.glob('src/**/*.*', recursive=True):
    if not os.path.isfile(p): continue
    if any(x in p for x in ['.bak', 'node_modules', 'dist', '.astro']): continue
    try: s = io.open(p, encoding='utf-8', errors='replace').read()
    except Exception: continue
    for m in re.finditer(r'applyString', s):
        pass
    if 'applyString' in s:
        i = s.find('applyString')
        print('====', p, 'occurrences:', s.count('applyString'))
        print(s[max(0,i-200):i+400].replace('\n', ' ')[:600])
        print()

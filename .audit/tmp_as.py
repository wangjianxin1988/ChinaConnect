import io, os, glob, re
# find applyString definition
for p in glob.glob('src/**/*.*', recursive=True):
    if not os.path.isfile(p): continue
    if any(x in p for x in ['.bak', 'node_modules', 'dist', '.astro']): continue
    try: s = io.open(p, encoding='utf-8', errors='replace').read()
    except Exception: continue
    if 'applyString' in s and ('function applyString' in s or 'const applyString' in s or 'export.*applyString' in s):
        i = s.find('applyString')
        # find the function def
        m = re.search(r'(?:export )?(?:async )?function applyString[\s\S]{0,1800}', s)
        if m:
            print('====', p)
            print(m.group(0)[:1800])
            break

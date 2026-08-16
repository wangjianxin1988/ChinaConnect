import io, re, glob
targets = ['MultiHop','Windscribe','Wardens','Contact Phone']
files = glob.glob('src/data/guide/*.ts') + glob.glob('src/components/Guide/*.tsx')
for t in targets:
    found = False
    for f in files:
        try:
            data = io.open(f, encoding='utf-8', errors='replace').read()
        except Exception:
            continue
        for m in re.finditer(re.escape(t), data):
            i = m.start()
            seg = data[max(0,i-260):i+200]
            print('###', t, 'in', f)
            print(seg.replace(chr(10),' '))
            print('---')
            found = True
            break
        if found: break
    if not found:
        print('###', t, 'NOT FOUND in data/guide or components/Guide')

import io, re, subprocess
r = subprocess.run(['git', 'diff', '--unified=0', 'src/i18n/translations.ts'], capture_output=True, text=True, encoding='utf-8', errors='replace')
lines = r.stdout.split('\n')
# show ko-related diff hunks (first 40)
hits = []
cur = None
for l in lines:
    if l.startswith('@@'):
        cur = l
    if l.startswith('+') and not l.startswith('+++'):
        if any(c in l for c in ['한', '요', '입', '를', '은']):
            print(l[:160])

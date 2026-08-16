import io
for p in ['scripts/fix-city-data-cjk.mjs', 'scripts/fix-city-data-cjk-v2.mjs']:
    s = io.open(p, encoding='utf-8').read()
    print('====', p, len(s))
    print(s[:2200])
    print()

import io, re, glob, os
for f in ['dist/ja/guide/communication/index.html','dist/en/guide/communication/index.html','dist/vi/guide/communication/index.html']:
    if not os.path.exists(f):
        print(f, '<MISSING>'); continue
    data = io.open(f, encoding='utf-8', errors='replace').read()
    print('===', f, 'len', len(data))
    # count CJK
    cjk = len(re.findall(r'[\u3400-\u9fff]', data))
    print('CJK chars:', cjk)
    # find SIM phrase context
    for kw in ['SIM', 'ウォー', 'Tôi cần', 'thẻ SIM']:
        i = data.find(kw)
        if i >= 0:
            seg = data[max(0,i-500):i+300]
            txt = re.sub(r'<[^>]+>', ' ', seg)
            txt = re.sub(r'\s+', ' ', txt)
            print('  ctx', kw, ':', txt[:260])

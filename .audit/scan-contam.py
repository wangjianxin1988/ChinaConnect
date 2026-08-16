import io,re,glob
pat={
 'hangul': re.compile(r'[\uac00-\ud7af]+'),
 'kana': re.compile(r'[\u3040-\u30ff]+'),
 'cyrillic': re.compile(r'[\u0400-\u04ff]+'),
 'arabic': re.compile(r'[\u0600-\u06ff]+'),
 'thai': re.compile(r'[\u0e00-\u0e7f]+'),
}
files = glob.glob('src/data/guide/**/*.ts', recursive=True) + ['src/data/cultural-warnings.ts','src/data/price-transparency.ts','src/data/scam-prevention.ts']
files = [f for f in files if not re.search(r'overrides-|ja-overrides', f)]
print('files checked:', len(files))
for f in files:
    s=io.open(f,encoding='utf-8').read()
    for name,p in pat.items():
        ms = p.findall(s)
        if ms:
            print(f, name, len(ms), repr(ms[0][:40]))
print('done')

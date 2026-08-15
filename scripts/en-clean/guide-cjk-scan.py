# -*- coding: utf-8 -*-
import io, re, sys, glob
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
CJK = re.compile(r'[\u3400-\u9fff]')
files = (glob.glob(r'src/components/Guide/*.tsx') +
         glob.glob(r'src/pages/guide/**/*.astro', recursive=True) +
         glob.glob(r'src/pages/guide/*.astro') +
         glob.glob(r'src/components/apps/*.tsx') +
         glob.glob(r'src/components/Emergency/*.tsx') +
         glob.glob(r'src/components/common/Onboarding.tsx'))
out = open('.audit/guide-cjk-lines.txt', 'w', encoding='utf-8')
for f in sorted(files):
    d = open(f, encoding='utf-8', errors='replace').read()
    for i, l in enumerate(d.splitlines()):
        if CJK.search(l):
            out.write(f'{f}:{i+1}: {l.strip()}\n')
out.close()
print('written .audit/guide-cjk-lines.txt')

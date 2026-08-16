# -*- coding: utf-8 -*-
import io, re, glob, os
for f in sorted(glob.glob('src/data/guide/overrides-*.ts')):
    s = io.open(f, encoding='utf-8').read()
    n = len(re.findall(r'\n\s*["\x27](?:[^"\x27\\]|\\.)*["\x27]\s*:', s))
    print(os.path.basename(f), n)

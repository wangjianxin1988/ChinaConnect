# -*- coding: utf-8 -*-
import subprocess, sys, os
os.environ['PYTHONIOENCODING'] = 'utf-8'
LANGS = ['ja','ko','th','vi','ru','fr','de','ar','fa','zh-CN','zh-TW']
for lang in LANGS:
    print('=== %s ===' % lang, flush=True)
    r = subprocess.run([sys.executable, '.audit/fix_tr_values.py', '--lang='+lang], capture_output=True, text=True, encoding='utf-8', errors='replace')
    print(r.stdout, end='')
    if r.returncode != 0:
        print('STDERR:', r.stderr, flush=True)
    r2 = subprocess.run([sys.executable, '.audit/parse_translations.py'], capture_output=True, text=True, encoding='utf-8', errors='replace')
    print(r2.stdout, end='')
print('ALL DONE', flush=True)

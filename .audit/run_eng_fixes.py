# -*- coding: utf-8 -*-
import subprocess, sys, os
os.environ['PYTHONIOENCODING'] = 'utf-8'
LANGS = ['ko','th','vi','ru','fr','de','zh-CN','zh-TW']
for lang in LANGS:
    print('=== %s ===' % lang, flush=True)
    r = subprocess.run(['node', 'scripts/fix-city-data-eng.mjs', '--lang=' + lang], capture_output=True, text=True, encoding='utf-8', errors='replace')
    print(r.stdout, end='')
    if r.returncode != 0:
        print('STDERR:', r.stderr, flush=True)
print('ALL DONE', flush=True)

import subprocess, json, io
LANGS = ['ja','ko','zh-CN','zh-TW','th','vi','ru','fr','de','ar','fa']
for kind in ['guide','apps']:
    print('===', kind, '===')
    for lang in LANGS:
        r = subprocess.run(['node','.audit/check-guide-quality.mjs', lang, kind], capture_output=True, text=True, encoding='utf-8', errors='replace')
        try:
            q = json.loads(r.stdout.strip())
            print(' ', lang, q)
        except Exception:
            print(' ', lang, 'FAIL', r.stdout[:80], r.stderr[:120])

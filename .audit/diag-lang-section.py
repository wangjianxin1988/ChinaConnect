import sys, re
sys.stdout.reconfigure(encoding="utf-8")
txt = open("src/i18n/translations.ts", encoding="utf-8").read()
pattern = re.compile(r'\n(\s*)(["\']?)([a-zA-Z-]{2,10})\2\s*:\s*\{')
langs = {}
for m in pattern.finditer(txt):
    key = m.group(3)
    if key in ('en','ja','ko','th','vi','ru','fr','de','ar','fa','zh-CN','zh-TW'):
        langs.setdefault(key, m.start())
order = sorted(langs.items(), key=lambda x: x[1])
for lang in ["en","ja","ko"]:
    start = dict(order)[lang]
    end = order[[l for l,_ in order].index(lang)+1][1] if [l for l,_ in order].index(lang)+1 < len(order) else len(txt)
    seg = txt[start:end]
    m = re.search(r'language:\s*\{([\s\S]*?)\n\s{4}\}', seg)
    if m:
        print("=====", lang)
        print(m.group(1)[:500])

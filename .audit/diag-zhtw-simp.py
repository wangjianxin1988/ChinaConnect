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
SIMPLIFIED = set('门们国这为长东车红经间见进说时书万与个来对发会开动风头飞云电话样张专业乡历严丽举义气乐龙应学体备后产单实导对当从')
def is_simp(s):
    return any(c in SIMPLIFIED for c in s)
for lang in ['zh-CN','zh-TW']:
    start = dict(order)[lang]
    i = [l for l,_ in order].index(lang)
    end = order[i+1][1] if i+1 < len(order) else len(txt)
    seg = txt[start:end]
    vals = re.findall(r':\s*"((?:[^"\\]|\\.)*)"', seg)
    simp = [v for v in vals if is_simp(v) and not re.search(r'[\u3040-\u30ff]', v)]
    print(lang, "simp-containing values:", len(simp))
    for v in simp[:20]:
        print("  ", v[:70])

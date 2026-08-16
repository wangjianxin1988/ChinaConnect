import sys, re
sys.stdout.reconfigure(encoding="utf-8")
txt = open("src/i18n/translations.ts", encoding="utf-8").read()
# detect blocks robustly
pattern = re.compile(r'\n(\s*)(["\']?)([a-zA-Z-]{2,10})\2\s*:\s*\{')
langs = {}
for m in pattern.finditer(txt):
    key = m.group(3)
    if key in ('en','ja','ko','th','vi','ru','fr','de','ar','fa','zh-CN','zh-TW'):
        langs.setdefault(key, m.start())
order = sorted(langs.items(), key=lambda x: x[1])
KANA = re.compile(r'[\u3040-\u30ff]')
HAN = re.compile(r'[\u3400-\u9fff]')
for i,(lang,start) in enumerate(order):
    end = order[i+1][1] if i+1<len(order) else len(txt)
    seg = txt[start:end]
    vals = re.findall(r':\s*"((?:[^"\\]|\\.)*)"', seg)
    kana = [v for v in vals if KANA.search(v)]
    han_no_kana = [v for v in vals if HAN.search(v) and not KANA.search(v)]
    print(f"{lang:6s} values={len(vals):5d} kana={len(kana):4d} han_no_kana={len(han_no_kana):4d}")
    if lang in ('ko','th','vi'):
        print("   han_no_kana samples:", [v[:40] for v in han_no_kana[:8]])

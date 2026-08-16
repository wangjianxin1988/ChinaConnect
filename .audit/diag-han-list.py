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
def seg(lang):
    for i,(l,start) in enumerate(order):
        if l==lang:
            end = order[i+1][1] if i+1<len(order) else len(txt)
            return txt[start:end]
KANA = re.compile(r'[\u3040-\u30ff]')
HAN = re.compile(r'[\u3400-\u9fff]')
for lang in ["ko","th","vi"]:
    s = seg(lang)
    vals = re.findall(r'([A-Za-z][A-Za-z0-9]*)\s*:\s*"((?:[^"\\]|\\.)*)"', s)
    print("=====", lang)
    for k, v in vals:
        if HAN.search(v) and not KANA.search(v):
            print(f"  {k}: {v[:60]}")

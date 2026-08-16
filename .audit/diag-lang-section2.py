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
for i,(lang,start) in enumerate(order):
    end = order[i+1][1] if i+1<len(order) else len(txt)
    seg = txt[start:end]
    m = re.search(r'\n\s{4}language:\s*\{([\s\S]*?)\n\s{6}\}', seg)
    if m:
        block = m.group(1)
        if "nativeName" in block:
            print("=====", lang)
            for k in ["chinese","english","name","nativeName","code","current","dir","switchTo"]:
                mm = re.search(r'\n\s{6}' + k + r':\s*"([^"]*)"', block)
                print(f"  {k}: {mm.group(1) if mm else '?'}")

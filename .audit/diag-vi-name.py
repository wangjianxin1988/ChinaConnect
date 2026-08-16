import sys, re
sys.stdout.reconfigure(encoding="utf-8")
txt = open("src/i18n/translations.ts", encoding="utf-8").read()
# find vi block
pattern = re.compile(r'\n(\s*)(["\']?)([a-zA-Z-]{2,10})\2\s*:\s*\{')
langs = {}
for m in pattern.finditer(txt):
    key = m.group(3)
    if key in ('en','ja','ko','th','vi','ru','fr','de','ar','fa','zh-CN','zh-TW'):
        langs.setdefault(key, m.start())
order = sorted(langs.items(), key=lambda x: x[1])
start = dict(order)['vi']
end = dict(order)['ru']
seg = txt[start:end]
for m in re.finditer(r'\n(\s*)([A-Za-z][A-Za-z0-9]*)\s*:\s*"((?:[^"\\]|\\.)*)"', seg):
    if m.group(2) in ('name','nativeName') and re.search(r'[\u3400-\u9fff]', m.group(3)):
        # print with surrounding lines
        pos = m.start()
        print("--- around", m.group(2), "---")
        print(seg[max(0,pos-400):pos+200])
        print()

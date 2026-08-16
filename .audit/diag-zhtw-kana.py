import sys, re
sys.stdout.reconfigure(encoding="utf-8")
txt = open("src/i18n/translations.ts", encoding="utf-8").read()
start = txt.find('"zh-TW": {')
if start == -1: start = txt.find('zh-TW: {')
end = len(txt)
seg = txt[start:end]
KANA = re.compile(r'[\u3040-\u30ff]')
for m in re.finditer(r'([A-Za-z][A-Za-z0-9]*)\s*:\s*"((?:[^"\\]|\\.)*)"', seg):
    if KANA.search(m.group(2)):
        print(f"  {m.group(1)}: {m.group(2)[:80]}")

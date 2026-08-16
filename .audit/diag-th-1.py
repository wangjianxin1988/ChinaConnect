import sys, re
sys.stdout.reconfigure(encoding="utf-8")
txt = open("src/i18n/translations.ts", encoding="utf-8").read()
start = txt.find('th: {')
end = txt.find('vi: {')
seg = txt[start:end]
for m in re.finditer(r'([A-Za-z][A-Za-z0-9]*)\s*:\s*"((?:[^"\\]|\\.)*)"', seg):
    if "安全检查" in m.group(2):
        print("key:", m.group(1))
        print("value:", m.group(2))
        print("line in file:", txt[:start].count("\n") + seg[:m.start()].count("\n") + 1)

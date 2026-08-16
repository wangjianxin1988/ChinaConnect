import sys
sys.stdout.reconfigure(encoding="utf-8")
lines = open("src/i18n/translations.ts", encoding="utf-8").read().split("\n")
for i, ln in enumerate(lines):
    if "\ufffd" in ln:
        print(i+1, repr(ln.strip()[:90]))

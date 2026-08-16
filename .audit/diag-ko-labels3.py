import sys, re
sys.stdout.reconfigure(encoding="utf-8")
txt = open("src/i18n/translations.ts", encoding="utf-8").read()
idx_ko = txt.find("ko: {")
seg = txt[idx_ko: idx_ko+3000]
print(seg[:2500])

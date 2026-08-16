import sys, re
sys.stdout.reconfigure(encoding="utf-8")
txt = open("src/i18n/translations.ts", encoding="utf-8").read()
# Find the ko block and ja block boundaries
idx_ko = txt.find("ko: {")
idx_ja = txt.find("ja: {")
idx_en = txt.find("en: {")
print("idx en/ja/ko:", idx_en, idx_ja, idx_ko)
# within ko block, search for cityPage.climate-ish keys
ko_block = txt[idx_ko: idx_ko+60000]
for key in ["climate:", "electricity:", "durationLabel:", "frequencyLabel:", "priceLabel:", "esimRecommended:", "mapLayerDesc:", "foodSubtitle:"]:
    for m in re.finditer(r'\n\s*' + re.escape(key) + r'\s*:\s*"([^"]*)"', ko_block):
        print("ko", key, "=>", m.group(1)[:80])

import sys, re
sys.stdout.reconfigure(encoding="utf-8")
txt = open("src/i18n/translations.ts", encoding="utf-8").read()
# extract per-language blocks
keys = ["climate:", "electricity:", "durationLabel:", "frequencyLabel:", "priceLabel:", "esimRecommended:", "mapLayerDesc:", "foodSubtitle:"]
# split by language sections: find all "xx: {" patterns
sections = re.findall(r'\n\s{2}([a-z-]{2,5}): \{', txt)
print("sections found:", list(dict.fromkeys(sections))[:20])
# For each key, find the value in each language section
for key in keys:
    print("=====", key)
    for m in re.finditer(r'\n\s{6}' + re.escape(key) + r' "([^"]*)"', txt):
        # need language context - walk backwards
        pass

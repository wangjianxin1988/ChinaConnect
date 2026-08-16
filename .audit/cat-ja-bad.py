import json, sys, re
sys.stdout.reconfigure(encoding="utf-8")
d = json.load(open(".audit/ja-bad-keys.json", encoding="utf-8"))
keys = [x["key"] for x in d["badKeys"]]
KANA = re.compile(r'[\u3040-\u30ff]')
HAN = re.compile(r'[\u3400-\u9fff]')
kana_keys = [k for k in keys if KANA.search(k)]
cjk_no_kana = [k for k in keys if HAN.search(k) and not KANA.search(k)]
latin = [k for k in keys if not HAN.search(k) and not KANA.search(k)]
print("with kana (ja source, identity ok):", len(kana_keys))
print("CJK no kana:", len(cjk_no_kana))
print("latin:", len(latin), latin)
print()
print("--- CJK no kana list ---")
for k in cjk_no_kana:
    print(repr(k[:60]))

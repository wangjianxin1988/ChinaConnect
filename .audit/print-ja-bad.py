import json, sys
sys.stdout.reconfigure(encoding="utf-8")
d = json.load(open(".audit/ja-bad-keys.json", encoding="utf-8"))
print("bad count:", len(d["badKeys"]))
for x in d["badKeys"]:
    print(repr(x["key"][:80]))

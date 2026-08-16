import sys, json
sys.stdout.reconfigure(encoding="utf-8")
d = json.load(open(".audit/guide-strings.json", encoding="utf-8"))
s = d["strings"]
print("strings type:", type(s).__name__, "len:", len(s))
key = "在车站查看英文线路图"
if isinstance(s, dict):
    print("key in strings:", key in s)
    if key in s:
        print("value:", repr(s[key]))
else:
    print("first 3:", s[:3])
# find any key containing 线路图 or 英文
hits = [k for k in s if "线路图" in str(k) or "英文" in str(k)]
print("related keys:", hits[:10])

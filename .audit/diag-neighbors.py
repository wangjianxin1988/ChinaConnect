import sys, json
sys.stdout.reconfigure(encoding="utf-8")
d = json.load(open(".audit/guide-strings.json", encoding="utf-8"))
strings = d["strings"]
for target in ["MultiHop", "Windscribe", "Wardens", "Contact Phone"]:
    idxs = [i for i, s in enumerate(strings) if target in s]
    print("=====", target, "at indices", idxs)
    for i in idxs:
        lo, hi = max(0, i-3), min(len(strings), i+4)
        for j in range(lo, hi):
            print(f"  [{j}] {strings[j][:90]}")

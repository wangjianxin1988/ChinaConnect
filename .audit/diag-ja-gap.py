import re, sys, json
sys.stdout.reconfigure(encoding="utf-8")
d = json.load(open(".audit/guide-strings.json", encoding="utf-8"))
real = d["strings"]
print("real keys:", len(real))
re_ts = re.compile(r'^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$', re.M)
def parse(f):
    m = {}
    try:
        for x in re_ts.finditer(open(f, encoding="utf-8").read()):
            m[x.group(1)] = x.group(2)
    except FileNotFoundError:
        pass
    return m
ja = parse("src/data/guide/ja-overrides.ts")
print("ja-overrides entries:", len(ja))
missing = [k for k in real if k not in ja]
identity = [k for k, v in ja.items() if v == k]
print("missing:", len(missing))
print("identity:", len(identity))
print("sample missing:", missing[:5])
print("sample identity:", identity[:5])

import re, sys
sys.stdout.reconfigure(encoding="utf-8")
re_ts = re.compile(r'^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$', re.M)
t = open("src/data/guide/overrides-ja.ts", encoding="utf-8").read()
entries = dict((m.group(1), m.group(2)) for m in re_ts.finditer(t))
print("overrides-ja.ts entries:", len(entries))

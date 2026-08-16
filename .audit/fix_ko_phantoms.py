# -*- coding: utf-8 -*-
import io, os, json, re, sys

# Migrate v1-bug phantom numeric keys in ko city data (SAFE subset):
#   object has a sibling LIST_FIELDS list -> value moves into list[N], phantom deleted.
# Unhandled (counted, left for manual): transport.local style (no sibling list).
LANG = "ko"
BASE = "src/data/cities-i18n/%s" % LANG
LIST_FIELDS = ["highlights", "dishHighlights", "tags", "subtitle", "items", "list"]
dry = "--dry-run" in sys.argv

def migrate(obj, path=""):
    fixed = 0
    if isinstance(obj, list):
        for v in obj:
            fixed += migrate(v, path)
    elif isinstance(obj, dict):
        num_keys = [k for k in obj if re.fullmatch(r"\d+", k)]
        if num_keys:
            target_list = None
            for f in LIST_FIELDS:
                if isinstance(obj.get(f), list):
                    target_list = obj[f]
                    break
            if target_list is not None:
                for k in sorted(num_keys, key=int):
                    idx = int(k)
                    val = obj[k]
                    while len(target_list) <= idx:
                        target_list.append(None)
                    cur = target_list[idx]
                    # prefer the phantom value when current slot is CJK-containing and phantom is cleaner
                    if cur is None or (isinstance(cur, str) and re.search(r"[\u3400-\u9fff]", cur) and not re.search(r"[\u3400-\u9fff]", str(val))):
                        target_list[idx] = val
                    del obj[k]
                    fixed += 1
        for k, v in list(obj.items()):
            fixed += migrate(v, path + "." + k if path else k)
    return fixed

total = 0
unhandled = []
for fn in sorted(os.listdir(BASE)):
    p = os.path.join(BASE, fn)
    d = json.loads(io.open(p, encoding="utf-8").read())
    n = migrate(d)
    if n:
        total += n
        if not dry:
            tmp = p + ".tmp"
            io.open(tmp, "w", encoding="utf-8", newline="\n").write(json.dumps(d, ensure_ascii=False, indent=2))
            os.replace(tmp, p)
# count remaining numeric keys (unhandled)
def count_nums(o):
    n = 0
    if isinstance(o, dict):
        for k, v in o.items():
            if re.fullmatch(r"\d+", k): n += 1
            n += count_nums(v)
    elif isinstance(o, list):
        for v in o: n += count_nums(v)
    return n
left = 0
for fn in sorted(os.listdir(BASE)):
    d = json.loads(io.open(os.path.join(BASE, fn), encoding="utf-8").read())
    left += count_nums(d)
print("%s phantom migrations: %d %s | remaining numeric keys: %d" % (LANG, total, "(dry)" if dry else "", left))

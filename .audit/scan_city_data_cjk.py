# -*- coding: utf-8 -*-
"""Data-level CJK residue scan for city i18n files (non-zh languages)."""
import io, json, os, re, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
CJK = re.compile(r"[\u3400-\u9fff]+")
LANGS = ["ja","ko","th","vi","ru","fr","de","ar","fa"]
CITIES = [f[:-5] for f in os.listdir("src/data/cities") if f.endswith(".json")]

def walk(o, path, hits):
    if isinstance(o, dict):
        for k, v in o.items():
            walk(v, path + "/" + k, hits)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            walk(v, path + f"[{i}]", hits)
    elif isinstance(o, str):
        m = CJK.search(o)
        if m:
            hits.append((path, o))

for lang in LANGS:
    hits = []
    files = 0
    for city in CITIES:
        p = f"src/data/cities-i18n/{lang}/{city}.json"
        if not os.path.exists(p): continue
        files += 1
        try:
            d = json.load(io.open(p, encoding="utf-8"))
        except Exception as e:
            print("PARSE ERR", p, e); continue
        walk(d, "", hits)
    # aggregate by top-level field group
    from collections import Counter
    groups = Counter()
    for path, val in hits:
        parts = path.strip("/").split("/")
        group = parts[0] if parts else "?"
        groups[group + ":" + ("/".join(parts[1:3]) if len(parts) > 2 else "")] += 1
    print(f"=== {lang}: files={files} cjk_fields={len(hits)} ===")
    for g, c in groups.most_common(15):
        print(f"   {c:5d}  {g}")

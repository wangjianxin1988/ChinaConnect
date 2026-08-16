# -*- coding: utf-8 -*-
"""Compare each lang city data against ja baseline at leaf-path level.
residue = ja value has no CJK but lang value has CJK (ja translated it, lang did not).
Excludes .name/.nameEn fields (proper nouns stay as-is across languages).
"""
import io, json, os, re, sys
from collections import Counter
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
CJK = re.compile(r"[\u3400-\u9fff]")
LANGS = ["ko","th","vi","ru","fr","de","ar","fa"]
CITIES = [f[:-5] for f in os.listdir("src/data/cities") if f.endswith(".json")]

def leafs(o, path="", out=None):
    if out is None: out = []
    if isinstance(o, dict):
        for k, v in o.items(): leafs(v, path + "/" + k, out)
    elif isinstance(o, list):
        for i, v in enumerate(o): leafs(v, path + f"[{i}]", out)
    else:
        out.append((path, o))
    return out

def load(lang, city):
    p = f"src/data/cities-i18n/{lang}/{city}.json"
    if not os.path.exists(p): return None
    return json.load(io.open(p, encoding="utf-8"))

for lang in LANGS:
    residues = []
    missing = 0
    for city in CITIES:
        ja = load("ja", city)
        lg = load(lang, city)
        if ja is None or lg is None: continue
        ja_leafs = dict(leafs(ja))
        for path, val in leafs(lg):
            if not isinstance(val, str) or not CJK.search(val): continue
            last = path.rsplit("/", 1)[-1]
            if last == "name" or last == "nameEn": continue
            ja_val = ja_leafs.get(path)
            if isinstance(ja_val, str) and not CJK.search(ja_val):
                residues.append((city, path, val[:60], ja_val[:60]))
    groups = Counter()
    for city, path, val, jav in residues:
        parts = path.strip("/").split("/")
        groups[parts[0] if parts else "?"] += 1
    print(f"=== {lang}: residue_fields={len(residues)} ===")
    for g, c in groups.most_common(10):
        print(f"   {c:5d}  {g}")
    # top example by city
    bycity = Counter(r[0] for r in residues)
    print("   cities top:", bycity.most_common(5))
    for r in residues[:5]:
        print("   EX", r[0], r[1], "=>", repr(r[2]))

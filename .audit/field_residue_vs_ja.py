# -*- coding: utf-8 -*-
"""Field-level residue: lang value has CJK runs that differ from ja value's CJK runs.
Reports field paths + values for each city/lang so they can be batch-translated."""
import io, json, os, re, sys
from collections import Counter, defaultdict
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
CJK = re.compile(r"[\u3400-\u9fff]+")
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
    for city in CITIES:
        ja, lg = load("ja", city), load(lang, city)
        if ja is None or lg is None: continue
        ja_leafs = dict(leafs(ja))
        for path, val in leafs(lg):
            if not isinstance(val, str) or not CJK.search(val): continue
            last = path.rsplit("/", 1)[-1]
            if last in ("name", "nameEn", "id", "slug", "image", "imageUrl", "coverImage", "phone", "coordinates"): continue
            ja_val = ja_leafs.get(path)
            if not isinstance(ja_val, str): continue
            ja_runs = set(CJK.findall(ja_val))
            v_runs = set(CJK.findall(val))
            if v_runs and v_runs != ja_runs:
                residues.append((city, path, val, ja_val))
    by_path = Counter()
    for c, p, v, j in residues:
        parts = p.strip("/").split("/")
        by_path["/".join(parts[:2])] += 1
    print(f"=== {lang}: residue_fields={len(residues)} ===")
    for g, n in by_path.most_common(12):
        print(f"   {n:4d}  {g}")
    bycity = Counter(r[0] for r in residues)
    print("   top cities:", bycity.most_common(6))
    # dump full list to file
    with io.open(f".audit/residue-{lang}.json", "w", encoding="utf-8") as f:
        json.dump([{"city": c, "path": p, "value": v, "ja": j} for c, p, v, j in residues], f, ensure_ascii=False, indent=1)

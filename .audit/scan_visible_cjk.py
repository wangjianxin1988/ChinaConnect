# -*- coding: utf-8 -*-
"""Page-level visible CJK scan v2: strips scripts, styles, and ENTIRE astro-island blocks."""
import io, re, sys, urllib.request
from collections import Counter
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
CJK = re.compile(r"[\u3400-\u9fff]+")
URLS_FILE = r".audit/ja-all-urls.txt"
BASE = "http://localhost:4322"

def ja_urls():
    return [l.strip() for l in open(URLS_FILE, encoding="utf-8") if l.strip()]

def lang_url(lang, ja_path):
    if lang == "en":
        if ja_path == "/ja/": return "/"
        if ja_path.startswith("/ja"): return ja_path[3:]
        return ja_path
    if ja_path == "/ja/": return f"/{lang}/"
    if ja_path.startswith("/ja"): return "/" + lang + ja_path[3:]
    return ja_path

def fetch(path):
    req = urllib.request.Request(BASE + path, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8", "replace")

def visible(html):
    html = re.sub(r"<script[^>]*>.*?</script>", " ", html, flags=re.S)
    html = re.sub(r"<style[^>]*>.*?</style>", " ", html, flags=re.S)
    html = re.sub(r"<!--.*?-->", " ", html, flags=re.S)
    # remove whole astro-island blocks (opening tag may contain > inside props)
    html = re.sub(r"<astro-island\b.*?</astro-island>", " ", html, flags=re.S)
    # remove any remaining element attributes that look like serialized JSON props
    html = re.sub(r'\s(?:props|ssr|data-astro-cid)="[^"]*"', " ", html)
    return html

def cjk_fragments(html):
    return [m.group(0) for m in CJK.finditer(visible(html))]

import argparse
ap = argparse.ArgumentParser()
ap.add_argument("--lang", required=True)
ap.add_argument("--limit", type=int, default=0)
ap.add_argument("--url", default="")
ap.add_argument("--baseline", action="store_true")
args = ap.parse_args()
paths = [args.url] if args.url else ja_urls()
if args.limit: paths = paths[:args.limit]
total = 0; by_url = Counter(); top = Counter(); fails = []
for jp in paths:
    lp = lang_url(args.lang, jp)
    try:
        html = fetch(lp)
    except Exception as e:
        fails.append((lp, str(e))); continue
    frags = set(cjk_fragments(html))
    if args.baseline and args.lang not in ("zh-CN","zh-TW"):
        try:
            ja_frags = set(cjk_fragments(fetch(jp)))
        except Exception:
            ja_frags = set()
        residue = frags - ja_frags
    else:
        residue = frags
    for r in residue: top[r[:50]] += 1
    if residue:
        by_url[lp] = len(residue); total += len(residue)
        for r in sorted(residue, key=len, reverse=True)[:3]:
            print("RES", lp, repr(r[:70]))
print("---")
print(f"lang={args.lang} urls={len(paths)} urls_with={len(by_url)} total={total} fails={len(fails)}")
for u, c in by_url.most_common(15): print(f"  {c:4d}  {u}")
for f, c in top.most_common(15): print(f"  frag[{c:3d}] {f!r}")
if fails[:5]: print("fails:", fails[:5])

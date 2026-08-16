# -*- coding: utf-8 -*-
"""Scan rendered pages for a language, report wrong-script residue.
Usage: python scripts/scan-lang-pages.py --lang=ko [--limit N] [--url /ko/city/beijing/]
For non-CJK languages: reports CJK fragments not present on the equivalent ja page (ja-standard baseline).
For zh-TW: additionally reports simplified-Chinese residue.
"""
import io, re, sys, argparse, urllib.request
from collections import Counter

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
CJK = re.compile(r'[\u3400-\u9fff]+')
URLS_FILE = r'.audit/ja-all-urls.txt'
BASE = 'http://localhost:4322'

def ja_urls():
    out = []
    for line in open(URLS_FILE, encoding='utf-8'):
        p = line.strip()
        if not p: continue
        out.append(p)  # starts with /ja/ or special
    return out

def lang_url(lang, ja_path):
    if lang == 'en':
        # EN uses non-prefixed routes (/, /cities/, ...)
        if ja_path == '/ja/':
            return '/'
        if ja_path.startswith('/ja'):
            return ja_path[3:]  # '/ja/xxx' -> '/xxx'
        return ja_path
    if ja_path == '/ja/':
        return f'/{lang}/'
    if ja_path.startswith('/ja'):
        return '/' + lang + ja_path[3:]  # '/ja' -> '/<lang>' keeping the rest
    return ja_path  # non-prefixed legacy path

def fetch(path):
    req = urllib.request.Request(BASE + path, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read().decode('utf-8', 'replace')

def strip_noise(html):
    html = re.sub(r'<script[^>]*>.*?</script>', ' ', html, flags=re.S)
    html = re.sub(r'<style[^>]*>.*?</style>', ' ', html, flags=re.S)
    html = re.sub(r'<!--.*?-->', ' ', html, flags=re.S)
    return html

def cjk_fragments(html):
    body = strip_noise(html)
    return [m.group(0) for m in CJK.finditer(body)]

SIMPLIFIED = set('门们国这为长东车红经间见进说时书万与个来对发会开动风头飞云电电话样张专业乡历严丽举义气')
def simplified_runs(html):
    body = strip_noise(html)
    runs = []
    for m in re.finditer(r'[\u3400-\u9fff]{2,}', body):
        if any(c in SIMPLIFIED for c in m.group(0)):
            runs.append(m.group(0))
    return runs

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--lang', required=True)
    ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--url', default='')
    ap.add_argument('--baseline', action='store_true', help='compare CJK against ja baseline')
    args = ap.parse_args()
    lang = args.lang
    paths = ja_urls()
    if args.url:
        paths = [args.url]
    elif args.limit:
        paths = paths[:args.limit]
    total_residue = 0
    bad = []
    by_url = Counter()
    top_frags = Counter()
    for jp in paths:
        lp = lang_url(lang, jp)
        try:
            html = fetch(lp)
        except Exception as e:
            bad.append((lp, str(e)))
            continue
        frags = set(cjk_fragments(html))
        if args.baseline and lang != 'zh-CN' and lang != 'zh-TW':
            try:
                ja_html = fetch(jp)
                ja_frags = set(cjk_fragments(ja_html))
            except Exception:
                ja_frags = set()
            residue = frags - ja_frags
        elif lang == 'zh-TW':
            residue = set(simplified_runs(html))
        else:
            residue = frags
        for r in residue:
            top_frags[r[:60]] += 1
        if residue:
            by_url[lp] = len(residue)
            total_residue += len(residue)
            for r in list(residue)[:4]:
                print('RES', lp, repr(r[:80]))
    print('---')
    print(f'lang={lang} urls_checked={len(paths)} urls_with_residue={len(by_url)} total_residue={total_residue} fetch_failures={len(bad)}')
    for u, c in by_url.most_common(20):
        print(f'  {c:4d}  {u}')
    for f, c in top_frags.most_common(15):
        print(f'  frag[{c:3d}] {f!r}')
    if bad[:5]:
        print('fetch failures sample:', bad[:5])

if __name__ == '__main__':
    main()

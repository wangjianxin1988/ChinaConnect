# -*- coding: utf-8 -*-
"""Scan rendered EN pages for CJK characters (Phase 1 verification tool).
Usage: python scripts/en-clean/scan-en-pages.py [--limit N] [--url /path]
"""
import io, re, sys, json, argparse, urllib.request
from collections import Counter

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
CJK_CHAR = re.compile(r'[\u3400-\u9fff]')
URLS_FILE = r'.audit/ja-all-urls.txt'
BASE = 'http://localhost:4322'

def en_urls():
    out = []
    for line in open(URLS_FILE, encoding='utf-8'):
        p = line.strip()
        if not p: continue
        if p == '/ja/': out.append('/')
        elif p.startswith('/ja/'): out.append(p[4:])
        else: out.append(p)
    return out

def fetch(path):
    if not path.startswith('/'): path = '/' + path
    req = urllib.request.Request(BASE + path, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read().decode('utf-8', 'replace')

def strip_noise(html):
    html = re.sub(r'<script[^>]*>.*?</script>', ' ', html, flags=re.S)
    html = re.sub(r'<style[^>]*>.*?</style>', ' ', html, flags=re.S)
    html = re.sub(r'<!--.*?-->', ' ', html, flags=re.S)
    return html

def classify(html, start, end):
    ctx = html[max(0, start-80): end+80]
    if '<meta ' in ctx or 'property="og:' in ctx or 'name="keywords"' in ctx:
        return 'meta'
    before = html[max(0, start-200):start]
    attr_pat = re.compile(r'(title|alt|content|placeholder|data-[a-z-]+|aria-[a-z-]+)="[^"]*$')
    if attr_pat.search(before):
        return 'attr'
    return 'visible'

def scan_one(path):
    html = fetch(path)
    body = strip_noise(html)
    total = len(list(CJK_CHAR.finditer(body)))
    frags = []
    seen = set()
    for m in re.finditer(r'[\u3400-\u9fff]{1,}', body):
        c = classify(body, m.start(), m.end())
        frag = re.sub(r'\s+', ' ', body[max(0,m.start()-35): m.end()+35])
        key = (frag[:80], c)
        if key in seen: continue
        seen.add(key)
        frags.append((c, frag))
        if len(frags) >= 12: break
    return total, frags

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--url', default='')
    args = ap.parse_args()
    urls = en_urls()
    if args.url:
        urls = [args.url]
    elif args.limit:
        urls = urls[:args.limit]
    totals = Counter()
    per_pat = Counter()
    bad = []
    for u in urls:
        try:
            total, frags = scan_one(u)
        except Exception as e:
            print('ERR', u, e)
            continue
        totals[u] = total
        seg = u.strip('/').split('/')[0] if u.strip('/') else 'home'
        per_pat[seg] += total
        if total > 0:
            bad.append((u, total, frags))
    print('=== SUMMARY ===')
    print('urls scanned:', len(urls), 'with CJK:', len(bad))
    print('total CJK (visible/attr/meta after script strip):', sum(totals.values()))
    print('by path pattern:', dict(per_pat.most_common()))
    print()
    print('=== TOP PAGES ===')
    for u, t, _ in sorted(bad, key=lambda x: -x[1])[:25]:
        print(f'{t:6d}  {u}')
    print()
    print('=== SAMPLES ===')
    for u, t, frags in sorted(bad, key=lambda x: -x[1])[:8]:
        print(f'--- {u} ({t})')
        for c, f in frags:
            print(f'   [{c}] ...{f}...')
    report = {u: {'total': t, 'frags': [{'cls': c, 'ctx': f} for c, f in fr]} for u, t, fr in bad}
    with open('.audit/en-cjk-report.json', 'w', encoding='utf-8') as fp:
        json.dump(report, fp, ensure_ascii=False, indent=1)
    print()
    print('report saved: .audit/en-cjk-report.json')

if __name__ == '__main__':
    main()

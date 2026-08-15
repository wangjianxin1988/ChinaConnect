# -*- coding: utf-8 -*-
"""Analyze Chinese in src/data/hotels/*.ts (district/address/highlights/nameEn)."""
import io, re, sys, glob
from collections import Counter

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
CJK = re.compile(r'[\u3400-\u9fff]')
fs = sorted(glob.glob(r'src/data/hotels/*-hotels.ts'))

dists = Counter(); hl = Counter(); addrs = Counter(); nameens = Counter()
n_hotels = 0
for f in fs:
    d = open(f, encoding='utf-8').read()
    n_hotels += d.count('name:')
    for m in re.finditer(r'district: "([^"]*)"', d): dists[m.group(1)] += 1
    for m in re.finditer(r'address: "([^"]*)"', d): addrs[m.group(1)] += 1
    for m in re.finditer(r'nameEn: "([^"]*)"', d):
        if CJK.search(m.group(1)): nameens[m.group(1)] += 1
    for m in re.finditer(r'highlights: \[(.*?)\]', d, re.S):
        for h in re.findall(r'"([^"]*)"', m.group(1)): hl[h] += 1

print('files:', len(fs), 'hotels:', n_hotels)
print()
print('=== districts: unique', len(dists))
for k, c in dists.most_common(60): print(f'{c:6d}  {k}')
print()
print('=== highlights: unique', len(hl))
for k, c in hl.most_common(80): print(f'{c:6d}  {k}')
print()
print('=== addresses: unique', len(addrs), '| samples')
for k, c in list(addrs.most_common(40)): print(f'{c:6d}  {k}')
print()
print('=== nameEn with CJK: unique', len(nameens))
for k, c in nameens.most_common(20): print(f'{c:5d}  {k}')

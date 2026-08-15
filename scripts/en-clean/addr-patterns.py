# -*- coding: utf-8 -*-
import io, re, sys, glob
from collections import Counter
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
fs = sorted(glob.glob(r'src/data/hotels/*-hotels.ts'))
addrs = []
for f in fs:
    d = open(f, encoding='utf-8').read()
    for m in re.finditer(r'address: "([^"]*)"', d):
        addrs.append(m.group(1))
print('total addresses:', len(addrs), 'unique:', len(set(addrs)))
# classify patterns
pat = Counter()
samples = {}
for a in addrs:
    if re.fullmatch(r'\d+号', a):
        p = 'digits-only'
    elif re.fullmatch(r'[\u4e00-\u9fff]+(路|街|大道|道|巷|马路|大路)[\u4e00-\u9fff]*\d+号', a):
        p = 'street-num'
    elif re.fullmatch(r'[\u4e00-\u9fff]+(区|县|市)[\u4e00-\u9fff]*(路|街|大道|道|巷)\d+号', a):
        p = 'district-street-num'
    elif re.fullmatch(r'[\u4e00-\u9fff]{2,4}\d+号', a):
        p = 'area-num'
    elif re.fullmatch(r'[\u4e00-\u9fff]+(栋|号楼|号|座)', a):
        p = 'building'
    else:
        p = 'other'
    pat[p] += 1
    samples.setdefault(p, []).append(a)
for p, c in pat.most_common():
    print(f'{c:6d}  {p}')
print()
for p, ss in samples.items():
    print('---', p)
    for s in ss[:8]: print('   ', s)
# street-type counts
st = Counter()
for a in addrs:
    for t in ['路','街','大道','道','巷','马路','大路','路北','街南']:
        if t in a: st[t]+=1
print()
print('street type occurrences:', st.most_common())

import io
p = '.audit/fix_tr_values.py'
s = io.open(p, encoding='utf-8').read()
# add underscore-leaf skip in jobs collection
old = """    todo = []
    for p, (v, a, b) in en.items():
        if p in dstripped and dstripped[p][0] == v and not keepable(v):
            todo.append((p, dstripped[p][1], dstripped[p][2]))"""
new = """    todo = []
    for p, (v, a, b) in en.items():
        leaf = p.rsplit('.', 1)[-1] if '.' in p else p
        if re.fullmatch(r'_+', leaf):
            continue
        if p in dstripped and dstripped[p][0] == v and not keepable(v):
            todo.append((p, dstripped[p][1], dstripped[p][2]))"""
assert old in s
s = s.replace(old, new)
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('patched fixer')

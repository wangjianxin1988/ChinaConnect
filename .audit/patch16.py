import io
p='scripts/guide-full-chain.py'
s=io.open(p,encoding='utf-8').read()

old='''    done = set(state.get("done", []))
    queue = [(k, l) for k in ("guide", "apps") for l in GUIDE_LANGS]
    queue = [t for t in queue if t not in done]'''
new='''    done = {tuple(x.split(":", 1)) for x in state.get("done", [])}
    queue = [(k, l) for k in ("guide", "apps") for l in GUIDE_LANGS]
    queue = [t for t in queue if t not in done]'''
assert old in s
s=s.replace(old,new)

io.open(p,'w',encoding='utf-8',newline='\n').write(s)
print('patched done-state handling')

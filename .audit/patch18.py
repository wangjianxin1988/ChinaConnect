import io
p='scripts/guide-full-chain.py'
s=io.open(p,encoding='utf-8').read()
# fix subprocess decode for quality + residue dump
old='''        r = subprocess.run(
            ["node", ".audit/check-guide-quality.mjs", lang, kind],
            capture_output=True, text=True, timeout=60,
        )'''
new='''        r = subprocess.run(
            ["node", ".audit/check-guide-quality.mjs", lang, kind],
            capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=60,
        )'''
assert old in s
s=s.replace(old,new)
old='''                rr = subprocess.run(
                    ["node", ".audit/check-guide-quality.mjs", lang, kind, "--keys"],
                    capture_output=True, text=True, timeout=60,
                )'''
new='''                rr = subprocess.run(
                    ["node", ".audit/check-guide-quality.mjs", lang, kind, "--keys"],
                    capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=60,
                )'''
assert old in s
s=s.replace(old,new)
io.open(p,'w',encoding='utf-8',newline='\n').write(s)
print('patched subprocess decode')

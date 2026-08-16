import io
p='scripts/guide-full-chain.py'
s=io.open(p,encoding='utf-8').read()

old='''MAX_FAILURES = 4
SLEEP = 30'''
new='''MAX_FAILURES = 2
SLEEP = 30'''
assert old in s
s=s.replace(old,new)

# dump residue on final failure
old='''        else:
            log(f"  {key} GAVE UP after {MAX_FAILURES} attempts (manual review)")
            done.add((kind, lang))  # move on; manual review later'''
new='''        else:
            log(f"  {key} GAVE UP after {MAX_FAILURES} attempts (manual review)")
            try:
                rr = subprocess.run(
                    ["node", ".audit/check-guide-quality.mjs", lang, kind, "--keys"],
                    capture_output=True, text=True, timeout=60,
                )
                if rr.returncode == 0:
                    import json as _json
                    res = _json.loads(rr.stdout.strip())
                    respath = os.path.join(ROOT, ".audit", f"guide-residue-{kind}-{lang}.json")
                    _json.dump(res, open(respath, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
                    log(f"  {key} residue dumped -> {respath}")
            except Exception:
                pass
            done.add((kind, lang))  # move on; manual review later'''
assert old in s
s=s.replace(old,new)

io.open(p,'w',encoding='utf-8',newline='\n').write(s)
print('patched controller')

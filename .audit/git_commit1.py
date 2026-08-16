# -*- coding: utf-8 -*-
import io, os, subprocess, glob, sys

def run(args, check=True):
    r = subprocess.run(args, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if check and r.returncode != 0:
        print("CMD FAIL:", " ".join(args))
        print(r.stderr[-2000:])
        sys.exit(1)
    return r

# 1) remove my temp files
for p in glob.glob(".audit/tmp_*.py"):
    os.remove(p)

# 2) stage everything except untracked .audit diagnostics, plus tracked .audit/ja-all-urls.txt
run(["git", "add", "-A", ":!:.audit"])
run(["git", "add", ".audit/ja-all-urls.txt"])

# 3) show staged summary
r = run(["git", "status", "--porcelain"])
lines = [l for l in r.stdout.splitlines() if l[:2] in ("M ", "A ", "D ", "R ", "MM", "AM")]
print("STAGED COUNT:", len(lines))
for l in lines[:40]:
    print(l)

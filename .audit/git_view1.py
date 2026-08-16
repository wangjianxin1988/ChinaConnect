# -*- coding: utf-8 -*-
import subprocess
r = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True, encoding="utf-8", errors="replace")
lines = [l for l in r.stdout.splitlines() if l[:2] in ("M ", "A ", "D ", "R ", "MM", "AM")]
print("STAGED COUNT:", len(lines))
for l in lines[40:]:
    print(l)

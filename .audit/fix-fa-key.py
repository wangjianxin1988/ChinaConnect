import sys
sys.stdout.reconfigure(encoding="utf-8")
p = "src/data/guide/overrides-fa.ts"
lines = open(p, encoding="utf-8").read().split("\n")
key = "Verify guide credentials"
fixed = "اعتبارنامه راهنما را بررسی کنید"
hit = 0
for i, ln in enumerate(lines):
    if key in ln:
        lines[i] = f'  "{key}": "{fixed}",'
        hit += 1
        print(f"line {i+1}: patched")
open(p, "w", encoding="utf-8", newline="\n").write("\n".join(lines))
print("patched lines:", hit)

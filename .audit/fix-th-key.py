import sys, io
sys.stdout.reconfigure(encoding="utf-8")
p = "src/data/guide/overrides-th.ts"
lines = open(p, encoding="utf-8").read().split("\n")
key = "在车站查看英文线路图"
fixed = "ตรวจแผนที่เส้นทางภาษาอังกฤษที่สถานี"
hit = 0
for i, ln in enumerate(lines):
    if key in ln:
        old = ln
        lines[i] = f'  "{key}": "{fixed}",'
        hit += 1
        print(f"line {i+1}: {old.strip()}  ->  {lines[i].strip()}")
open(p, "w", encoding="utf-8", newline="\n").write("\n".join(lines))
print("patched lines:", hit)

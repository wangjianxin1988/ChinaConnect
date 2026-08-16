import sys
sys.stdout.reconfigure(encoding="utf-8")
p = "src/i18n/translations.ts"
lines = open(p, encoding="utf-8").read().split("\n")
idx = 16864 - 1
old = 'ทำก่อนผ่าน安全检查ที่ห้องโถงผู้โดยสารขาออก'
new = 'ทำก่อนผ่านจุดตรวจรักษาความปลอดภัยที่ห้องโถงผู้โดยสารขาออก'
assert old in lines[idx], lines[idx][:100]
lines[idx] = lines[idx].replace(old, new)
open(p, "w", encoding="utf-8", newline="\n").write("\n".join(lines))
print("fixed line", 16864)

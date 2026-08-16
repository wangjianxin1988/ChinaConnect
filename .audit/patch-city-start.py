import re
p = "scripts/fix-city-data-cjk.mjs"
src = open(p, encoding="utf-8").read()
old = '''  console.log(`[${lang}] unique ja sources: ${uniqueJa.length}`);
  const map = new Map();'''
new = '''  console.log(`[${lang}] unique ja sources: ${uniqueJa.length}`);
  const startedAt = Date.now();
  const map = new Map();'''
assert old in src
src = src.replace(old, new)
open(p, "w", encoding="utf-8", newline="\n").write(src)
print("startedAt added")

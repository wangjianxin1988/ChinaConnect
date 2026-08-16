import re
p = "scripts/fix-city-data-cjk.mjs"
src = open(p, encoding="utf-8").read()
old = '''  const uniqueJa = [...new Set(actionable.map((a) => a.jaValue))];
  console.log(`[${lang}] unique ja sources: ${uniqueJa.length}`);
  const map = await translateBatch(uniqueJa, lang);'''
new = '''  const uniqueJa = [...new Set(actionable.map((a) => a.jaValue))];
  console.log(`[${lang}] unique ja sources: ${uniqueJa.length}`);
  const map = new Map();
  for (let i = 0; i < uniqueJa.length; i += BATCH_SIZE) {
    const chunk = uniqueJa.slice(i, i + BATCH_SIZE);
    const chunkMap = await translateBatch(chunk, lang);
    for (const [k, v] of chunkMap) map.set(k, v);
    const elapsed = Date.now() - startedAt;
    console.log(`  [${new Date().toISOString().slice(11, 19)}] lang ${lang} chunk ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(uniqueJa.length / BATCH_SIZE)} done ${chunkMap.size}/${chunk.length}`);
  }'''
assert old in src, "block not found"
src = src.replace(old, new)
# add startedAt before the loop
old2 = '''  const uniqueJa = [...new Set(actionable.map((a) => a.jaValue))];
  console.log(`[${lang}] unique ja sources: ${uniqueJa.length}`);
  const map = new Map();'''
new2 = '''  const uniqueJa = [...new Set(actionable.map((a) => a.jaValue))];
  console.log(`[${lang}] unique ja sources: ${uniqueJa.length}`);
  const startedAt = Date.now();
  const map = new Map();'''
if old2 not in src:
    src = src.replace(old, old2 + "\n" + "  const startedAt = Date.now();\n" + "  const map = new Map();\n" + "  for (...){}".replace("...", ""))  # no-op safeguard
open(p, "w", encoding="utf-8", newline="\n").write(src)
print("patched (verify structure)")

import re
p = "scripts/fix-translations-kana.mjs"
src = open(p, encoding="utf-8").read()

# 1) add simplified-char detector for zh-TW
old_const = 'const KANA_RE = /[\\u3040-\\u30ff]/;\nconst HAN_RE = /[\\u3400-\\u9fff]/;'
new_const = 'const KANA_RE = /[\\u3040-\\u30ff]/;\nconst HAN_RE = /[\\u3400-\\u9fff]/;\n// Simplified-only chars to catch zh-TW simplified residue.\nconst SIMP_RE = /[门们国这为长东车红经间见进说时书万与个来对发会开动风头飞云电话样张专业乡历严丽举义气乐龙应学体备后产单实导对当从]/;'
assert old_const in src
src = src.replace(old_const, new_const)

# 2) extend contamination logic for zh-TW
old_bad = '''    const hasKana = KANA_RE.test(v);
    const hasHan = HAN_RE.test(v);
    const bad = isZh ? hasKana : (hasKana || hasHan);
    if (!bad) continue;'''
new_bad = '''    const hasKana = KANA_RE.test(v);
    const hasHan = HAN_RE.test(v);
    const hasSimp = SIMP_RE.test(v);
    const bad = isZhTW ? (hasKana || hasSimp) : (isZh ? hasKana : (hasKana || hasHan));
    if (!bad) continue;'''
assert old_bad in src
src = src.replace(old_bad, new_bad)

# 3) iterate blocks in REVERSE so earlier replacements never shift later offsets
old_loop = '''for (let bi = 0; bi < blocks.length; bi += 1) {
  const { lang, start } = blocks[bi];
  if (lang === "en" || lang === "ja") continue;
  if (onlyLang && lang !== onlyLang) continue;
  const end = blockEnd(bi);'''
new_loop = '''for (let bi = blocks.length - 1; bi >= 0; bi -= 1) {
  const { lang, start } = blocks[bi];
  if (lang === "en" || lang === "ja") continue;
  if (onlyLang && lang !== onlyLang) continue;
  const end = blockEnd(bi);'''
assert old_loop in src
src = src.replace(old_loop, new_loop)
open(p, "w", encoding="utf-8", newline="\n").write(src)
print("patched")

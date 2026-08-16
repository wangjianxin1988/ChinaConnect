import re
p = "scripts/fix-translations-kana.mjs"
src = open(p, encoding="utf-8").read()
old = 'const KANA_RE = /[\\u3040-\\u30ff]/;'
new = '// Exclude U+30FB (katakana middle dot) which is a common CJK separator, not kana.\nconst KANA_RE = /[\\u3040-\\u30fa\\u30fc-\\u30ff]/;'
assert old in src
src = src.replace(old, new)
open(p, "w", encoding="utf-8", newline="\n").write(src)
print("patched KANA_RE")

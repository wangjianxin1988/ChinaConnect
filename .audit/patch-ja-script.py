import re
p = "scripts/translate-guide-strings.mjs"
src = open(p, encoding="utf-8").read()
# 1) allow --lang=ja
old_guard = '''if (!lang || lang === "ja") {
  console.error("--lang required (non-ja)");
  process.exit(1);
}'''
new_guard = '''if (!lang) {
  console.error("--lang required (ja/ko/zh-CN/zh-TW/th/vi/ru/fr/de/ar/fa)");
  process.exit(1);
}'''
assert old_guard in src, "guard block not found"
src = src.replace(old_guard, new_guard)

# 2) ja-friendly prompt rules
old_rules = '''RULES:
- Respond with ONLY a JSON object of the same shape (keys k0..k${keys.length - 1}) where EVERY value is translated into ${TARGETS[lang]}.
- No markdown, no commentary. Do NOT echo the input. Do NOT leave Chinese characters.
- Do NOT keep English or Chinese text unless it is a brand name, number, price, time, unit, phone number, URL or proper noun.
- Proper nouns should be transliterated into ${TARGETS[lang]} or kept as standard English/pinyin.
- For Chinese proper nouns and dish names, give a ${TARGETS[lang]} gloss in parentheses where helpful.`;'''
new_rules = '''RULES:
- Respond with ONLY a JSON object of the same shape (keys k0..k${keys.length - 1}) where EVERY value is translated into ${TARGETS[lang]}.
- No markdown, no commentary. Do NOT echo the input.
- Do NOT keep English or Chinese text unless it is a brand name, number, price, time, unit, phone number, URL or proper noun.
- Proper nouns should be transliterated into ${TARGETS[lang]} or kept as standard English/pinyin.
- For Chinese proper nouns and dish names, give a ${TARGETS[lang]} gloss in parentheses where helpful.
${lang === "ja" ? "- Translate into natural Japanese. Use kanji normally where appropriate (do NOT avoid kanji); kana-only Japanese is wrong.\\n" : ""}`;'''
assert old_rules in src, "rules block not found"
src = src.replace(old_rules, new_rules)
open(p, "w", encoding="utf-8", newline="\n").write(src)
print("patched OK")

import re
p = ".audit/check-guide-quality.mjs"
src = open(p, encoding="utf-8").read()
old = '''    if (v === k) {
      const legalZhIdentity = (lang === "zh-CN" || lang === "zh-TW") && isZhSource(k);
      if (!legalZhIdentity && !isKeepableToken(k)) { bad++; badKeys.push({ key: k, value: v }); }
    } else if (disallow && disallow.test(v)) {'''
new = '''    if (v === k) {
      const legalZhIdentity = (lang === "zh-CN" || lang === "zh-TW") && isZhSource(k);
      // For ja, source strings that already contain CJK are legal identity
      // (shared kanji / Japanese-source content); only Latin/other scripts
      // still need translation.
      const legalJaIdentity = lang === "ja" && (hasKana(k) || hasCJK(k));
      if (!legalZhIdentity && !legalJaIdentity && !isKeepableToken(k)) { bad++; badKeys.push({ key: k, value: v }); }
    } else if (disallow && disallow.test(v)) {'''
assert old in src, "block not found"
src = src.replace(old, new)
open(p, "w", encoding="utf-8", newline="\n").write(src)
print("patched quality gate")

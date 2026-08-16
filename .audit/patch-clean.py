import re
p = "scripts/fix-translations-kana.mjs"
src = open(p, encoding="utf-8").read()
old = '''      remaining.forEach((v, i) => {
        const raw = out[`k${i}`];
        if (typeof raw === "string" && raw.length > 0 && !KANA_RE.test(raw) === false ? true : true) {
          // accept any non-empty string; post-check handled by caller verification
        }
        if (typeof raw === "string" && raw.length > 0) result[v] = raw;
        else newRemaining.push(v);
      });'''
new = '''      remaining.forEach((v, i) => {
        const raw = out[`k${i}`];
        if (typeof raw === "string" && raw.length > 0) result[v] = raw;
        else newRemaining.push(v);
      });'''
assert old in src, "block not found"
src = src.replace(old, new)
open(p, "w", encoding="utf-8", newline="\n").write(src)
print("cleaned")

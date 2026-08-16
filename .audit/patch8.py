import io
p='.audit/check-guide-quality.mjs'
s=io.open(p,encoding='utf-8').read()

# Add real key set loading (guide kind) — count missing real keys too
old='''const lang = process.argv[2];
const kind = process.argv[3] || "guide"; // guide | apps | emergency'''
new='''const lang = process.argv[2];
const kind = process.argv[3] || "guide"; // guide | apps | emergency

// Real key set for guide dictionaries comes from .audit/guide-strings.json.
const REAL_KEYS = (() => {
  try {
    const d = JSON.parse(fs.readFileSync(".audit/guide-strings.json", "utf8"));
    return new Set(d.strings || []);
  } catch { return new Set(); }
})();'''
assert old in s
s=s.replace(old,new)

old='''let bad = 0, cont = 0, total = 0;
for (const p of paths) {
  for (const [k, v] of parse(p)) {
    total++;
    if (v === k) {
      const legalZhIdentity = (lang === "zh-CN" || lang === "zh-TW") && hasCJK(k);
      if (!legalZhIdentity && !isKeepableToken(k)) bad++;
    } else if (disallow && disallow.test(v)) {
      cont++;
    }
  }
}
console.log(JSON.stringify({ lang, kind, total, bad, cont }));'''
new='''let bad = 0, cont = 0, total = 0, junk = 0, missing = 0;
for (const p of paths) {
  for (const [k, v] of parse(p)) {
    if (REAL_KEYS.size > 0 && kind === "guide" && !REAL_KEYS.has(k)) { junk++; continue; }
    total++;
    if (v === k) {
      const legalZhIdentity = (lang === "zh-CN" || lang === "zh-TW") && hasCJK(k);
      if (!legalZhIdentity && !isKeepableToken(k)) bad++;
    } else if (disallow && disallow.test(v)) {
      cont++;
    }
  }
}
if (REAL_KEYS.size > 0 && kind === "guide") {
  for (const k of REAL_KEYS) {
    if (!paths.some((p) => parse(p).has(k))) missing++;
  }
}
console.log(JSON.stringify({ lang, kind, total, bad, cont, junk, missing }));'''
assert old in s
s=s.replace(old,new)
io.open(p,'w',encoding='utf-8',newline='\n').write(s)
print('patched check-guide-quality.mjs')

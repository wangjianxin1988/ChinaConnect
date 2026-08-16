import io
p='scripts/translate-guide-strings.mjs'
s=io.open(p,encoding='utf-8').read()
old='''// Seed zh-TW from the completed zh-CN dictionary (values are Simplified Chinese;
// the zhconv pass converts them to Traditional after the run).
if (lang === "zh-TW") {
  const cnFile = "src/data/guide/overrides-zh-CN.ts";
  if (fs.existsSync(cnFile)) {
    const text = fs.readFileSync(cnFile, "utf8");
    const re = /^\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)",?\\s*$/gm;
    for (const m of text.matchAll(re)) {
      if (existing[unescapeTs(m[1])] === undefined) existing[unescapeTs(m[1])] = unescapeTs(m[2]);
    }
  }
}'''
new='''// Seed zh-TW from the completed zh-CN dictionary (values are Simplified Chinese;
// the zhconv pass converts them to Traditional after the run).
if (lang === "zh-TW") {
  const cnFile = "src/data/guide/overrides-zh-CN.ts";
  if (fs.existsSync(cnFile)) {
    const text = fs.readFileSync(cnFile, "utf8");
    const re = /^\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)",?\\s*$/gm;
    for (const m of text.matchAll(re)) {
      if (existing[unescapeTs(m[1])] === undefined) existing[unescapeTs(m[1])] = unescapeTs(m[2]);
    }
  }
}
// Seed ja from the existing ja-overrides.ts (keeps current Japanese values,
// only fills missing keys). Generated file overrides-ja.ts is picked up by
// the import.meta.glob in guide-i18n.tsx.
if (lang === "ja" && !fs.existsSync(outFile)) {
  const jaFile = "src/data/guide/ja-overrides.ts";
  if (fs.existsSync(jaFile)) {
    const text = fs.readFileSync(jaFile, "utf8");
    const re = /^\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)",?\\s*$/gm;
    for (const m of text.matchAll(re)) {
      if (existing[unescapeTs(m[1])] === undefined) existing[unescapeTs(m[1])] = unescapeTs(m[2]);
    }
  }
}'''
assert old in s
s=s.replace(old,new)
io.open(p,'w',encoding='utf-8',newline='\n').write(s)
print('patched ja seeding')

import io
p='scripts/translate-guide-strings.mjs'
s=io.open(p,encoding='utf-8').read()
old='''const existing = {};
if (fs.existsSync(outFile)) {
  const text = fs.readFileSync(outFile, "utf8");
  const re = /^\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)",?\\s*$/gm;
  for (const m of text.matchAll(re)) existing[unescapeTs(m[1])] = unescapeTs(m[2]);
}'''
new='''const existing = {};
if (fs.existsSync(outFile)) {
  const text = fs.readFileSync(outFile, "utf8");
  const re = /^\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)",?\\s*$/gm;
  for (const m of text.matchAll(re)) existing[unescapeTs(m[1])] = unescapeTs(m[2]);
}
// Seed zh-TW from the completed zh-CN dictionary (values are Simplified Chinese;
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
assert old in s, 'existing block not found'
s=s.replace(old,new)
io.open(p,'w',encoding='utf-8',newline='\n').write(s)
print('patched zh-TW seeding')

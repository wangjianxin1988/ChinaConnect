import io
p='scripts/build-guide-strings.mjs'
s=io.open(p,encoding='utf-8').read()
old='''for (const dir of DATA_DIRS) {
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith(".ts") || name === "ja-overrides.ts") continue;
    files.push(path.join(dir, name));
  }
}'''
new='''for (const dir of DATA_DIRS) {
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith(".ts") || name === "ja-overrides.ts") continue;
    if (/^overrides-[\\w-]+\\.ts$/.test(name)) continue; // generated per-lang dicts, not source data
    files.push(path.join(dir, name));
  }
}'''
assert old in s
s=s.replace(old,new)
io.open(p,'w',encoding='utf-8',newline='\n').write(s)
print('patched build-guide-strings.mjs')

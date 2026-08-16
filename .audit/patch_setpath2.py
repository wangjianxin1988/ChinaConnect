import io, re

NEW = '''function setPath(obj, pathStr, value) {
  const tokens = [];
  for (const part of pathStr.split(".")) {
    const m = /^([^[]*)((?:\\[\\d+\\])*)$/.exec(part);
    const key = m ? m[1] : part;
    if (key !== "") tokens.push(key);
    const brackets = m ? m[2] : "";
    for (const b of brackets.matchAll(/\\[(\\d+)\\]/g)) tokens.push(Number(b[1]));
  }
  let cur = obj;
  for (let i = 0; i < tokens.length; i += 1) {
    const t = tokens[i];
    const isLast = i === tokens.length - 1;
    if (typeof t === "number") {
      if (!Array.isArray(cur)) return;
      if (isLast) { cur[t] = value; return; }
      if (!cur[t]) cur[t] = {};
      cur = cur[t];
    } else {
      if (isLast) { cur[t] = value; return; }
      if (!cur[t]) cur[t] = {};
      cur = cur[t];
    }
  }
}
'''

def replace_setpath(p):
    src = io.open(p, encoding='utf-8').read()
    m = re.search(r'function setPath\(obj, pathStr, value\) \{.*?\n\}\n', src, re.S)
    if not m:
        print(p, 'setPath not found')
        return
    src = src[:m.start()] + NEW + src[m.end():]
    io.open(p, 'w', encoding='utf-8', newline='\n').write(src)
    print(p, 'replaced')

for p in [r'scripts/fix-city-data-residual.mjs', r'scripts/fix-city-data-eng.mjs', r'scripts/fix-city-data-cjk-v2.mjs']:
    replace_setpath(p)

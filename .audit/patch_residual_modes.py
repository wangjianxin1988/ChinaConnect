import io
p = r'scripts/fix-city-data-residual.mjs'
c = io.open(p, encoding='utf-8').read()
if 'fastMode' not in c:
    c = c.replace('const RETRY_ATTEMPTS = 4;', 'let RETRY_ATTEMPTS = 4;')
    c = c.replace('const dryRun = args.includes("--dry-run");', 'const dryRun = args.includes("--dry-run");\nconst fastMode = args.includes("--fast");\nconst deepOnly = args.includes("--deep-only");\nif (fastMode) RETRY_ATTEMPTS = 1;')
old = r'''      if (!/[\u3040-\u30ff\u3400-\u9fff]/.test(jaV)) continue;
      actionable.push({ file: fn, path: p, value: v, enValue: enV, jaValue: jaV });'''
assert old in c, 'deep block not found'
c = c.replace(old, old + '\n      if (deepOnly && !/\[\d+\]\[\d+\]/.test(p)) continue;')
old2 = r'''  for (const s of remaining) {
    try {
      const content = await callChat(buildPrompt([s], lang, true));
      const result = extractJson(content);
      if (validOutput(result?.k0, lang, s)) resultMap.set(s, result.k0);
    } catch { /* keep */ }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return resultMap;'''
assert old2 in c, 'retry loop not found'
c = c.replace(old2, r'''  if (!fastMode) {
    for (const s of remaining) {
      try {
        const content = await callChat(buildPrompt([s], lang, true));
        const result = extractJson(content);
        if (validOutput(result?.k0, lang, s)) resultMap.set(s, result.k0);
      } catch { /* keep */ }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  return resultMap;''')
io.open(p, 'w', encoding='utf-8', newline='\n').write(c)
print('patched OK')

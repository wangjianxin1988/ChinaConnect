import io
p = r'.audit/gen_emergency_names.mjs'
c = io.open(p, encoding='utf-8').read()
# 1) add JA blocklist after FORBIDDEN line
old = 'const FORBIDDEN = /[\\u3040-\\u30ff\\u3400-\\u9fff\\uac00-\\ud7af\\u0400-\\u04ff\\u0600-\\u06ff\\u0e00-\\u0e7f]/;'
assert old in c
c = c.replace(old, old + '\nconst JA_SIMP_CHARS = /[驻总广发门东乐让节开汉语书报纸们吗这那电时马鸟鱼龙车长]/;')
# 2) prompt: language-specific hints
old = 'Return " + \n  return `You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.\nTranslate the following English names of emergency services, hospitals, police stations, embassies and consulates in China into ${TARGETS[lang]} for foreign visitors.\nUse the standard, commonly used ${TARGETS[lang]} name for each institution; for Chinese institutions use their well-known ${TARGETS[lang]} name when one exists.'
if old not in c:
    old = '  return `You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.\nTranslate the following English names of emergency services, hospitals, police stations, embassies and consulates in China into ${TARGETS[lang]} for foreign visitors.\nUse the standard, commonly used ${TARGETS[lang]} name for each institution; for Chinese institutions use their well-known ${TARGETS[lang]} name when one exists.'
assert old in c, 'prompt block not found'
hint = '  const langHint = lang === "ja"\n    ? " Use proper JAPANESE kanji readings (e.g. 病院, 警察署, 消防署, 大使館, 総領事館, 庁). NEVER use Simplified Chinese characters or Simplified Chinese names like 驻/总/广/医院."\n    : lang === "ko"\n      ? " Use the standard Korean name; NEVER use Chinese characters or Hanja."\n      : "";\n'
c = c.replace(old, hint + old.replace('Use the standard, commonly used ${TARGETS[lang]} name', 'Use the standard, commonly used ${TARGETS[lang]} name'))
# append hint into the prompt right after the "use their well-known" sentence
old2 = 'name when one exists.\nInput JSON:'
assert old2 in c
c = c.replace(old2, 'name when one exists.${langHint}\nInput JSON:')
# 3) validOutput: reject ja simplified chars
old3 = 'function validOutput(raw, lang, source) {\n  if (typeof raw !== "string" || raw.trim().length === 0) return false;\n  const trimmed = raw.trim();\n  if (trimmed === source) return false;\n  if (trimmed.toLowerCase() === source.toLowerCase()) return false;'
assert old3 in c
c = c.replace(old3, old3 + '\n  if (lang === "ja" && JA_SIMP_CHARS.test(trimmed)) return false;')
io.open(p, 'w', encoding='utf-8', newline='\n').write(c)
print('patched generator OK')

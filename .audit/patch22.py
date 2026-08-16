import io
fixes = [
 ('src/components/Guide/CulturalWarningPopup.tsx',
  '(lang === "zh-CN" || lang === "zh-TW" ? "下一个 →" : localized("Next →", "次へ →", lang))',
  'localized("Next →", "次へ →", lang)'),
 ('src/components/Guide/CulturalWarningTrigger.tsx',
  '? (lang === "zh-CN" || lang === "zh-TW" ? "不再显示" : localized("Don\'t show again", "今後表示しない", lang))',
  '? localized("Don\'t show again", "今後表示しない", lang)'),
 ('src/components/Guide/CulturalWarningTrigger.tsx',
  '? (lang === "zh-CN" || lang === "zh-TW" ? "知道了" : localized("Got it", "閉じる", lang))',
  '? localized("Got it", "閉じる", lang)'),
]
for f, old, new in fixes:
    s=io.open(f,encoding='utf-8').read()
    if old not in s:
        # try whitespace variants
        import re
        pat = re.compile(re.escape(old.replace('  ',' ').replace(' ','\\s+')), re.S)
        m = pat.search(s)
        if not m: print('NOT FOUND in', f, '->', old[:60]); continue
        s = s[:m.start()] + new + s[m.end():]
    else:
        s = s.replace(old, new, 1)
    io.open(f,'w',encoding='utf-8',newline='\n').write(s)
    print('patched', f)

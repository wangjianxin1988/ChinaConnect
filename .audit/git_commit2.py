# -*- coding: utf-8 -*-
import subprocess, sys
msg = """feat(i18n): full 12-lang baseline - guide overrides all langs + new [lang] pages + city residue fixes

- guide overrides: 12 langs (5668 keys each) quality gate 0 residue; overrides-ja.ts added
- apps overrides 10 langs (31 keys) + emergency contacts overrides 10 langs (12 keys)
- new pages: [lang]/attractions/index.astro, [lang]/emergency.astro (lang-prefixed routes)
- city data: de/fr full re-translation, ja/ko/ar/ru/th/vi/zh-CN/zh-TW residue fixes
- UI: translations.ts residual JA/ZH strings fixed (10 langs)
- scripts: fix-city-data-cjk*, fix-emergency-contacts, fix-translations-en-residue, rerun-guide-force
- EN zero-Chinese: rendered EN pages clean (17 representative URLs)"""
r = subprocess.run(["git", "commit", "-m", msg], capture_output=True, text=True, encoding="utf-8", errors="replace")
print(r.stdout[-1500:])
print(r.stderr[-500:])
sys.exit(r.returncode)

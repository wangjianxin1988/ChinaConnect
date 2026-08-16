# -*- coding: utf-8 -*-
"""Batch Phase-5 scan: run scan-lang-pages for all languages, write per-lang report.
Usage: python .audit/scan-all-langs.py [--limit N] [--baseline]
"""
import io, os, re, sys, subprocess

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
LANGS = ["en", "ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"]
limit = 0
baseline = "--baseline" in sys.argv
for a in sys.argv[1:]:
    if a.startswith("--limit="):
        limit = int(a.split("=")[1])

os.makedirs(".audit/scan-reports", exist_ok=True)
for lang in LANGS:
    args = ["python", "scripts/scan-lang-pages.py", f"--lang={lang}"]
    if limit:
        args.append(f"--limit={limit}")
    if baseline and lang not in ("en", "ja", "zh-CN", "zh-TW"):
        args.append("--baseline")
    out_path = f".audit/scan-reports/{lang}.log"
    print(f"=== scanning {lang} ===", flush=True)
    with open(out_path, "w", encoding="utf-8") as f:
        r = subprocess.run(args, stdout=f, stderr=subprocess.STDOUT, timeout=1800)
    tail = subprocess.run(
        ["powershell", "-NoProfile", "-Command", f"Get-Content '{out_path}' -Encoding UTF8 | Select-Object -Last 4"],
        capture_output=True, text=True, timeout=60,
    ).stdout.strip()
    print(f"--- {lang} done (rc={r.returncode}) ---")
    print(tail)

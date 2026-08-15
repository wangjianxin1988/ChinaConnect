#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Auto translation chain controller v2 (Phase 2 tail).
- Tracks an `inflight` set (launched + detected) to enforce MAX_CONCURRENT strictly.
- When a tracked lang exits: verify -> commit -> launch next from pending.
- Lanes: ko/th/vi (in flight) -> ru/fr/de -> ar/fa.
- After MAX_FAILURES consecutive failures, drops the lang for manual review.
- Idempotent via git history; safe to restart. Logs to .audit/auto-chain.log
"""
import subprocess, sys, os, time, re, datetime, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
LOG_PATH = os.path.join(ROOT, ".audit", "auto-chain.log")
STATE_PATH = os.path.join(ROOT, ".audit", "auto-chain-state.json")

INITIAL = ["ko", "th", "vi"]
PENDING = ["ru", "fr", "de", "ar", "fa"]
MAX_CONCURRENT = 3
MAX_FAILURES = 3

def log(msg):
    line = f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}"
    print(line, flush=True)
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def running_langs():
    ps = subprocess.run(
        ["powershell", "-NoProfile", "-Command",
         "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | "
         "Where-Object { $_.CommandLine -match 'translate-data-fast' } | "
         "ForEach-Object { $_.CommandLine }"],
        capture_output=True, text=True, timeout=60)
    langs = set()
    for line in (ps.stdout or "").splitlines():
        m = re.search(r"--lang=([\w-]+)", line)
        if m:
            langs.add(m.group(1))
    return langs

def committed(lang):
    p = subprocess.run(["git", "log", "--format=%s", "-1", "--", f"src/data/cities-i18n/{lang}"],
                       capture_output=True, text=True)
    return "full translation" in (p.stdout or "")

def run_verify(lang):
    p = subprocess.run(["node", ".audit/verify_data_i18n.mjs", f"--lang={lang}"],
                       capture_output=True, text=True, timeout=1800)
    return p.returncode, (p.stdout or "") + (p.stderr or "")

def launch(lang):
    log(f"LAUNCH translate {lang}")
    env = dict(os.environ)
    p = subprocess.Popen(
        ["node", "scripts/translate-data-fast.mjs", f"--lang={lang}", "--source-lang=en"],
        stdout=open(os.path.join(".audit", f"translate-{lang}.live.log"), "ab", buffering=0),
        stderr=subprocess.STDOUT, env=env,
        creationflags=getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0))
    log(f"  pid={p.pid}")

def commit(lang):
    subprocess.run(["git", "add", f"src/data/cities-i18n/{lang}"], check=True, capture_output=True, text=True)
    msg = f"feat(i18n): {lang} full translation of city data (35/35 cities, verify 0 residue)"
    p = subprocess.run(["git", "commit", "-m", msg], capture_output=True, text=True)
    if p.returncode != 0:
        log(f"  commit FAILED: {(p.stderr or p.stdout or '').strip()}")
        return False
    head = [l for l in (p.stdout or "").splitlines() if l.strip()][-1] if p.stdout else ""
    log(f"  committed: {head}")
    return True

def finalize(lang):
    """Returns 'committed' | 'relaunched' | 'giveup'."""
    log(f"FINALIZE {lang}: process exited, verifying...")
    rc, out = run_verify(lang)
    log(f"  verify rc={rc}")
    if rc != 0:
        tail = "\n".join(out.splitlines()[-12:])
        log(f"  verify residue:\n  {tail}")
        return "relaunched"
    ok = commit(lang)
    return "committed" if ok else "retry"

def save_state(state):
    with open(STATE_PATH, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)

def main():
    log("===== auto-chain v2 started =====")
    running = running_langs()
    inflight = set(running) or set(INITIAL)
    pending = list(PENDING)
    done = {l for l in INITIAL + PENDING if committed(l)}
    failures = {}
    while True:
        running = running_langs()
        inflight |= running
        # Finalize langs that are inflight, no longer running, and not done.
        for lang in sorted(inflight - running - done):
            if lang not in failures or failures[lang] < MAX_FAILURES:
                result = finalize(lang)
                if result == "committed":
                    done.add(lang)
                    failures.pop(lang, None)
                    inflight.discard(lang)
                elif result == "relaunched":
                    failures[lang] = failures.get(lang, 0) + 1
                    if failures[lang] >= MAX_FAILURES:
                        log(f"  {lang}: {MAX_FAILURES} failures, GIVING UP (manual review)")
                        inflight.discard(lang)
                    else:
                        launch(lang)
                        inflight.add(lang)
        # Fill up to MAX_CONCURRENT using inflight (not just detected running).
        running = running_langs()
        inflight |= running
        while len(inflight - done) < MAX_CONCURRENT and pending:
            nxt = pending.pop(0)
            if nxt in done or nxt in inflight:
                continue
            launch(nxt)
            inflight.add(nxt)
        save_state({
            "done": sorted(done),
            "inflight": sorted(inflight),
            "pending": pending,
            "running": sorted(running),
            "failures": {k: v for k, v in sorted(failures.items())},
        })
        if not pending and not (inflight - done):
            log("===== ALL LANGS DONE =====")
            break
        time.sleep(45)

if __name__ == "__main__":
    main()

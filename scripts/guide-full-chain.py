#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Guide + apps/emergency full chain controller (v2 scripts).
For each language: run translate-guide-strings.mjs, quality-check the override
file, retry up to MAX_FAILURES, then git commit and move on. After guide langs,
run translate-apps-emergency.mjs for the same set, quality-check and commit.
Logs to .audit/guide-full-chain.log, state to .audit/guide-full-chain-state.json
"""
import subprocess, sys, os, time, re, datetime, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
LOG_PATH = os.path.join(ROOT, ".audit", "guide-full-chain.log")
STATE_PATH = os.path.join(ROOT, ".audit", "guide-full-chain-state.json")

GUIDE_LANGS = ["ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"]
MAX_FAILURES = 2
SLEEP = 30

def log(msg):
    line = f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}"
    print(line, flush=True)
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def quality(lang, kind):
    """Call Node quality gate; return (bad, cont) or (999,999) on failure."""
    try:
        r = subprocess.run(
            ["node", ".audit/check-guide-quality.mjs", lang, kind],
            capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=60,
        )
        if r.returncode != 0:
            return 999, 999
        d = json.loads(r.stdout.strip())
        return d["bad"], d["cont"]
    except Exception:
        return 999, 999
def commit(lang, kind):
    if kind == "guide":
        subprocess.run(["git", "add", f"src/data/guide/overrides-{lang}.ts"], check=False, capture_output=True)
    else:
        subprocess.run(["git", "add", f"src/data/apps/overrides-{lang}.ts", f"src/data/emergency/overrides-{lang}.ts"], check=False, capture_output=True)
    r = subprocess.run(["git", "commit", "-q", "-m", f"feat(i18n): {kind} {lang} override dictionary (quality gate passed)"], check=False, capture_output=True)
    return r.returncode == 0

def run_task(kind, lang, logfile):
    script = "scripts/translate-guide-strings.mjs" if kind == "guide" else "scripts/translate-apps-emergency.mjs"
    log(f"RUN {kind} {lang}")
    with open(logfile, "wb") as f:
        env = dict(os.environ)
        env["TRANSLATE_PROVIDER"] = env.get("TRANSLATE_PROVIDER", "deepseek")
        p = subprocess.run(["node", script, f"--lang={lang}"], stdout=f, stderr=subprocess.STDOUT, env=env)
    if kind == "guide" and lang == "zh-TW":
        subprocess.run(["uv", "run", "--no-project", "--with", "zhconv", "python", "scripts/fix-zh-tw-guide.py"], check=False)
    return p.returncode

def main():
    # Guard: refuse to start if another controller is already running.
    me = os.path.basename(__file__)
    ps = subprocess.run(
        ["powershell", "-NoProfile", "-Command",
         "Get-CimInstance Win32_Process -Filter \"Name='python.exe'\" | "
         "Where-Object { $_.CommandLine -match 'guide-full-chain' } | "
         "ForEach-Object { $_.ProcessId }"],
        capture_output=True, text=True, timeout=60)
    other = [int(x) for x in (ps.stdout or "").split() if x.strip().isdigit() and int(x) != os.getpid()]
    if other:
        log(f"ABORT: another guide-full-chain controller already running (pids={other})")
        sys.exit(2)
    log("===== guide-full-chain started =====")
    state = {"done": [], "inflight": None, "failures": {}, "kind": "guide"}
    if os.path.exists(STATE_PATH):
        try:
            state = json.load(open(STATE_PATH, encoding="utf-8"))
        except Exception:
            pass
    done = {tuple(x.split(":", 1)) for x in state.get("done", [])}
    queue = [(k, l) for k in ("guide", "apps") for l in GUIDE_LANGS]
    queue = [t for t in queue if t not in done]
    i = 0
    while i < len(queue):
        kind, lang = queue[i]
        if state.get("kind") and state["kind"] != kind:
            # kind switch: commit boundary marker
            pass
        state["kind"] = kind
        state["inflight"] = f"{kind}:{lang}"
        failures = state.setdefault("failures", {})
        key = f"{kind}:{lang}"
        logfile = os.path.join(ROOT, ".audit", f"fullchain-{kind}-{lang}.log")
        ok = False
        attempt = 0
        while not ok and attempt < MAX_FAILURES:
            attempt += 1
            rc = run_task(kind, lang, logfile)
            bad, cont = quality(lang, kind)
            ok = rc == 0 and bad <= 2 and cont <= 2
            log(f"  {key} attempt {attempt}: rc={rc} badIdentity={bad} contamination={cont} ok={ok}")
            if not ok:
                failures[key] = attempt
                time.sleep(5)
        if ok:
            if commit(lang, kind):
                log(f"  {key} committed")
            done.add((kind, lang))
            failures.pop(key, None)
        else:
            log(f"  {key} GAVE UP after {MAX_FAILURES} attempts (manual review)")
            try:
                rr = subprocess.run(
                    ["node", ".audit/check-guide-quality.mjs", lang, kind, "--keys"],
                    capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=60,
                )
                if rr.returncode == 0:
                    import json as _json
                    res = _json.loads(rr.stdout.strip())
                    respath = os.path.join(ROOT, ".audit", f"guide-residue-{kind}-{lang}.json")
                    _json.dump(res, open(respath, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
                    log(f"  {key} residue dumped -> {respath}")
            except Exception:
                pass
            done.add((kind, lang))  # move on; manual review later
        state["done"] = sorted([f"{k}:{l}" for k, l in done])
        state["inflight"] = None
        json.dump(state, open(STATE_PATH, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
        i += 1
    log("===== guide-full-chain DONE =====")

if __name__ == "__main__":
    main()



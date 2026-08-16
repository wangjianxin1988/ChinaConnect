"""Residue cleanup chain: translate-residue.mjs per language, one at a time,
pausing when the guide/apps chain is running 3 processes (keeps total <= 4).
After each language: full verify (verify_data_i18n + cross-script scan); on
failure relaunch up to MAX_FAILURES, then give up for manual review.
"""
import subprocess, sys, os, time, re, datetime, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
LOG_PATH = os.path.join(ROOT, ".audit", "residue-chain.log")
STATE_PATH = os.path.join(ROOT, ".audit", "residue-chain-state.json")

ORDER = ["ko", "th", "vi", "ru", "fr", "de", "ar", "fa"]
MAX_FAILURES = 3
POLL = 30

def log(msg):
    line = f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}"
    print(line, flush=True)
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def running_translate_procs():
    ps = subprocess.run(
        ["powershell", "-NoProfile", "-Command",
         "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | "
         "Where-Object { $_.CommandLine -match 'translate-(residue|data-fast|guide-strings|apps-emergency)' } | "
         "ForEach-Object { $_.CommandLine }"],
        capture_output=True, text=True, timeout=60)
    procs = []
    for line in (ps.stdout or "").splitlines():
        m = re.search(r"--lang=([\w-]+)", line)
        kind = "residue" if "translate-residue" in line else ("guide" if "guide-strings" in line else ("apps" if "apps-emergency" in line else "data"))
        procs.append((kind, m.group(1) if m else "?"))
    return procs

def guide_busy():
    procs = running_translate_procs()
    guide_apps = [p for p in procs if p[0] in ("guide", "apps")]
    return len(guide_apps) >= 3

def scan_bad(lang):
    p = subprocess.run([sys.executable, ".audit/full_verify.py", lang],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    m = re.search(r"scan_bad=(\d+)", (p.stdout or ""))
    return int(m.group(1)) if m else -1

def launch(lang):
    log(f"LAUNCH residue {lang}")
    env = dict(os.environ)
    p = subprocess.Popen(
        ["node", "scripts/translate-residue.mjs", f"--lang={lang}"],
        stdout=open(os.path.join(".audit", f"residue-{lang}.live.log"), "ab", buffering=0),
        stderr=subprocess.STDOUT, env=env,
        creationflags=getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0))
    log(f"  pid={p.pid}")
    return p.pid

def save_state(state):
    with open(STATE_PATH, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)

def main():
    log("===== residue chain started =====")
    state = {"done": [], "current": None, "pending": list(ORDER), "failures": {}}
    done = set()
    current = None
    pid = None
    failures = {}
    pending = list(ORDER)
    while pending or current:
        if current and pid is not None:
            try:
                os.kill(pid, 0)
                alive = True
            except (OSError, ProcessLookupError):
                alive = False
            if not alive:
                log(f"FINALIZE residue {current}: exited")
                bad = scan_bad(current)
                log(f"  scan_bad={bad}")
                if bad == 0:
                    done.add(current)
                    failures.pop(current, None)
                    log(f"  {current} CLEAN")
                else:
                    failures[current] = failures.get(current, 0) + 1
                    if failures[current] >= MAX_FAILURES:
                        log(f"  {current}: {MAX_FAILURES} failures, GIVING UP (manual review)")
                        done.add(current)
                    else:
                        pid = launch(current)
                        continue
                current = None
                pid = None
        elif current and pid is None:
            current = None
        if current is None and pending:
            if guide_busy():
                save_state({"done": sorted(done), "current": current, "pending": pending, "failures": failures})
                time.sleep(POLL)
                continue
            nxt = pending.pop(0)
            current = nxt
            pid = launch(nxt)
        save_state({"done": sorted(done), "current": current, "pending": pending, "failures": failures})
        time.sleep(POLL)
    log("===== RESIDUE CHAIN DONE =====")

if __name__ == "__main__":
    main()

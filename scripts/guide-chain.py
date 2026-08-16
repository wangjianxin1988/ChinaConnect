#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Guide / Apps-Emergency translation chain controller.
- Runs guide overrides + apps/emergency overrides for the 10 non-ja/en languages.
- Enforces MAX_TOTAL (3) translation processes INCLUDING city-data (translate-data-fast).
- Task kinds: guide (translate-guide-strings.mjs), apps (translate-apps-emergency.mjs).
- On non-zero exit: relaunch (resume) up to MAX_FAILURES, then give up (manual review).
- Idempotent: skips languages whose override file already has all entries.
Logs to .audit/guide-chain.log
"""
import subprocess, sys, os, time, re, datetime, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
LOG_PATH = os.path.join(ROOT, ".audit", "guide-chain.log")
STATE_PATH = os.path.join(ROOT, ".audit", "guide-chain-state.json")

GUIDE_LANGS = ["zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"]  # ko already in flight
APPS_LANGS = ["ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"]
MAX_TOTAL = 3
MAX_FAILURES = 3
def current_guide_count():
    try:
        import json as _json
        d = _json.load(open(".audit/guide-strings.json", encoding="utf-8"))
        return len(d.get("strings", []))
    except Exception:
        return 8773

def log(msg):
    line = f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}"
    print(line, flush=True)
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def running_tasks():
    ps = subprocess.run(
        ["powershell", "-NoProfile", "-Command",
         "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | "
         "Where-Object { $_.CommandLine -match 'translate-(data-fast|guide-strings|apps-emergency)' } | "
         "ForEach-Object { $_.CommandLine }"],
        capture_output=True, text=True, timeout=60)
    tasks = []
    for line in (ps.stdout or "").splitlines():
        m = re.search(r"--lang=([\w-]+)", line)
        if not m:
            continue
        kind = "guide" if "guide-strings" in line else ("apps" if "apps-emergency" in line else "data")
        tasks.append((kind, m.group(1)))
    return tasks

def guide_file_complete(lang):
    path = os.path.join("src/data/guide", f"overrides-{lang}.ts")
    if not os.path.exists(path):
        return 0
    text = open(path, encoding="utf-8").read()
    return len(re.findall(r'^\s*"', text, re.M))

def apps_file_complete(lang):
    count = 0
    for path in [os.path.join("src/data/apps", f"overrides-{lang}.ts"),
                 os.path.join("src/data/emergency", f"overrides-{lang}.ts")]:
        if os.path.exists(path):
            count += len(re.findall(r'^\s*"', open(path, encoding="utf-8").read(), re.M))
    return count

def launch(kind, lang):
    if kind == "guide":
        script = "scripts/translate-guide-strings.mjs"
    else:
        script = "scripts/translate-apps-emergency.mjs"
    log(f"LAUNCH {kind} {lang}")
    env = dict(os.environ)
    with open(os.path.join(".audit", f"chain-{kind}-{lang}.live.log"), "ab", buffering=0) as f:
        p = subprocess.Popen(
            ["node", script, f"--lang={lang}"],
            stdout=f, stderr=subprocess.STDOUT, env=env,
            creationflags=getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0))
    log(f"  pid={p.pid}")
    return p.pid

def is_done(kind, lang):
    if kind == "guide":
        return guide_file_complete(lang) >= current_guide_count()
    return apps_file_complete(lang) >= 30

def build_queue():
    return [("guide", l) for l in GUIDE_LANGS] + [("apps", l) for l in APPS_LANGS]

def data_inflight_from_auto_chain():
    # City-data langs still owned by auto-translate-chain (may be between relaunches).
    try:
        import json as _json
        st = _json.load(open(".audit/auto-chain-state.json", encoding="utf-8"))
        return len([l for l in st.get("inflight", []) if l not in st.get("done", [])])
    except Exception:
        return 0

def save_state(state):
    with open(STATE_PATH, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)

def main():
    log("===== guide/apps chain started =====")
    running = running_tasks()
    tracked = {(k, l) for k, l in running if k in ("guide", "apps")}
    inflight = set(tracked)
    queue = build_queue()
    done = {(k, l) for (k, l) in queue if is_done(k, l)}
    pending = [t for t in queue if t not in done and t not in inflight]
    failures = {}
    while True:
        running = running_tasks()
        data_active = len([t for t in running if t[0] == "data"]) + data_inflight_from_auto_chain()
        tracked = {(k, l) for k, l in running if k in ("guide", "apps")}
        inflight |= tracked
        # Finalize tracked tasks no longer running
        for task in sorted(inflight - tracked - done, key=str):
            kind, lang = task
            ok = is_done(kind, lang)
            log(f"FINALIZE {kind} {lang}: exited, complete={ok}")
            if ok:
                done.add(task)
                failures.pop(task, None)
                inflight.discard(task)
            else:
                failures[task] = failures.get(task, 0) + 1
                if failures[task] >= MAX_FAILURES:
                    log(f"  {kind} {lang}: {MAX_FAILURES} failures, GIVING UP (manual review)")
                    inflight.discard(task)
                else:
                    launch(kind, lang)
                    inflight.add(task)
        # Fill up to MAX_TOTAL total translation processes (including city-data)
        running = running_tasks()
        tracked = {(k, l) for k, l in running if k in ("guide", "apps")}
        data_active = len([t for t in running if t[0] == "data"]) + data_inflight_from_auto_chain()
        inflight |= tracked
        active = len(inflight - done) + data_active
        while active < MAX_TOTAL and pending:
            task = pending.pop(0)
            if task in done or task in inflight:
                continue
            launch(*task)
            inflight.add(task)
            active += 1
        save_state({
            "done": sorted([f"{k}:{l}" for k, l in done]),
            "inflight": sorted([f"{k}:{l}" for k, l in inflight]),
            "pending": [f"{k}:{l}" for k, l in pending],
            "running": sorted([f"{k}:{l}" for k, l in running]),
            "data_active": data_active,
            "failures": {f"{k}:{l}": v for (k, l), v in sorted(failures.items(), key=lambda x: str(x[0]))},
        })
        if not pending and not (inflight - done):
            log("===== GUIDE/APPS CHAIN DONE =====")
            break
        time.sleep(45)

if __name__ == "__main__":
    main()

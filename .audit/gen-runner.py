import re, sys
sys.stdout.reconfigure(encoding="utf-8")
# Prepare a runner script for guide force re-runs with 3-way concurrency.
content = r'''# -*- coding: utf-8 -*-
"""Run guide override force re-translations with bounded concurrency (3).
Usage: python scripts/rerun-guide-force.py
Logs to .audit/rerun-guide-force.log
"""
import subprocess, os, sys, time, datetime, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
LOG = os.path.join(ROOT, ".audit", "rerun-guide-force.log")
LANGS = ["ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa", "ja"]
MAX_CONCURRENT = 3

def log(msg):
    line = f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}"
    print(line, flush=True)
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def quality(lang):
    try:
        r = subprocess.run(["node", ".audit/check-guide-quality.mjs", lang, "guide"],
                           capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=60)
        if r.returncode != 0:
            return None
        return json.loads(r.stdout.strip())
    except Exception:
        return None

def run_one(lang):
    logfile = os.path.join(ROOT, ".audit", f"rerun-guide-{lang}.log")
    log(f"RUN guide {lang} --force")
    with open(logfile, "wb") as f:
        env = dict(os.environ)
        env["TRANSLATE_PROVIDER"] = "deepseek"
        p = subprocess.run(["node", "scripts/translate-guide-strings.mjs", f"--lang={lang}", "--force"],
                           stdout=f, stderr=subprocess.STDOUT, env=env)
    if lang == "zh-TW":
        subprocess.run(["uv", "run", "--no-project", "--with", "zhconv", "python", "scripts/fix-zh-tw-guide.py"], check=False)
    q = quality(lang)
    log(f"  guide {lang} rc={p.returncode} quality={json.dumps(q, ensure_ascii=False) if q else 'FAIL'}")
    return p.returncode == 0 and q and q["bad"] == 0 and q["cont"] == 0

def main():
    pending = list(LANGS)
    active = {}  # pid -> lang
    done = set()
    while pending or active:
        while len(active) < MAX_CONCURRENT and pending:
            lang = pending.pop(0)
            pid = subprocess.Popen([sys.executable, "-c", __import__("sys").executable and "pass"],
                                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            # launch directly
            p = subprocess.Popen(["node", "scripts/translate-guide-strings.mjs", f"--lang={lang}", "--force"],
                                 stdout=open(os.path.join(ROOT, ".audit", f"rerun-guide-{lang}.log"), "wb"),
                                 stderr=subprocess.STDOUT, env={**os.environ, "TRANSLATE_PROVIDER": "deepseek"})
            active[p.pid] = lang
            log(f"  launched {lang} pid={p.pid}")
        # poll
        for pid in list(active):
            p = None
            # check status
            import psutil
            if psutil.pid_exists(pid):
                try:
                    pr = psutil.Process(pid)
                    if pr.status() == psutil.STATUS_ZOMBIE or pr.status() == psutil.STATUS_DEAD:
                        pass
                    else:
                        continue
                except psutil.NoSuchProcess:
                    pass
            # done
            lang = active.pop(pid)
            log(f"  finished {lang} (pid {pid})")
        time.sleep(10)
    log("===== rerun-guide-force DONE =====")

if __name__ == "__main__":
    main()
'''
open("scripts/rerun-guide-force.py", "w", encoding="utf-8", newline="\n").write(content)
print("written (needs cleanup - psutil dependency)")

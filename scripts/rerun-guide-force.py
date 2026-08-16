# -*- coding: utf-8 -*-
"""Re-run guide override translations with --force for all languages.
Bounded concurrency (3). Each language quality-gated after completion.
Usage: python scripts/rerun-guide-force.py
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

def main():
    pending = list(LANGS)
    procs = {}  # pid -> (lang, proc, filehandle)
    while pending or procs:
        while len(procs) < MAX_CONCURRENT and pending:
            lang = pending.pop(0)
            logfile = os.path.join(ROOT, ".audit", f"rerun-guide-{lang}.log")
            f = open(logfile, "wb")
            env = dict(os.environ)
            env["TRANSLATE_PROVIDER"] = "deepseek"
            p = subprocess.Popen(["node", "scripts/translate-guide-strings.mjs", f"--lang={lang}", "--force"],
                                 stdout=f, stderr=subprocess.STDOUT, env=env)
            procs[p.pid] = (lang, p, f)
            log(f"  launched {lang} pid={p.pid}")
        time.sleep(10)
        for pid in list(procs):
            lang, p, f = procs[pid]
            if p.poll() is not None:
                f.close()
                del procs[pid]
                if lang == "zh-TW":
                    subprocess.run(["uv", "run", "--no-project", "--with", "zhconv", "python", "scripts/fix-zh-tw-guide.py"], check=False)
                q = quality(lang)
                ok = bool(q and q["bad"] == 0 and q["cont"] == 0)
                log(f"  finished {lang}: quality={json.dumps(q, ensure_ascii=False) if q else 'FAIL'} ok={ok}")
    log("===== rerun-guide-force DONE =====")

if __name__ == "__main__":
    main()

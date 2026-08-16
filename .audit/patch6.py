import io
p='scripts/guide-full-chain.py'
s=io.open(p,encoding='utf-8').read()

old='''        env["TRANSLATE_PROVIDER"] = env.get("TRANSLATE_PROVIDER", "dashscope")'''
new='''        env["TRANSLATE_PROVIDER"] = env.get("TRANSLATE_PROVIDER", "deepseek")'''
assert old in s
s=s.replace(old,new)

old='''def main():
    log("===== guide-full-chain started =====")'''
new='''def main():
    # Guard: refuse to start if another controller is already running.
    me = os.path.basename(__file__)
    ps = subprocess.run(
        ["powershell", "-NoProfile", "-Command",
         "Get-CimInstance Win32_Process -Filter \\"Name='python.exe'\\" | "
         "Where-Object { $_.CommandLine -match 'guide-full-chain' } | "
         "ForEach-Object { $_.ProcessId }"],
        capture_output=True, text=True, timeout=60)
    other = [int(x) for x in (ps.stdout or "").split() if x.strip().isdigit() and int(x) != os.getpid()]
    if other:
        log(f"ABORT: another guide-full-chain controller already running (pids={other})")
        sys.exit(2)
    log("===== guide-full-chain started =====")'''
assert old in s
s=s.replace(old,new)

io.open(p,'w',encoding='utf-8',newline='\n').write(s)
print('patched guide-full-chain.py OK')

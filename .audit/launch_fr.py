# -*- coding: utf-8 -*-
import subprocess, sys
env = dict(os.environ) if (os:=__import__('os')) else {}
env["TRANSLATE_PROVIDER"] = "deepseek"
log = open(".audit/fix-city-fr.log", "wb")
p = subprocess.Popen(["node", "scripts/fix-city-data-cjk-v2.mjs", "--lang=fr"],
                     stdout=log, stderr=subprocess.STDOUT, env=env, cwd="D:/suoyouxiangmu/chinaconnect")
print("launched fr pid", p.pid)

# -*- coding: utf-8 -*-
import subprocess, os
env = dict(os.environ)
env["TRANSLATE_PROVIDER"] = "deepseek"
for lang in ['vi', 'ru', 'th']:
    log = open('.audit/fix-city-%s.log' % lang, 'wb')
    p = subprocess.Popen(["node", "scripts/fix-city-data-cjk-v2.mjs", "--lang=%s" % lang],
                         stdout=log, stderr=subprocess.STDOUT, env=env, cwd="D:/suoyouxiangmu/chinaconnect")
    print("launched", lang, "pid", p.pid)

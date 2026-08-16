# -*- coding: utf-8 -*-
import io, json, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
en = json.load(io.open('src/data/cities/chongqing.json', encoding='utf-8'))
print(json.dumps(en['payment'][0], ensure_ascii=False, indent=1))

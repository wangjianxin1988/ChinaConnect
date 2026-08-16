# -*- coding: utf-8 -*-
import io, json, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
en = json.load(io.open('src/data/cities/beijing.json', encoding='utf-8'))
de = json.load(io.open('src/data/cities-i18n/de/beijing.json', encoding='utf-8'))
ja = json.load(io.open('src/data/cities-i18n/ja/beijing.json', encoding='utf-8'))
print('EN attrs[0]:', json.dumps({k: en['attractions'][0].get(k) for k in ('name','nameEn','category')}, ensure_ascii=False))
print('DE attrs[0]:', json.dumps({k: de['attractions'][0].get(k) for k in ('name','nameEn','category')}, ensure_ascii=False))
print('JA attrs[0]:', json.dumps({k: ja['attractions'][0].get(k) for k in ('name','nameEn','category')}, ensure_ascii=False))
print('EN city name/nameEn:', en.get('name'), '/', en.get('nameEn'))
print('DE city name/nameEn:', de.get('name'), '/', de.get('nameEn'))
print('JA city name/nameEn:', ja.get('name'), '/', ja.get('nameEn'))

# -*- coding: utf-8 -*-
import io, json, re
d = json.loads(io.open('src/data/cities-i18n/ko/beijing.json', encoding='utf-8').read())
a = d['attractions'][8]
print('before keys:', [k for k in a if re.fullmatch(r"\d+", k)])
LIST_FIELDS = ["highlights", "dishHighlights", "tags", "subtitle", "items", "list"]
def migrate(obj, path=""):
    fixed = 0
    if isinstance(obj, list):
        for v in obj: fixed += migrate(v, path)
    elif isinstance(obj, dict):
        num_keys = [k for k in obj if re.fullmatch(r"\d+", k)]
        if num_keys:
            target_list = None
            for f in LIST_FIELDS:
                if isinstance(obj.get(f), list):
                    target_list = obj[f]; break
            print('  obj at', path, 'num_keys', num_keys, 'target_list?', target_list is not None)
            if target_list is not None:
                for k in sorted(num_keys, key=int):
                    idx = int(k); val = obj[k]
                    while len(target_list) <= idx: target_list.append(None)
                    cur = target_list[idx]
                    if cur is None or (isinstance(cur, str) and re.search(r"[\u3400-\u9fff]", cur) and not re.search(r"[\u3400-\u9fff]", str(val))):
                        target_list[idx] = val
                    del obj[k]
                    fixed += 1
        for k, v in list(obj.items()): fixed += migrate(v, path + "." + k if path else k)
    return fixed
n = migrate(d)
print('migrated', n)
a = d['attractions'][8]
print('after keys:', [k for k in a if re.fullmatch(r"\d+", k)])
print('highlights[2] =', a['highlights'][2])

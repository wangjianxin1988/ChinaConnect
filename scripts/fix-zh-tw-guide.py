#!/usr/bin/env python3
"""Convert CJK VALUES in src/data/guide/overrides-zh-TW.ts to Traditional Chinese (Taiwan).
Keys are left untouched (lookups use the exact source string)."""
import io
import os
import re
import sys

from zhconv import convert

PATH = "src/data/guide/overrides-zh-TW.ts"
if not os.path.exists(PATH):
    print("no overrides-zh-TW.ts yet")
    sys.exit(0)

text = io.open(PATH, encoding="utf-8").read()
changed = 0
cjk = 0

def conv_value(m):
    global changed, cjk
    val = m.group(2)
    if val and any("\u3400" <= ch <= "\u9fff" for ch in val):
        cjk += 1
        cv = convert(val, "zh-tw")
        if cv != val:
            changed += 1
        return m.group(1) + cv + m.group(3)
    return m.group(0)

# Match `"key": "value",` lines; convert value only.
re_entry = re.compile(r'^(\s*"(?:[^"\\]|\\.)*"\s*:\s*")((?:[^"\\]|\\.)*)(",?\s*)$', re.M)
new_text = re_entry.sub(conv_value, text)
if new_text != text:
    tmp = PATH + ".tmp"
    io.open(tmp, "w", encoding="utf-8", newline="\n").write(new_text)
    os.replace(tmp, PATH)
print(f"zh-TW guide: cjk_values={cjk} changed={changed}")

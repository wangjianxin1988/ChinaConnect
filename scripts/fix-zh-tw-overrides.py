#!/usr/bin/env python3
"""Convert simplified-Chinese values in guide/apps/emergency override TS files to Traditional Chinese."""
import io
import re
import sys

from zhconv import convert

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

FILES = [
    "src/data/guide/overrides-zh-TW.ts",
    "src/data/apps/overrides-zh-TW.ts",
    "src/data/emergency/overrides-zh-TW.ts",
]


def convert_file(path):
    if not __import__("os").path.exists(path):
        return None
    text = io.open(path, encoding="utf-8").read()

    def repl(m):
        key, val = m.group(1), m.group(2)
        new_val = convert(val, "zh-tw")
        if new_val != val:
            return f'{m.group(0).replace(val, new_val)}'
        return m.group(0)

    # Match "key": "value", lines; convert only the value part
    pattern = re.compile(r'^(\s*"[^"]*"\s*:\s*")((?:[^"\\]|\\.)*)(",?\s*)$', re.M)
    changed = 0

    def line_repl(m):
        nonlocal changed
        val = m.group(2)
        if not any("\u3400" <= ch <= "\u9fff" for ch in val):
            return m.group(0)
        new_val = convert(val, "zh-tw")
        if new_val != val:
            changed += 1
            return m.group(1) + new_val + m.group(3)
        return m.group(0)

    new_text = pattern.sub(line_repl, text)
    tmp = path + ".tmp"
    io.open(tmp, "w", encoding="utf-8", newline="\n").write(new_text)
    __import__("os").replace(tmp, path)
    return changed


total = 0
for f in FILES:
    n = convert_file(f)
    if n is None:
        print(f"MISSING {f}")
    else:
        total += n
        print(f"{f}: changed={n}")
print(f"TOTAL changed={total}")

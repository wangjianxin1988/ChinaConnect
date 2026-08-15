#!/usr/bin/env python3
"""Convert all CJK string values in src/data/cities-i18n/zh-TW/*.json to Traditional Chinese (Taiwan)."""
import glob
import io
import json
import os
import sys

from zhconv import convert

DIR = "src/data/cities-i18n/zh-TW"


def walk(value, out):
    if isinstance(value, dict):
        for k, v in value.items():
            walk(v, out)
    elif isinstance(value, list):
        for item in value:
            walk(item, out)
    elif isinstance(value, str) and value and any("\u3400" <= ch <= "\u9fff" for ch in value):
        out.append(value)


def transform(value, stats):
    if isinstance(value, dict):
        return {k: transform(v, stats) for k, v in value.items()}
    if isinstance(value, list):
        return [transform(item, stats) for item in value]
    if isinstance(value, str) and value and any("\u3400" <= ch <= "\u9fff" for ch in value):
        converted = convert(value, "zh-tw")
        if converted != value:
            stats["changed"] += 1
        stats["cjk"] += 1
        return converted
    return value


def main():
    files = sorted(glob.glob(os.path.join(DIR, "*.json")))
    stats = {"cjk": 0, "changed": 0, "cities": 0}
    for path in files:
        data = json.load(io.open(path, encoding="utf-8"))
        new_data = transform(data, stats)
        if new_data != data:
            tmp = path + ".tmp"
            io.open(tmp, "w", encoding="utf-8", newline="\n").write(json.dumps(new_data, ensure_ascii=False, indent=2))
            os.replace(tmp, path)
        stats["cities"] += 1
    print(f"cities={stats['cities']} cjk_values={stats['cjk']} changed={stats['changed']}")


if __name__ == "__main__":
    main()

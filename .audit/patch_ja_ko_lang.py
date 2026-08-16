import re

path = r"src/i18n/translations.ts"
with open(path, "rb") as f:
    raw = f.read()
text = raw.decode("utf-8-sig")

def block_range(src, lang):
    start_m = re.search(r'^  "' + lang + r'": \{|^  ' + lang + r': \{', src, re.M)
    if not start_m:
        return None, None
    start = start_m.start()
    next_m = re.search(r'^  "?(?:[a-z]{2}(?:-[A-Z]{2})?)"?:\s*\{', src[start + 1:], re.M)
    end = start + 1 + (next_m.start() if next_m else len(src) - start - 1)
    return start, end

def patch_in_region(region, mapping):
    n = 0
    for key, val in mapping.items():
        pat = re.compile(r'(^[ \t]*)(' + re.escape(key) + r')(\s*:\s*)"[a-z]+\.[A-Za-z0-9_]+"(\s*,?\s*)$', re.M)
        newval = val.replace("\\", "\\\\").replace('"', '\\"')
        region, c = pat.subn(lambda m: m.group(1) + m.group(2) + m.group(3) + '"' + newval + '"' + m.group(4), region)
        n += c
    return region, n

out = text
for lang, mapping in [("ja", {"code": "ja", "dir": "ltr", "name": "Japanese", "nativeName": "\u65e5\u672c\u8a9e"}),
                      ("ko", {"code": "ko", "dir": "ltr"})]:
    start, end = block_range(out, lang)
    if start is None:
        print(lang, "block not found!")
        continue
    region, n = patch_in_region(out[start:end], mapping)
    out = out[:start] + region + out[end:]
    print(lang, "replaced:", n)

with open(path, "wb") as f:
    f.write(out.encode("utf-8-sig") if raw.startswith(b"\xef\xbb\xbf") else out.encode("utf-8"))
print("CRLF:", out.count("\r\n"), "LF-only:", out.count("\n") - out.count("\r\n"))

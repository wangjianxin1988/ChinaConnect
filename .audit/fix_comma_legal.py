import re
path = r"src/i18n/translations.ts"
with open(path, "rb") as f:
    raw = f.read()
text = raw.decode("utf-8-sig")
nl = "\r\n" if "\r\n" in text else "\n"
pattern = nl + "    }" + nl + "    privacyPage: {"
replacement = nl + "    }," + nl + "    privacyPage: {"
count = text.count(pattern)
text = text.replace(pattern, replacement)
with open(path, "wb") as f:
    f.write(text.encode("utf-8-sig") if raw.startswith(b"\xef\xbb\xbf") else text.encode("utf-8"))
print("fixed commas before privacyPage:", count)

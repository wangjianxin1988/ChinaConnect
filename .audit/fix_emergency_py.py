# -*- coding: utf-8 -*-
import io
p = r'src/pages/[lang]/emergency.astro'
s = io.open(p, encoding='utf-8').read()
head = "---\nexport function getStaticPaths() {\n  const langs = [\"ja\",\"ko\",\"zh-CN\",\"zh-TW\",\"th\",\"vi\",\"ru\",\"fr\",\"de\",\"ar\",\"fa\"];\n  return langs.map((lang) => ({ params: { lang } }));\n}\n\n---\n"
assert s.startswith(head), repr(s[:200])
s = s[len(head):]
marker = 'import type { Language } from "@/i18n/translations";\n\n'
assert marker in s, "marker missing"
fn = "export function getStaticPaths() {\n  const langs = [\"ja\",\"ko\",\"zh-CN\",\"zh-TW\",\"th\",\"vi\",\"ru\",\"fr\",\"de\",\"ar\",\"fa\"];\n  return langs.map((lang) => ({ params: { lang } }));\n}\n\n"
s = s.replace(marker, marker + "\n" + fn, 1)
io.open(p, "w", encoding="utf-8", newline="\n").write(s)
print("fixed, new length", len(s))

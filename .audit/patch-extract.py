import re
p = "scripts/fix-translations-kana.mjs"
src = open(p, encoding="utf-8").read()
old = '''function extractJson(content) {
  const cleaned = String(content || "").trim().replace(/^```[a-zA-Z]*\\n?/i, "").replace(/\\n?```\\s*$/g, "");
  const start = cleaned.indexOf("{");
  if (start === -1) throw new Error("No JSON object");
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < cleaned.length; i += 1) {
    const ch = cleaned[i];
    if (esc) { esc = false; continue; }
    if (ch === "\\\\") { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === "{") depth += 1;
    else if (ch === "}") { depth -= 1; if (depth === 0) return JSON.parse(cleaned.slice(start, i + 1)); }
  }
  throw new Error("No closing JSON object");
}'''
new = '''function extractJson(content) {
  const cleaned = String(content || "").trim().replace(/^```[a-zA-Z]*\\n?/i, "").replace(/\\n?```\\s*$/g, "");
  try { return JSON.parse(cleaned); } catch { /* fall through */ }
  const start = cleaned.indexOf("{");
  if (start === -1) throw new Error("No JSON object");
  let depth = 0, inStr = false, esc = false, end = -1;
  for (let i = start; i < cleaned.length; i += 1) {
    const ch = cleaned[i];
    if (esc) { esc = false; continue; }
    if (ch === "\\\\") { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === "{") depth += 1;
    else if (ch === "}") { depth -= 1; if (depth === 0) { end = i; break; } }
  }
  if (end !== -1) {
    try { return JSON.parse(cleaned.slice(start, end + 1)); } catch { /* fall through */ }
  }
  // Last resort: regex-extract k0..kN values from a malformed response.
  const out = {};
  const re = /"k(\\d+)"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"/g;
  let m;
  while ((m = re.exec(cleaned))) out[`k${m[1]}`] = m[2].replace(/\\\\"/g, '"').replace(/\\\\\\\\/g, "\\\\").replace(/\\\\n/g, "\\n");
  if (Object.keys(out).length > 0) return out;
  throw new Error("No closing JSON object");
}'''
assert old in src, "extractJson block not found"
src = src.replace(old, new)
open(p, "w", encoding="utf-8", newline="\n").write(src)
print("patched extractJson")

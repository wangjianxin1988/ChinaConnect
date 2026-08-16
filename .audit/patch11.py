import io
p='scripts/build-guide-strings.mjs'
s=io.open(p,encoding='utf-8').read()

old='''function walk(value, out) {
  if (typeof value === "string") {
    out.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) walk(item, out);
    return;
  }
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (key === "icon" || key === "emoji") continue;
      walk(value[key], out);
    }
    return;
  }
}'''
new='''// Object fields that are internal identifiers / not user-facing display text.
const SKIP_FIELDS = new Set([
  "id", "key", "slug", "href", "url", "phone", "email", "code",
  "icon", "emoji", "colorClass", "bg", "text", "border",
]);
// Tailwind-style CSS class strings must never be treated as translatable.
const CSS_CLASS_RE =
  /^(?:[a-z]+-[a-z0-9]+|hover:|focus:|dark:|md:|lg:|sm:|px-\\d|py-\\d)(?:\\s+(?:[a-z]+-[a-z0-9]+|hover:|focus:|dark:|md:|lg:|sm:))*$/;

function walk(value, out) {
  if (typeof value === "string") {
    if (!CSS_CLASS_RE.test(value)) out.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) walk(item, out);
    return;
  }
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (SKIP_FIELDS.has(key)) continue;
      walk(value[key], out);
    }
    return;
  }
}'''
assert old in s, 'walk block not found'
s=s.replace(old,new)
io.open(p,'w',encoding='utf-8',newline='\n').write(s)
print('patched build-guide-strings.mjs')

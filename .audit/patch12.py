import io
p='scripts/lib/translation-accept.mjs'
s=io.open(p,encoding='utf-8').read()

# extend BRAND set with regions + lowercased variants
old='"China", "Chinese", "ChinaConnect",'
new='"China", "Chinese", "ChinaConnect", "Tibet", "Lhasa", "Xinjiang", "Urumqi", "Sichuan", "Guangdong", "Canton", "tibet", "lhasa", "xinjiang", "urumqi", "sichuan", "guangdong", "canton", "beijing", "shanghai", "guangzhou", "shenzhen", "chengdu", "K-ETA", "eTA",'
assert old in s
s=s.replace(old,new,1)

old='''// Number + unit (e.g. "575 mm", "1,060 mm", "10 GB").
const UNIT_RE = /^[\\d,]+(?:\\.[\\d]+)?\\s*(?:mm|cm|km|m|kg|g|ml|l|GB|MB|TB|Mbps|kWh|hrs?|h|min|mins?|days?|weeks?|months?|years?|kmh|kph)$/i;
// Short all-caps brands/codes (e.g. "HSBC", "CNY", "KFC", "SIM").
const CAPS_RE = /^[A-Z0-9]{2,7}$/;'''
new='''// Number + unit (e.g. "575 mm", "1,060 mm", "10 GB").
const UNIT_RE = /^[\\d,]+(?:\\.[\\d]+)?\\s*(?:mm|cm|km|m|kg|g|ml|l|GB|MB|TB|Mbps|kWh|hrs?|h|min|mins?|days?|weeks?|months?|years?|kmh|kph)$/i;
// Short all-caps brands/codes (e.g. "HSBC", "CNY", "KFC", "SIM").
const CAPS_RE = /^[A-Z0-9]{2,7}$/;
// Emails.
const EMAIL_RE = /^[\\w.+-]+@[\\w-]+\\.[\\w.-]+$/;
// Currency code + symbol amount (e.g. "AUD $20", "CAD $7").
const CODE_AMOUNT_RE = /^[A-Z]{3}\\s*[¥$€£₩₹₽]\\s*\\d+(?:\\.\\d+)?$/;
// Example / reference values (e.g. "AB1234567", "INV-2026-0601", "91310000XXXXXXXX").
const EXAMPLE_RE = /^(?:[A-Z]{2,4}\\d{4,}|INV-\\d+\\S*|9\\d{9,})$/;
// Short lowercase/mixed identifiers starting lowercase (e.g. "en", "eTA").
const SHORT_ID_RE = /^[a-z][a-zA-Z0-9]{1,3}$/;
// Dashed identifiers (e.g. "K-ETA", "guest-visa") up to 16 chars.
const DASHED_ID_RE = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+){1,2}$/;'''
assert old in s
s=s.replace(old,new)

old='''  if (UNIT_RE.test(t)) return true;
  if (CAPS_RE.test(t)) return true;
  if (BRAND_TOKENS.has(t)) return true;'''
new='''  if (UNIT_RE.test(t)) return true;
  if (CAPS_RE.test(t)) return true;
  if (EMAIL_RE.test(t) && t.length <= 64) return true;
  if (CODE_AMOUNT_RE.test(t)) return true;
  if (EXAMPLE_RE.test(t)) return true;
  if (SHORT_ID_RE.test(t)) return true;
  if (DASHED_ID_RE.test(t) && t.length <= 16) return true;
  if (BRAND_TOKENS.has(t)) return true;'''
assert old in s
s=s.replace(old,new)

io.open(p,'w',encoding='utf-8',newline='\n').write(s)
print('patched translation-accept.mjs keepable')

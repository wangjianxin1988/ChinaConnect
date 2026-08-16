import io
p='scripts/lib/translation-accept.mjs'
s=io.open(p,encoding='utf-8').read()
old='''// Keepable patterns: numbers/prices/units/URLs/phone-like tokens.
const KEEPABLE_RE =
  /^(?:[\\d\\s.,¥$€£₩₹₽+\\-()/%×·&'":;~!?]+|(?:https?:\\/\\/|tel:|mailto:).*)$/;

export function isKeepableToken(s) {
  if (!s) return false;
  const t = s.trim();
  if (KEEPABLE_RE.test(t)) return true;
  if (BRAND_TOKENS.has(t)) return true;
  if (t.endsWith("¥") || t.startsWith("¥")) return true;
  return false;
}'''
new='''// Keepable patterns: numbers/prices/units/URLs/phone-like tokens.
const KEEPABLE_RE =
  /^(?:[\\d\\s.,¥$€£₩₹₽+\\-()/%×·&'":;~!?]+|(?:https?:\\/\\/|tel:|mailto:).*)$/;
// Pure emoji / regional-indicator flags (e.g. "🇨🇦", "⚠️").
const EMOJI_ONLY_RE = /^[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u200d\\ufe0f\\s]+$/u;
// Pure temperatures (e.g. "-3°C / -16°C", "27°F").
const TEMP_RE = /^[\\d\\s\\-–—./°℃℉CF]+$/;
// Bare domains (e.g. "www.12306.cn", "trip.com").
const DOMAIN_RE = /^(?:www\\.)?[\\w-]+(?:\\.[\\w-]+)+(?:\\/.*)?$/i;
// Pure "N currency-code" amounts (e.g. "AUD $20", "5 CNY", "100 RMB").
const CURRENCY_RE =
  /^\\d+(?:\\.\\d+)?\\s*(?:CNY|RMB|USD|EUR|GBP|JPY|KRW|AUD|CAD|HKD|SGD|THB|VND|INR|PHP|MYR|IDR|TWD|ARS|BRL|RUB|TRY|AED|SAR|MXN|HUF|PLN|SEK|NOK|DKK|CHF|NZD|ZAR|¥|$|€|£|₩|₹|₽)$/i;
// Number + unit (e.g. "575 mm", "1,060 mm", "10 GB").
const UNIT_RE = /^[\\d,]+(?:\\.[\\d]+)?\\s*(?:mm|cm|km|m|kg|g|ml|l|GB|MB|TB|Mbps|kWh|hrs?|h|min|mins?|days?|weeks?|months?|years?|kmh|kph)$/i;
// Short all-caps brands/codes (e.g. "HSBC", "CNY", "KFC", "SIM").
const CAPS_RE = /^[A-Z0-9]{2,7}$/;

export function isKeepableToken(s) {
  if (!s) return false;
  const t = s.trim();
  if (KEEPABLE_RE.test(t)) return true;
  if (EMOJI_ONLY_RE.test(t)) return true;
  if (TEMP_RE.test(t) && /[°℃℉]/.test(t)) return true;
  if (DOMAIN_RE.test(t)) return true;
  if (CURRENCY_RE.test(t)) return true;
  if (UNIT_RE.test(t)) return true;
  if (CAPS_RE.test(t)) return true;
  if (BRAND_TOKENS.has(t)) return true;
  if (t.endsWith("¥") || t.startsWith("¥")) return true;
  return false;
}'''
assert old in s, 'keepable block not found'
s=s.replace(old,new)
io.open(p,'w',encoding='utf-8',newline='\n').write(s)
print('patched translation-accept.mjs')

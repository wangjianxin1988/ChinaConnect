// Stricter translation acceptance for guide/apps/emergency overrides.
// Fixes the isTranslated hole where short identity values were accepted.

import { isTranslated, hasLanguageScript } from "./translation-keys.mjs";

const BRAND_TOKENS = new Set([
  "Alipay", "WeChat", "WeChat Pay", "WeChat Pay HK", "Meituan", "Dianping",
  "DiDi", "Didi", "Amap", "AutoNavi", "Baidu Maps", "Baidu", "Trip.com", "Ctrip",
  "Fliggy", "Booking.com", "Agoda", "Airbnb", "12306", "Google", "Google Maps",
  "Google Translate", "ChatGPT", "Pleco", "Pleco Chinese Dictionary",
  "TripAdvisor", "Wise", "TransferWise", "Xiaohongshu", "RED", "Airalo",
  "Holafly", "eSIM", "SIM", "WiFi", "Wi-Fi", "UnionPay", "China Mobile",
  "China Unicom", "China Telecom", "KFC", "McDonald's", "Starbucks", "Huawei",
  "Xiaomi", "QQ", "Weibo", "Taobao", "JD.com", "Pinduoduo", "NetEase",
  "163 Mail", "Metro Now", "Nihao China", "AI Translation", "Oppo", "Vivo",
  "Beijing", "Changsha", "Chengde", "Chengdu", "Chongqing", "Dali", "Dalian",
  "Dunhuang", "Fuzhou", "Guangzhou", "Guilin", "Hangzhou", "Harbin", "Hulunbuir",
  "Jinan", "Kunming", "Lanzhou", "Lijiang", "Luoyang", "Nanjing", "Ningbo",
  "Qingdao", "Quanzhou", "Sanya", "Shanghai", "Shenzhen", "Suzhou", "Tianjin",
  "Weihai", "Wuhan", "Xi'an", "Xiamen", "Xining", "Yantai", "Zhangjiajie",
  "三亚", "上海", "丽江", "兰州", "北京", "南京", "厦门", "呼伦贝尔", "哈尔滨",
  "大理", "大连", "天津", "威海", "宁波", "广州", "张家界", "成都", "承德", "敦煌",
  "昆明", "杭州", "桂林", "武汉", "泉州", "洛阳", "济南", "深圳", "烟台", "福州",
  "苏州", "西宁", "西安", "重庆", "长沙", "青岛", "China", "Chinese", "ChinaConnect", "Tibet", "Lhasa", "Xinjiang", "Urumqi", "Sichuan", "Guangdong", "Canton", "tibet", "lhasa", "xinjiang", "urumqi", "sichuan", "guangdong", "canton", "beijing", "shanghai", "guangzhou", "shenzhen", "chengdu", "K-ETA", "eTA", "Halal", "Compliment", "NordVPN", "MultiHop", "Windscribe", "Wardens", "Kill switch", "App Store", "Android", "Li Wei", "Zhang Ming", "Religion", "Description", "Service", "App Store / Android", "Quick Info", "Customize protocol", "Navigation", "Problem:", "Proxy:", "Service",
  "App Store", "Google Play", "Metro", "Tiananmen", "Tiananmen Square",
  "Great Wall", "Terracotta Army", "Panda", "Pandas", "Forbidden City",
]);

// Keepable patterns: numbers/prices/units/URLs/phone-like tokens.
const KEEPABLE_RE =
  /^(?:[\d\s.,¥$€£₩₹₽+\-()/%×·&'":;~!?]+|(?:https?:\/\/|tel:|mailto:).*)$/;
// Pure emoji / regional-indicator flags (e.g. "🇨🇦", "⚠️").
const EMOJI_ONLY_RE = /^[\p{Extended_Pictographic}\p{Regional_Indicator}\u200d\ufe0f\s]+$/u;
// Pure temperatures (e.g. "-3°C / -16°C", "27°F").
const TEMP_RE = /^[\d\s\-–—./°℃℉CF]+$/;
// Bare domains (e.g. "www.12306.cn", "trip.com").
const DOMAIN_RE = /^(?:www\.)?[\w-]+(?:\.[\w-]+)+(?:\/.*)?$/i;
// Pure "N currency-code" amounts (e.g. "AUD $20", "5 CNY", "100 RMB").
const CURRENCY_RE =
  /^\d+(?:\.\d+)?\s*(?:CNY|RMB|USD|EUR|GBP|JPY|KRW|AUD|CAD|HKD|SGD|THB|VND|INR|PHP|MYR|IDR|TWD|ARS|BRL|RUB|TRY|AED|SAR|MXN|HUF|PLN|SEK|NOK|DKK|CHF|NZD|ZAR|¥|$|€|£|₩|₹|₽)$/i;
// Number + unit (e.g. "575 mm", "1,060 mm", "10 GB").
const UNIT_RE = /^[\d,]+(?:\.[\d]+)?\s*(?:mm|cm|km|m|kg|g|ml|l|GB|MB|TB|Mbps|kWh|hrs?|h|min|mins?|days?|weeks?|months?|years?|kmh|kph)$/i;
// Short all-caps brands/codes (e.g. "HSBC", "CNY", "KFC", "SIM").
const CAPS_RE = /^[A-Z0-9]{2,7}$/;
// Emails.
const EMAIL_RE = /^[\w.+-]+@[\w-]+\.[\w.-]+$/;
// Currency code + symbol amount (e.g. "AUD $20", "CAD $7").
const CODE_AMOUNT_RE = /^[A-Z]{3}\s*[¥$€£₩₹₽]\s*\d+(?:\.\d+)?$/;
// Example / reference values (e.g. "AB1234567", "INV-2026-0601", "91310000XXXXXXXX").
const EXAMPLE_RE = /^(?:[A-Z]{2,4}\d{4,}|INV-\d+\S*|9\d{9,})$/;
// Short lowercase/mixed identifiers starting lowercase (e.g. "en", "eTA").
const SHORT_ID_RE = /^[a-z][a-zA-Z0-9]{1,3}$/;
// Dashed identifiers (e.g. "K-ETA", "guest-visa") up to 16 chars.
const DASHED_ID_RE = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+){1,2}$/;

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
  if (EMAIL_RE.test(t) && t.length <= 64) return true;
  if (CODE_AMOUNT_RE.test(t)) return true;
  if (EXAMPLE_RE.test(t)) return true;
  if (SHORT_ID_RE.test(t)) return true;
  if (DASHED_ID_RE.test(t) && t.length <= 16) return true;
  if (BRAND_TOKENS.has(t)) return true;
  if ((t.endsWith("¥") || t.startsWith("¥")) && !/[A-Za-z]/.test(t)) return true;
  return false;
}

/**
 * Accept a translated value for a guide/apps/emergency override.
 * - identity values are only accepted for keepable tokens (brands, prices, URLs)
 * - CJK in non-Chinese targets is rejected
 * - target-script presence is accepted
 */
export function acceptTranslation(value, lang, source) {
  if (typeof value !== "string" || value.length === 0) return false;
  if (hasLanguageScript(value, lang)) return true;
  if (value === source) {
    return isKeepableToken(source);
  }
  if (lang !== "zh-CN" && lang !== "zh-TW" && /[\u3400-\u9fff]/.test(value)) return false;
  return isTranslated(value, lang, source);
}

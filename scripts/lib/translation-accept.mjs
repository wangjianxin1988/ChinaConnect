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
  "苏州", "西宁", "西安", "重庆", "长沙", "青岛", "China", "Chinese", "ChinaConnect",
  "App Store", "Google Play", "Metro", "Tiananmen", "Tiananmen Square",
  "Great Wall", "Terracotta Army", "Panda", "Pandas", "Forbidden City",
]);

// Keepable patterns: numbers/prices/units/URLs/phone-like tokens.
const KEEPABLE_RE =
  /^(?:[\d\s.,¥$€£₩₹₽+\-()/%×·&'":;~!?]+|(?:https?:\/\/|tel:|mailto:).*)$/;

export function isKeepableToken(s) {
  if (!s) return false;
  const t = s.trim();
  if (KEEPABLE_RE.test(t)) return true;
  if (BRAND_TOKENS.has(t)) return true;
  if (t.endsWith("¥") || t.startsWith("¥")) return true;
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

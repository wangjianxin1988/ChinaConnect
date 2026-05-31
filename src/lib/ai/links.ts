/**
 * ChinaConnect Link Generator
 * Generates clickable links for all data sources
 * Focus: Chinese domestic data sources for foreign visitors
 */

// ============================================
// Map Navigation Links (高德地图)
// ============================================

export function getAmapNavigationLink(lat: number, lng: number, name: string): string {
  return `https://uri.amap.com/marker?position=${lng},${lat}&name=${encodeURIComponent(name)}&coordinate=gaode&callnative=1`;
}

export function getAmapRouteLink(fromLng: number, fromLat: number, toLng: number, toLat: number, toName: string): string {
  return `https://uri.amap.com/navigation?from=${fromLng},${fromLat}&to=${toLng},${toLat},${encodeURIComponent(toName)}&mode=car&coordinate=gaode&callnative=1`;
}

export function getAmapSearchLink(keyword: string, city: string): string {
  return `https://uri.amap.com/search?keyword=${encodeURIComponent(keyword)}&city=${encodeURIComponent(city)}&callnative=1`;
}

// ============================================
// Weather Links (中国天气)
// ============================================

export function getChinaWeatherLink(cityName: string): string {
  // 中国天气网
  return `http://www.weather.com.cn/weather1d/0101010100.shtml`;
}

export function getOpenMeteoLink(lat: number, lng: number): string {
  return `https://open-meteo.com/en/docs#latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max`;
}

// ============================================
// Transport Links (交通)
// ============================================

export function get12306Link(from: string, to: string): string {
  // 12306火车票查询
  return `https://www.12306.cn/index/`;
}

export function getCtripFlightLink(from: string, to: string): string {
  // 携程国际版航班查询
  return `https://flights.ctrip.com/online/list/oneway-${from}-${to}`;
}

export function getCtripTrainLink(from: string, to: string): string {
  // 携程火车票
  return `https://trains.ctrip.com/webapp/train/list?ticketType=0&dStation=${from}&aStation=${to}`;
}

export function getQunarLink(from: string, to: string): string {
  // 去哪儿航班
  return `https://flight.qunar.com/site/oneway_list.htm?searchDepartureAirport=${from}&searchArrivalAirport=${to}`;
}

// ============================================
// Hotel Booking Links (酒店预订)
// ============================================

export function getCtripHotelLink(city: string): string {
  return `https://hotels.ctrip.com/hotels/list?countryId=1&city=${city}`;
}

export function getBookingLink(city: string): string {
  return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}&lang=en-us`;
}

export function getAgodaLink(city: string): string {
  return `https://www.agoda.com/search?city=${city}&lang=en-us`;
}

// ============================================
// Restaurant Links (餐厅)
// ============================================

export function getDianpingLink(name: string, city: string): string {
  // 大众点评
  return `https://www.dianping.com/search/keyword/0/0_${encodeURIComponent(name)}`;
}

// ============================================
// APP Download Links (英文版)
// ============================================

export interface AppDownloadLink {
  name: string;
  nameZh: string;
  description: string;
  ios: string;
  android: string;
  website?: string;
}

export const APP_DOWNLOAD_LINKS: Record<string, AppDownloadLink> = {
  amap: {
    name: "Amap (Gaode Maps)",
    nameZh: "高德地图",
    description: "Best navigation app for China - driving, walking, transit, real-time traffic",
    ios: "https://apps.apple.com/app/apple-store/id461703208",
    android: "https://play.google.com/store/apps/details?id=com.autonavi.minimap",
    website: "https://www.amap.com",
  },
  baiduMap: {
    name: "Baidu Maps",
    nameZh: "百度地图",
    description: "Alternative navigation with street view and indoor maps",
    ios: "https://apps.apple.com/app/apple-store/id452186370",
    android: "https://play.google.com/store/apps/details?id=com.baidu.BaiduMap",
  },
  ctrip: {
    name: "Trip.com (Ctrip)",
    nameZh: "携程旅行",
    description: "Book flights, hotels, trains - international version of Ctrip",
    ios: "https://apps.apple.com/app/ctrip/id379395415",
    android: "https://play.google.com/store/apps/details?id=ctrip.android.view",
    website: "https://www.trip.com",
  },
  trip12306: {
    name: "12306 (Railway Tickets)",
    nameZh: "铁路12306",
    description: "Official Chinese railway ticket booking app",
    ios: "https://apps.apple.com/app/12306/id567313693",
    android: "https://play.google.com/store/apps/details?id=com.MobileTicket",
    website: "https://www.12306.cn",
  },
  wechat: {
    name: "WeChat",
    nameZh: "微信",
    description: "Essential messaging app - also used for payments, mini-programs, and more",
    ios: "https://apps.apple.com/app/wechat/id414478124",
    android: "https://play.google.com/store/apps/details?id=com.tencent.mm",
  },
  alipay: {
    name: "Alipay",
    nameZh: "支付宝",
    description: "Mobile payment app - pay with QR code everywhere in China",
    ios: "https://apps.apple.com/app/alipay/id333206289",
    android: "https://play.google.com/store/apps/details?id=com.eg.android.AlipayGphone",
  },
  metroMan: {
    name: "MetroMan",
    nameZh: "地铁通",
    description: "Offline metro maps for all Chinese cities with route planning",
    ios: "https://apps.apple.com/app/metroman/id585829483",
    android: "https://play.google.com/store/apps/details?id=com.xinmetrorail.metroman",
  },
  pleco: {
    name: "Pleco Chinese Dictionary",
    nameZh: "Pleco词典",
    description: "Best Chinese-English dictionary with OCR camera translation",
    ios: "https://apps.apple.com/app/pleco/id341922306",
    android: "https://play.google.com/store/apps/details?id=com.pleco.chineseclassic",
  },
  baiduTranslate: {
    name: "Baidu Translate",
    nameZh: "百度翻译",
    description: "Translate text, voice, and photos between Chinese and English",
    ios: "https://apps.apple.com/app/baidu-translate/id456753486",
    android: "https://play.google.com/store/apps/details?id=com.baidu.baidutranslate",
  },
};

// ============================================
// Generate Links for Tool Results
// ============================================

export function generateHotelLinks(city: string, hotelName?: string, lat?: number, lng?: number) {
  const links: Record<string, string> = {
    "🗺️ Navigate on Amap": lat && lng ? getAmapNavigationLink(lat, lng, hotelName || hotel) : getAmapSearchLink(hotelName || "hotel", city),
    "📱 Book on Trip.com": getCtripHotelLink(city),
    "🌐 Book on Booking.com": getBookingLink(city),
    "🏨 Book on Agoda": getAgodaLink(city),
  };
  return links;
}

export function generateRestaurantLinks(city: string, restaurantName?: string, lat?: number, lng?: number) {
  const links: Record<string, string> = {
    "🗺️ Navigate on Amap": lat && lng ? getAmapNavigationLink(lat, lng, restaurantName || "") : getAmapSearchLink(restaurantName || "restaurant", city),
    "⭐ Reviews on Dianping": getDianpingLink(restaurantName || "", city),
  };
  return links;
}

export function generateTransportLinks(from: string, to: string) {
  return {
    "🚄 Book Train (12306)": get12306Link(from, to),
    "🚄 Book Train (Trip.com)": getCtripTrainLink(from, to),
    "✈️ Search Flights (Trip.com)": getCtripFlightLink(from, to),
    "✈️ Search Flights (Qunar)": getQunarLink(from, to),
  };
}

export function generateWeatherLinks(lat: number, lng: number) {
  return {
    "🌤️ OpenMeteo Forecast": getOpenMeteoLink(lat, lng),
    "📊 Detailed Weather Data": `https://open-meteo.com/en/docs#latitude=${lat}&longitude=${lng}`,
  };
}

export function generateAttractionLinks(city: string, name?: string, lat?: number, lng?: number) {
  return {
    "🗺️ Navigate on Amap": lat && lng ? getAmapNavigationLink(lat, lng, name || "") : getAmapSearchLink(name || "attraction", city),
    "📍 Search on Amap": getAmapSearchLink(name || city, city),
  };
}

// ============================================
// Format Links for AI Response
// ============================================

export function formatLinksForAI(links: Record<string, string>): string {
  return Object.entries(links)
    .map(([label, url]) => `[${label}](${url})`)
    .join(" | ");
}

export function getAppDownloadSection(): string {
  const apps = Object.values(APP_DOWNLOAD_LINKS);
  return apps.map(app => 
    `**${app.name}** (${app.nameZh})\n${app.description}\n[📱 App Store](${app.ios}) | [🤖 Google Play](${app.android})${app.website ? ` | [🌐 Website](${app.website})` : ""}`
  ).join("\n\n");
}

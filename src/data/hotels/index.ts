// @ts-nocheck
/**
 * Unified Hotel Data Index - Auto-generated
 * Last updated: 2026-06-10T06:13:53.063Z
 * Total: 35 cities
 */

import type { HotelItem, HotelCategory } from "@/types/accommodation";

import { beijingHotels } from "./beijing-hotels";
import { shanghaiHotels } from "./shanghai-hotels";
import { guangzhouHotels } from "./guangzhou-hotels";
import { shenzhenHotels } from "./shenzhen-hotels";
import { chengduHotels } from "./chengdu-hotels";
import { hangzhouHotels } from "./hangzhou-hotels";
import { wuhanHotels } from "./wuhan-hotels";
import { xianHotels } from "./xian-hotels";
import { chongqingHotels } from "./chongqing-hotels";
import { nanjingHotels } from "./nanjing-hotels";
import { changshaHotels } from "./changsha-hotels";
import { tianjinHotels } from "./tianjin-hotels";
import { suzhouHotels } from "./suzhou-hotels";
import { zhengzhouHotels } from "./zhengzhou-hotels";
import { dalianHotels } from "./dalian-hotels";
import { qingdaoHotels } from "./qingdao-hotels";
import { kunmingHotels } from "./kunming-hotels";
import { xiamenHotels } from "./xiamen-hotels";
import { harbinHotels } from "./harbin-hotels";
import { hefeiHotels } from "./hefei-hotels";
import { fuzhouHotels } from "./fuzhou-hotels";
import { jinanHotels } from "./jinan-hotels";
import { ningboHotels } from "./ningbo-hotels";
import { wuxiHotels } from "./wuxi-hotels";
import { changchunHotels } from "./changchun-hotels";
import { nanningHotels } from "./nanning-hotels";
import { guiyangHotels } from "./guiyang-hotels";
import { haikouHotels } from "./haikou-hotels";
import { lanzhouHotels } from "./lanzhou-hotels";
import { yinchuanHotels } from "./yinchuan-hotels";
import { xiningHotels } from "./xining-hotels";
import { urumqiHotels } from "./urumqi-hotels";
import { lhasaHotels } from "./lhasa-hotels";
import { hohhotHotels } from "./hohhot-hotels";
import { chengdeHotels } from "./chengde-hotels";

// City hotel data registry
const cityHotelData: Record<string, HotelItem[]> = {
  beijing: beijingHotels,
  shanghai: shanghaiHotels,
  guangzhou: guangzhouHotels,
  shenzhen: shenzhenHotels,
  chengdu: chengduHotels,
  hangzhou: hangzhouHotels,
  wuhan: wuhanHotels,
  xian: xianHotels,
  chongqing: chongqingHotels,
  nanjing: nanjingHotels,
  changsha: changshaHotels,
  tianjin: tianjinHotels,
  suzhou: suzhouHotels,
  zhengzhou: zhengzhouHotels,
  dalian: dalianHotels,
  qingdao: qingdaoHotels,
  kunming: kunmingHotels,
  xiamen: xiamenHotels,
  harbin: harbinHotels,
  hefei: hefeiHotels,
  fuzhou: fuzhouHotels,
  jinan: jinanHotels,
  ningbo: ningboHotels,
  wuxi: wuxiHotels,
  changchun: changchunHotels,
  nanning: nanningHotels,
  guiyang: guiyangHotels,
  haikou: haikouHotels,
  lanzhou: lanzhouHotels,
  yinchuan: yinchuanHotels,
  xining: xiningHotels,
  urumqi: urumqiHotels,
  lhasa: lhasaHotels,
  hohhot: hohhotHotels,
  chengde: chengdeHotels,
};

// Dynamic hotel data cache
const dynamicHotelCache: Map<string, HotelItem[]> = new Map();

export function getHotelsByCity(citySlug: string): HotelItem[] {
  if (cityHotelData[citySlug]) {
    return cityHotelData[citySlug];
  }
  if (dynamicHotelCache.has(citySlug)) {
    return dynamicHotelCache.get(citySlug) || [];
  }
  return [];
}

export function getHotelsByCityAndCategory(
  citySlug: string,
  category: HotelCategory
): HotelItem[] {
  return getHotelsByCity(citySlug).filter(h => h.category === category);
}

export function getHotelCategoryCounts(
  citySlug: string
): Record<HotelCategory, number> {
  const hotels = getHotelsByCity(citySlug);
  const counts: Record<string, number> = {};
  const categories: HotelCategory[] = [
    "luxury", "mid_range", "budget", "hostel", "love_hotel", "esports_hotel"
  ];
  for (const cat of categories) counts[cat] = 0;
  for (const h of hotels) counts[h.category] = (counts[h.category] || 0) + 1;
  return counts as Record<HotelCategory, number>;
}

export function getHotelCount(citySlug: string): number {
  return getHotelsByCity(citySlug).length;
}

export function getAvailableCategories(citySlug: string): HotelCategory[] {
  return [...new Set(getHotelsByCity(citySlug).map(h => h.category))] as HotelCategory[];
}

export function registerHotelData(citySlug: string, hotels: HotelItem[]): void {
  dynamicHotelCache.set(citySlug, hotels);
}

export function getCitiesWithHotels(): string[] {
  return [...new Set([...Object.keys(cityHotelData), ...Array.from(dynamicHotelCache.keys())])];
}

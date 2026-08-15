// @ts-nocheck
/**
 * Unified Hotel Data Index - Auto-generated
 * Last updated: 2026-06-10T06:13:53.063Z
 * Total: 35 cities
 */

import type { HotelItem, HotelCategory } from "@/types/accommodation";
import fs from "node:fs";
import path from "node:path";

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

// City hotel data registry (TS source — 180 hotels per city, mostly synthetic)
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

// Dynamic hotel data cache (registered at runtime by i18n loader)
const dynamicHotelCache: Map<string, HotelItem[]> = new Map();

// Cache of i18n hotels per (lang, citySlug) — sourced from cities-i18n JSON
const i18nHotelCache: Map<string, HotelItem[] | null> = new Map();

// ─── i18n category mapping ───────────────────────────────────────
// cities-i18n JSON uses these short keys in the `budget` field
const BUDGET_TO_CATEGORY: Record<string, HotelCategory> = {
  luxury: "luxury",
  mid: "mid_range",
  mid_range: "mid_range",
  budget: "budget",
  hostel: "hostel",
  youth_hostel: "hostel",
  love_hotel: "love_hotel",
  esports_hotel: "esports_hotel",
  gaming_hotel: "esports_hotel",
};

// ─── Load i18n hotels from cities-i18n JSON ───────────────────────
async function loadI18nHotels(citySlug: string, lang: string): Promise<HotelItem[] | null> {
  const cacheKey = lang + ":" + citySlug;
  if (i18nHotelCache.has(cacheKey)) return i18nHotelCache.get(cacheKey) ?? null;
  try {
    // Dynamic import — Vite glob returns modules
    const modules = import.meta.glob("../../cities-i18n/*/*.json");
    const path = `../../cities-i18n/${lang}/${citySlug}.json`;
    const loader = modules[path];
    if (!loader) {
      i18nHotelCache.set(cacheKey, null);
      return null;
    }
    const mod: any = await loader();
    const data = mod.default ?? mod;
    const list: any[] = Array.isArray(data?.hotels) ? data.hotels : [];
    if (list.length === 0) {
      i18nHotelCache.set(cacheKey, null);
      return null;
    }
    const mapped: HotelItem[] = list.map((h, idx) => {
      const cat = BUDGET_TO_CATEGORY[h.budget] || "mid_range";
      return {
        id: h.id || `${citySlug}-i18n-${idx}`,
        name: h.name,
        nameEn: h.nameEn,
        category: cat,
        priceMin: undefined,
        priceMax: undefined,
        city: citySlug,
        cityZh: undefined,
        address: h.address,
        rating: h.rating,
        highlights: h.highlights || [],
        description: h.bookingTips,
        image: undefined,
        phone: undefined,
      } as HotelItem;
    });
    i18nHotelCache.set(cacheKey, mapped);
    return mapped;
  } catch {
    i18nHotelCache.set(cacheKey, null);
    return null;
  }
}

// ─── Sync helper: pull i18n hotels synchronously (Astro SSR) ───────
// Reads the JSON synchronously using fs — works only on the server side
function loadI18nHotelsSync(citySlug: string, lang: string): HotelItem[] | null {
  if (!lang || lang === "en") return null;
  const cacheKey = lang + ":" + citySlug;
  if (i18nHotelCache.has(cacheKey)) return i18nHotelCache.get(cacheKey) ?? null;
  try {

    const filePath = path.join(
      process.cwd(),
      "src",
      "data",
      "cities-i18n",
      lang,
      `${citySlug}.json`,
    );
    if (!fs.existsSync(filePath)) {
      i18nHotelCache.set(cacheKey, null);
      return null;
    }
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);
    const list: any[] = Array.isArray(data?.hotels) ? data.hotels : [];
    if (list.length === 0) {
      i18nHotelCache.set(cacheKey, null);
      return null;
    }
    const mapped: HotelItem[] = list.map((h, idx) => {
      const cat = BUDGET_TO_CATEGORY[h.budget] || "mid_range";
      return {
        id: h.id || `${citySlug}-i18n-${idx}`,
        name: h.name,
        nameEn: h.nameEn,
        category: cat,
        priceMin: undefined,
        priceMax: undefined,
        city: citySlug,
        cityZh: undefined,
        address: h.address,
        rating: h.rating,
        highlights: h.highlights || [],
        description: h.bookingTips,
        image: undefined,
        phone: undefined,
      } as HotelItem;
    });
    i18nHotelCache.set(cacheKey, mapped);
    return mapped;
  } catch {
    i18nHotelCache.set(cacheKey, null);
    return null;
  }
}

export function getHotelsByCity(citySlug: string, lang?: string): HotelItem[] {
  // Prefer i18n data when available (translated by minimax API)
  const i18nHotels = lang ? loadI18nHotelsSync(citySlug, lang) : null;
  if (i18nHotels && i18nHotels.length > 0) return i18nHotels;
  // Fallback to TS data
  if (cityHotelData[citySlug]) return cityHotelData[citySlug];
  if (dynamicHotelCache.has(citySlug)) return dynamicHotelCache.get(citySlug) || [];
  return [];
}

export function getHotelsByCityAndCategory(
  citySlug: string,
  category: HotelCategory,
  lang?: string,
): HotelItem[] {
  return getHotelsByCity(citySlug, lang).filter((h) => h.category === category);
}

export function getHotelCategoryCounts(
  citySlug: string,
  lang?: string,
): Record<HotelCategory, number> {
  const hotels = getHotelsByCity(citySlug, lang);
  const counts: Record<string, number> = {};
  const categories: HotelCategory[] = [
    "luxury",
    "mid_range",
    "budget",
    "hostel",
    "love_hotel",
    "esports_hotel",
  ];
  for (const cat of categories) counts[cat] = 0;
  for (const h of hotels) counts[h.category] = (counts[h.category] || 0) + 1;
  return counts as Record<HotelCategory, number>;
}

export function getHotelCount(citySlug: string, lang?: string): number {
  return getHotelsByCity(citySlug, lang).length;
}

export function getAvailableCategories(citySlug: string, lang?: string): HotelCategory[] {
  return [...new Set(getHotelsByCity(citySlug, lang).map((h) => h.category))] as HotelCategory[];
}

export function registerHotelData(citySlug: string, hotels: HotelItem[]): void {
  dynamicHotelCache.set(citySlug, hotels);
}

export function getCitiesWithHotels(): string[] {
  return [...new Set([...Object.keys(cityHotelData), ...Array.from(dynamicHotelCache.keys())])];
}

// Async variant — used by client-side code that needs to fetch i18n hotels dynamically
export async function getHotelsByCityAsync(
  citySlug: string,
  lang?: string,
): Promise<HotelItem[]> {
  if (lang) {
    const i18nHotels = await loadI18nHotels(citySlug, lang);
    if (i18nHotels && i18nHotels.length > 0) return i18nHotels;
  }
  return getHotelsByCity(citySlug, undefined);
}

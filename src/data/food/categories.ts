/**
 * Unified restaurant category system.
 * Single source of truth used by:
 *   - src/pages/city/[slug]/food.astro
 *   - src/pages/food/index.astro
 *   - src/components/food/*
 *
 * Adding a new category here automatically:
 *   1. Adds a filter chip on the city food page
 *   2. Adds a category card on the food list page
 *   3. Updates the count widget
 */
import type { Restaurant, RestaurantType } from "@/types/food";

export type HighlightCategory =
  | "michelin"
  | "blackpearl"
  | "local"
  | "affordable"
  | "street_food"
  | "international"
  | "fine_dining"
  | "cafe"
  | "chain"
  | "buffet"
  | "fastfood";

export interface CategoryConfig {
  id: HighlightCategory | "all";
  label: string;
  labelZh: string;
  labels: Record<string, string>;
  icon: string;
  /** Tailwind classes for the filter chip / card */
  colorClass: string;
}

/**
 * Map a Restaurant.type (16 values from src/types/food.ts) onto a
 * highlight category used by filter UI. Falls back to "local" for
 * unknown types so new types are never lost.
 */
export const TYPE_TO_CATEGORY: Record<string, HighlightCategory> = {
  michelin: "michelin",
  blackpearl: "blackpearl",
  local: "local",
  modern: "local",
  budget_local: "affordable",
  hole_in_wall: "street_food",
  night_market: "street_food",
  street: "street_food",
  cafe: "cafe",
  chain: "chain",
  fine: "fine_dining",
  "fine-dining": "fine_dining",
  luxury: "fine_dining",
  international: "international",
  buffet: "buffet",
  fastfood: "fastfood",
};

export function getHighlightCategory(r: { type: string }): HighlightCategory {
  return TYPE_TO_CATEGORY[r.type] ?? "local";
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  all: {
    id: "all",
    label: "All",
    labelZh: "全部",
    labels: { ja: "すべて", ko: "전체", "zh-CN": "全部", "zh-TW": "全部", th: "ทั้งหมด", vi: "Tat ca", ru: "Все", fr: "Tous", de: "Alle", ar: "الكل", fa: "همه" },
    icon: "🍽️",
    colorClass: "bg-gray-50 border-gray-200 text-gray-700",
  },
  michelin: {
    id: "michelin",
    label: "Michelin",
    labelZh: "米其林",
    labels: { ja: "ミシュラン", ko: "미신러", "zh-CN": "米其林", "zh-TW": "米其林", th: "มิเชลิน", vi: "Michelin", ru: "Мишлен", fr: "Michelin", de: "Michelin", ar: "ميشلين", fa: "میشلن" },
    icon: "⭐",
    colorClass: "bg-amber-50 border-amber-200 text-amber-700",
  },
  blackpearl: {
    id: "blackpearl",
    label: "Black Pearl",
    labelZh: "黑珍珠",
    labels: { ja: "ブラックパール", ko: "블랙폌", "zh-CN": "黑珍珠", "zh-TW": "黑珍珠", th: "ประดับดำ", vi: "Trai den", ru: "Чёрная жемчужина", fr: "Perle Noire", de: "Schwarze Perle", ar: "اللؤلأ السوداء", fa: "مروارید سیاه" },
    icon: "💎",
    colorClass: "bg-slate-800 border-slate-600 text-slate-200",
  },
  local: {
    id: "local",
    label: "Local Favorite",
    labelZh: "本地推荐",
    labels: { ja: "地元のおすすめ", ko: "지역 즐기는 곳", "zh-CN": "本地推荐", "zh-TW": "本地推荐", th: "อาหารท้องถิ่น", vi: "Dia phuong yeu thich", ru: "Местные", fr: "Prefere local", de: "Lokaler Favorit", ar: "المفضل المحلي", fa: "محلی" },
    icon: "🥟",
    colorClass: "bg-orange-50 border-orange-200 text-orange-700",
  },
  affordable: {
    id: "affordable",
    label: "Affordable",
    labelZh: "平价美食",
    labels: { ja: "手可な料理", ko: "가격매도재", "zh-CN": "平价美食", "zh-TW": "平价美食", th: "อาหารสสามารถาบ", vi: "Gia ca phai chang", ru: "Недорогое", fr: "Abordable", de: "Guenstig", ar: "بأسعار معقولة", fa: "با قیمت مناسب" },
    icon: "💰",
    colorClass: "bg-green-50 border-green-200 text-green-700",
  },
  street_food: {
    id: "street_food",
    label: "Street Food",
    labelZh: "街边小吃",
    labels: { ja: "街っ徳り小食", ko: "거리맛집", "zh-CN": "街边小吃", "zh-TW": "街边小吃", th: "อาหารข้างถนน", vi: "Do an via he", ru: "Уличная еда", fr: "Cuisine de rue", de: "Strassenessen", ar: "أكل الشارع", fa: "غذای خیابانی" },
    icon: "🥢",
    colorClass: "bg-yellow-50 border-yellow-200 text-yellow-700",
  },
  international: {
    id: "international",
    label: "International",
    labelZh: "国际美食",
    labels: { ja: "国際料理", ko: "국제요리", "zh-CN": "国际美食", "zh-TW": "国际美食", th: "อาหารสามาชาติ", vi: "Quoc te", ru: "Международная", fr: "Internationale", de: "International", ar: "دولي", fa: "بین المللی" },
    icon: "🌍",
    colorClass: "bg-blue-50 border-blue-200 text-blue-700",
  },
  fine_dining: {
    id: "fine_dining",
    label: "Fine Dining",
    labelZh: "高端餐饮",
    labels: { ja: "ハイエンド", ko: "고급 식당", "zh-CN": "高端餐饮", "zh-TW": "高端餐饮", th: "ห้อาหารริบบ่น", vi: "An uong cao cap", ru: "Высшая кухня", fr: "Gastronomie", de: "Gehobene Kueche", ar: "طعام راقي", fa: "غذای لوکس" },
    icon: "🍾",
    colorClass: "bg-purple-50 border-purple-200 text-purple-700",
  },
  cafe: {
    id: "cafe",
    label: "Cafés",
    labelZh: "咖啡馆",
    labels: { ja: "カフェ", ko: "카페", "zh-CN": "咖啡馆", "zh-TW": "咖啡馆", th: "คาเฟ์", vi: "Ca phe", ru: "Кафе", fr: "Cafe", de: "Cafe", ar: "مقهى", fa: "کافه" },
    icon: "☕",
    colorClass: "bg-amber-50 border-amber-200 text-amber-700",
  },
  chain: {
    id: "chain",
    label: "Chains",
    labelZh: "连锁餐饮",
    labels: { ja: "チェーン店", ko: "연체점", "zh-CN": "连锁餐饮", "zh-TW": "连锁餐饮", th: "ร้านสาขา", vi: "Chuoi cua hang", ru: "Сетевые", fr: "Chaines", de: "Ketten", ar: "سلاسلي", fa: "زنجیره ای" },
    icon: "🏪",
    colorClass: "bg-sky-50 border-sky-200 text-sky-700",
  },
  buffet: {
    id: "buffet",
    label: "Buffet",
    labelZh: "自助餐",
    labels: { ja: "ブッフェ", ko: "분싸", "zh-CN": "自助餐", "zh-TW": "自助餐", th: "บุปเฟ์", vi: "Buffet", ru: "Шведский стол", fr: "Buffet", de: "Buffet", ar: "بوفيه", fa: "بوفه" },
    icon: "🍱",
    colorClass: "bg-rose-50 border-rose-200 text-rose-700",
  },
  fastfood: {
    id: "fastfood",
    label: "Fast Food",
    labelZh: "快餐",
    labels: { ja: "ファストフード", ko: "패스트드", "zh-CN": "快餐", "zh-TW": "快餐", th: "ฟองฟู", vi: "Thuc an nhanh", ru: "Фастфуд", fr: "Fast food", de: "Fast Food", ar: "وجبات سريعة", fa: "فست فود" },
    icon: "🍔",
    colorClass: "bg-red-50 border-red-200 text-red-700",
  },
};

/**
 * Order in which categories are shown in the filter UI.
 * "all" is always first; the rest follow.
 */
export const CATEGORY_ORDER: HighlightCategory[] = [
  "michelin",
  "blackpearl",
  "local",
  "affordable",
  "street_food",
  "international",
  "fine_dining",
  "cafe",
  "chain",
  "buffet",
  "fastfood",
];

/**
 * Build the filter groups (each with its restaurants slice) for a city,
 * skipping any category that has zero restaurants — so the chip list always
 * reflects what is actually in the data.
 */
export interface FilterGroup {
  id: string;
  label: string;
  labelZh: string;
  labels: Record<string, string>;
  icon: string;
  colorClass: string;
  restaurants: Restaurant[];
}

export function buildFilterGroups(restaurants: Restaurant[]): FilterGroup[] {
  const counts = new Map<HighlightCategory, Restaurant[]>();
  for (const r of restaurants) {
    const cat = getHighlightCategory(r);
    if (!counts.has(cat)) counts.set(cat, []);
    counts.get(cat)!.push(r);
  }

  const groups: FilterGroup[] = [
    {
      ...CATEGORY_CONFIG.all,
      restaurants,
    },
    ...CATEGORY_ORDER.filter((c) => counts.has(c)).map((c) => ({
      ...CATEGORY_CONFIG[c],
      restaurants: counts.get(c)!,
    })),
  ];
  return groups;
}

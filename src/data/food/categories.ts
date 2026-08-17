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
import { cities } from "@/data/cities/index";
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

export function getHighlightCategory(r: { type?: string }): HighlightCategory {
  return TYPE_TO_CATEGORY[r.type ?? ""] ?? "local";
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  all: {
    id: "all",
    label: "All",
    labelZh: "全部",
    labels: { ja: "すべて", ko: "전체", "zh-CN": "全部", "zh-TW": "全部", th: "ทั้งหมด", vi: "Tất cả", ru: "Все", fr: "Tous", de: "Alle", ar: "الكل", fa: "همه" },
    icon: "🍽️",
    colorClass: "bg-gray-50 border-gray-200 text-gray-700",
  },
  michelin: {
    id: "michelin",
    label: "Michelin",
    labelZh: "米其林",
    labels: { ja: "ミシュラン", ko: "미쉐린", "zh-CN": "米其林", "zh-TW": "米其林", th: "มิชลิน", vi: "Michelin", ru: "Мишлен", fr: "Michelin", de: "Michelin", ar: "ميشلين", fa: "میشلن" },
    icon: "⭐",
    colorClass: "bg-amber-50 border-amber-200 text-amber-700",
  },
  blackpearl: {
    id: "blackpearl",
    label: "Black Pearl",
    labelZh: "黑珍珠",
    labels: { ja: "ブラックパール", ko: "블랙펄", "zh-CN": "黑珍珠", "zh-TW": "黑珍珠", th: "ไข่มุกดำ", vi: "Trân châu đen", ru: "Чёрная жемчужина", fr: "Perle Noire", de: "Schwarze Perle", ar: "اللؤلؤة السوداء", fa: "مروارید سیاه" },
    icon: "💎",
    colorClass: "bg-slate-800 border-slate-600 text-slate-200",
  },
  local: {
    id: "local",
    label: "Local Favorite",
    labelZh: "本地推荐",
    labels: { ja: "地元のおすすめ", ko: "현지 추천", "zh-CN": "本地推荐", "zh-TW": "本地推薦", th: "อาหารท้องถิ่น", vi: "Địa phương yêu thích", ru: "Местные", fr: "Préféré local", de: "Lokaler Favorit", ar: "المفضل المحلي", fa: "محلی" },
    icon: "🥟",
    colorClass: "bg-orange-50 border-orange-200 text-orange-700",
  },
  affordable: {
    id: "affordable",
    label: "Affordable",
    labelZh: "平价美食",
    labels: { ja: "手頃な料理", ko: "가성비 좋은", "zh-CN": "平价美食", "zh-TW": "平價美食", th: "อาหารราคาย่อมเยา", vi: "Giá cả phải chăng", ru: "Недорогое", fr: "Abordable", de: "Günstig", ar: "بأسعار معقولة", fa: "با قیمت مناسب" },
    icon: "💰",
    colorClass: "bg-green-50 border-green-200 text-green-700",
  },
  street_food: {
    id: "street_food",
    label: "Street Food",
    labelZh: "街边小吃",
    labels: { ja: "ストリートフード", ko: "길거리 음식", "zh-CN": "街边小吃", "zh-TW": "街邊小吃", th: "อาหารข้างถนน", vi: "Đồ ăn đường phố", ru: "Уличная еда", fr: "Cuisine de rue", de: "Straßenessen", ar: "أكل الشارع", fa: "غذای خیابانی" },
    icon: "🥢",
    colorClass: "bg-yellow-50 border-yellow-200 text-yellow-700",
  },
  international: {
    id: "international",
    label: "International",
    labelZh: "国际美食",
    labels: { ja: "国際料理", ko: "국제 요리", "zh-CN": "国际美食", "zh-TW": "國際美食", th: "อาหารนานาชาติ", vi: "Quốc tế", ru: "Международная", fr: "Internationale", de: "International", ar: "دولي", fa: "بین المللی" },
    icon: "🌍",
    colorClass: "bg-blue-50 border-blue-200 text-blue-700",
  },
  fine_dining: {
    id: "fine_dining",
    label: "Fine Dining",
    labelZh: "高端餐饮",
    labels: { ja: "ハイエンド", ko: "고급 식당", "zh-CN": "高端餐饮", "zh-TW": "高端餐飲", th: "อาหารระดับพรีเมียม", vi: "Ẩm thực cao cấp", ru: "Высшая кухня", fr: "Gastronomie", de: "Gehobene Küche", ar: "طعام راقي", fa: "غذای لوکس" },
    icon: "🍾",
    colorClass: "bg-purple-50 border-purple-200 text-purple-700",
  },
  cafe: {
    id: "cafe",
    label: "Cafés",
    labelZh: "咖啡馆",
    labels: { ja: "カフェ", ko: "카페", "zh-CN": "咖啡馆", "zh-TW": "咖啡館", th: "คาเฟ่", vi: "Cà phê", ru: "Кафе", fr: "Café", de: "Café", ar: "مقهى", fa: "کافه" },
    icon: "☕",
    colorClass: "bg-amber-50 border-amber-200 text-amber-700",
  },
  chain: {
    id: "chain",
    label: "Chains",
    labelZh: "连锁餐饮",
    labels: { ja: "チェーン店", ko: "체인점", "zh-CN": "连锁餐饮", "zh-TW": "連鎖餐飲", th: "ร้านเครือข่าย", vi: "Chuỗi cửa hàng", ru: "Сетевые", fr: "Chaînes", de: "Ketten", ar: "سلاسل", fa: "زنجیره ای" },
    icon: "🏪",
    colorClass: "bg-sky-50 border-sky-200 text-sky-700",
  },
  buffet: {
    id: "buffet",
    label: "Buffet",
    labelZh: "自助餐",
    labels: { ja: "ブッフェ", ko: "뷔페", "zh-CN": "自助餐", "zh-TW": "自助餐", th: "บุฟเฟ่ต์", vi: "Buffet", ru: "Шведский стол", fr: "Buffet", de: "Buffet", ar: "بوفيه", fa: "بوفه" },
    icon: "🍱",
    colorClass: "bg-rose-50 border-rose-200 text-rose-700",
  },
  fastfood: {
    id: "fastfood",
    label: "Fast Food",
    labelZh: "快餐",
    labels: { ja: "ファストフード", ko: "패스트푸드", "zh-CN": "快餐", "zh-TW": "快餐", th: "อาหารจานด่วน", vi: "Thức ăn nhanh", ru: "Фастфуд", fr: "Fast-food", de: "Fast Food", ar: "وجبات سريعة", fa: "فست فود" },
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

/**
 * Price/tag-based tagging used by the city food page filters and the city
 * detail food highlights. "local" restaurants are split by street-food tag,
 * then price; Michelin/Black Pearl stay in their own type groups so those
 * filters are always meaningful on city pages.
 */
export type RestaurantFilterTag = "local_recommend" | "affordable" | "street_food";

const AFFORDABLE_MAX_PRICE = 100;
const LOCAL_RECOMMEND_MAX_PRICE = 150;

/**
 * Canonical street-food restaurant ids, derived from the EN master data.
 * The i18n city files translate `tags` (e.g. "street" → 屋台/거리/街头/...), so
 * matching translated tags with fixed English/Chinese keywords silently empties
 * the Street Food filter on non-English versions. Every i18n restaurant keeps
 * the same `id` as the EN source, so keying the split by id keeps
 * classification identical across all 12 language versions.
 */
const STREET_FOOD_IDS: ReadonlySet<string> = new Set(
  cities.flatMap((city) =>
    (city.restaurants ?? [])
      .filter(
        (r) =>
          r.type === "local" &&
          (r.tags ?? []).some((t) => t.includes("street") || t.includes("苍蝇馆子")),
      )
      .map((r) => r.id),
  ),
);

export function isStreetFoodRestaurantId(id?: string): boolean {
  return !!id && STREET_FOOD_IDS.has(id);
}

export function getRestaurantHighlightTag(r: {
  id?: string;
  type?: string;
  tags?: string[];
  avgPrice?: number;
}): RestaurantFilterTag | null {
  const type = r.type || "";
  const price = Number(r.avgPrice) || 0;
  if (type === "local") {
    // Canonical EN-source id lookup first (language-independent).
    if (isStreetFoodRestaurantId(r.id)) return "street_food";
    const tags = r.tags || [];
    // Legacy fallback for hand-curated data that still carries the raw tag.
    if (tags.some((t) => t.includes("苍蝇馆子") || t.includes("street"))) return "street_food";
    if (price <= AFFORDABLE_MAX_PRICE) return "affordable";
    if (price <= LOCAL_RECOMMEND_MAX_PRICE) return "local_recommend";
  }
  if (type !== "local" && price <= AFFORDABLE_MAX_PRICE) return "affordable";
  return null;
}

/** Single filter category per restaurant (chip counts always match cards). */
export function getRestaurantFilterCategory(r: {
  type?: string;
  tags?: string[];
  avgPrice?: number;
}): string {
  if (r.type === "michelin") return "michelin";
  if (r.type === "blackpearl") return "blackpearl";
  return getRestaurantHighlightTag(r) ?? "other";
}

/**
 * Single filter category used by the city food pages. Every restaurant maps
 * to exactly one of the CATEGORY_ORDER ids so chip counts always match cards:
 *   - Michelin / Black Pearl keep their own type groups
 *   - Otherwise the price/tag highlight split applies ("local_recommend" is
 *     normalized to the "local" chip since the city page filter set has no
 *     separate local_recommend id)
 *   - Anything left falls back to TYPE_TO_CATEGORY (cafe, chain, fine_dining,
 *     international, buffet, fastfood, street_food, ...)
 */
export function getCityFilterCategory(r: {
  type?: string;
  tags?: string[];
  avgPrice?: number;
}): string {
  if (r.type === "michelin") return "michelin";
  if (r.type === "blackpearl") return "blackpearl";
  const tag = getRestaurantHighlightTag(r);
  if (tag) return tag === "local_recommend" ? "local" : tag;
  return getHighlightCategory(r);
}

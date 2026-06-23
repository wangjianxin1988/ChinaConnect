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
    icon: "🍽️",
    colorClass: "bg-gray-50 border-gray-200 text-gray-700",
  },
  michelin: {
    id: "michelin",
    label: "Michelin",
    labelZh: "米其林",
    icon: "⭐",
    colorClass: "bg-amber-50 border-amber-200 text-amber-700",
  },
  blackpearl: {
    id: "blackpearl",
    label: "Black Pearl",
    labelZh: "黑珍珠",
    icon: "💎",
    colorClass: "bg-slate-800 border-slate-600 text-slate-200",
  },
  local: {
    id: "local",
    label: "Local Favorite",
    labelZh: "本地推荐",
    icon: "🥟",
    colorClass: "bg-orange-50 border-orange-200 text-orange-700",
  },
  affordable: {
    id: "affordable",
    label: "Affordable",
    labelZh: "平价美食",
    icon: "💰",
    colorClass: "bg-green-50 border-green-200 text-green-700",
  },
  street_food: {
    id: "street_food",
    label: "Street Food",
    labelZh: "街边小吃",
    icon: "🥢",
    colorClass: "bg-yellow-50 border-yellow-200 text-yellow-700",
  },
  international: {
    id: "international",
    label: "International",
    labelZh: "国际美食",
    icon: "🌍",
    colorClass: "bg-blue-50 border-blue-200 text-blue-700",
  },
  fine_dining: {
    id: "fine_dining",
    label: "Fine Dining",
    labelZh: "高端餐饮",
    icon: "🍾",
    colorClass: "bg-purple-50 border-purple-200 text-purple-700",
  },
  cafe: {
    id: "cafe",
    label: "Cafés",
    labelZh: "咖啡馆",
    icon: "☕",
    colorClass: "bg-amber-50 border-amber-200 text-amber-700",
  },
  chain: {
    id: "chain",
    label: "Chains",
    labelZh: "连锁餐饮",
    icon: "🏪",
    colorClass: "bg-sky-50 border-sky-200 text-sky-700",
  },
  buffet: {
    id: "buffet",
    label: "Buffet",
    labelZh: "自助餐",
    icon: "🍱",
    colorClass: "bg-rose-50 border-rose-200 text-rose-700",
  },
  fastfood: {
    id: "fastfood",
    label: "Fast Food",
    labelZh: "快餐",
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

/**
 * Food Tier System Types
 * S = Michelin (米其林)
 * A = Black Pearl (黑珍珠)
 * B = Local Blogger (本地博主)
 */

// Food Tier Classification
export type FoodTier = "S" | "A" | "B";

// Restaurant Type - expanded with new categories
export type RestaurantType =
  | "michelin"
  | "blackpearl"
  | "local"
  | "budget_local"
  | "hole_in_wall"
  | "night_market";

// Legacy alias for backward compatibility
export type RestaurantTier = RestaurantType;

export interface FoodTierInfo {
  tier: FoodTier;
  label: string;
  labelZh: string;
  source: string;
  sourceUrl?: string;
  color: {
    bg: string;
    text: string;
    border: string;
  };
}

// Tier to RestaurantType mapping
// S = Michelin (fine dining)
// A = Black Pearl (premium dining)
// B = Local blogger recommended (includes budget_local, hole_in_wall, night_market)
export const tierToRestaurantType: Record<FoodTier, RestaurantType> = {
  S: "michelin",
  A: "blackpearl",
  B: "local",
};

export const restaurantTypeToTier: Record<RestaurantType, FoodTier> = {
  michelin: "S",
  blackpearl: "A",
  local: "B",
  budget_local: "B",
  hole_in_wall: "B",
  night_market: "B",
};

// Food Tier configurations
export const FOOD_TIER_CONFIG: Record<FoodTier, FoodTierInfo> = {
  S: {
    tier: "S",
    label: "Michelin",
    labelZh: "米其林",
    source: "Michelin Guide China",
    color: {
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
    },
  },
  A: {
    tier: "A",
    label: "Black Pearl",
    labelZh: "黑珍珠",
    source: "Dianping Black Pearl",
    color: {
      bg: "bg-slate-800",
      text: "text-slate-200",
      border: "border-slate-600",
    },
  },
  B: {
    tier: "B",
    label: "Local Favorite",
    labelZh: "本地博主",
    source: "Local Bloggers",
    color: {
      bg: "bg-orange-50",
      text: "text-orange-800",
      border: "border-orange-200",
    },
  },
};

// Restaurant Type configurations for new food categories
export interface RestaurantTypeInfo {
  type: RestaurantType;
  label: string;
  labelZh: string;
  description: string;
  icon: string;
  color: {
    bg: string;
    text: string;
    border: string;
  };
  priceRange: {
    min: number;
    max: number;
  };
}

export const RESTAURANT_TYPE_CONFIG: Record<RestaurantType, RestaurantTypeInfo> = {
  michelin: {
    type: "michelin",
    label: "Michelin",
    labelZh: "米其林",
    description: "Fine dining with Michelin star ratings",
    icon: "⭐",
    color: {
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
    },
    priceRange: { min: 300, max: 5000 },
  },
  blackpearl: {
    type: "blackpearl",
    label: "Black Pearl",
    labelZh: "黑珍珠",
    description: "Premium dining selected by Dianping Black Pearl",
    icon: "💎",
    color: {
      bg: "bg-slate-800",
      text: "text-slate-200",
      border: "border-slate-600",
    },
    priceRange: { min: 150, max: 1500 },
  },
  local: {
    type: "local",
    label: "Local",
    labelZh: "本地推荐",
    description: "Local blogger recommended restaurants",
    icon: "🔥",
    color: {
      bg: "bg-orange-50",
      text: "text-orange-800",
      border: "border-orange-200",
    },
    priceRange: { min: 50, max: 200 },
  },
  budget_local: {
    type: "budget_local",
    label: "Budget Local",
    labelZh: "本地人推荐",
    description: "Affordable local favorites recommended by residents (avg 50-150 yuan)",
    icon: "🍜",
    color: {
      bg: "bg-green-50",
      text: "text-green-800",
      border: "border-green-200",
    },
    priceRange: { min: 50, max: 150 },
  },
  hole_in_wall: {
    type: "hole_in_wall",
    label: "Hole in the Wall",
    labelZh: "苍蝇馆子",
    description: "No-frills eateries with amazing food (avg 20-80 yuan)",
    icon: "🦐",
    color: {
      bg: "bg-yellow-50",
      text: "text-yellow-800",
      border: "border-yellow-200",
    },
    priceRange: { min: 20, max: 80 },
  },
  night_market: {
    type: "night_market",
    label: "Night Market",
    labelZh: "夜市摊位",
    description: "Street food stalls at night markets (avg 10-50 yuan)",
    icon: "🌙",
    color: {
      bg: "bg-indigo-50",
      text: "text-indigo-800",
      border: "border-indigo-200",
    },
    priceRange: { min: 10, max: 50 },
  },
};

// Helper to get restaurant type label
export const getRestaurantTypeLabel = (type: RestaurantType): string => {
  return RESTAURANT_TYPE_CONFIG[type]?.labelZh ?? type;
};

// Blogger Platform
export type BloggerPlatform = "douyin" | "xiaohongshu" | "bilibili" | "weibo";

export const BLOGGER_PLATFORM_LABELS: Record<BloggerPlatform, string> = {
  douyin: "抖音",
  xiaohongshu: "小红书",
  bilibili: "B站",
  weibo: "微博",
};

// Rating source
export type RatingSource = "michelin" | "dianping" | "ctrip" | "blogger";

export interface FoodRating {
  source: RatingSource;
  score: number;
  maxScore: number;
  reviewCount?: number;
  lastUpdated: string;
}

// Restaurant interface aligned with three-tier system
export interface Restaurant {
  id: string;
  name: string;
  nameEn?: string;
  tier: FoodTier;
  // Restaurant type for filtering (expanded categories)
  type: RestaurantType;
  // Michelin specific (tier S)
  star?: 1 | 2 | 3;
  // Black Pearl specific (tier A)
  diamond?: 1 | 2 | 3;
  // Base info
  cuisine: string;
  avgPrice: number;
  rating?: number;
  ratings?: FoodRating[];
  address: string;
  addressEn?: string;
  city: string;
  cityZh: string;
  district?: string;
  lat: number;
  lng: number;
  phone?: string;
  hours?: string;
  hoursEn?: string;
  // Local blogger fields (tier B)
  bloggerName?: string;
  bloggerPlatform?: BloggerPlatform;
  bloggerReason?: string;
  videoUrl?: string;
  // Common
  tags: string[];
  imageUrl?: string;
  description?: string;
  descriptionEn?: string;
  // Price transparency
  touristPrice?: number;
  localPrice?: number;
  // Menu
  menuUrl?: string;
  recommendedDishes?: RecommendedDish[];
  dishHighlights?: string[];
  // Accessibility
  foreignerFriendly: boolean;
  hasEnglishMenu: boolean;
  hasPictureMenu: boolean;
}

export interface RecommendedDish {
  name: string;
  nameEn: string;
  price: number;
  recommended: boolean;
  allergens?: string[];
  description?: string;
}

// City with restaurants
export interface FoodCity {
  id: string;
  name: string;
  nameZh: string;
  lat: number;
  lng: number;
  restaurants: Restaurant[];
}

// Filter state for food search
export interface FoodFilterState {
  cuisines: string[];
  priceRange: [number, number] | null;
  distance: number | null;
  minRating: number | null;
  tiers: FoodTier[];
  foreignerFriendly: boolean;
  hasEnglishMenu: boolean;
  hasPictureMenu: boolean;
  hasBloggerVideo: boolean;
}

// Map layer state
export interface FoodMapLayerState {
  S: boolean;
  A: boolean;
  B: boolean;
}

// Review interface for blogger recommendations
export interface BloggerReview {
  id: string;
  platform: BloggerPlatform;
  authorName: string;
  authorAvatar?: string;
  content: string;
  rating?: number;
  publishDate: string;
  likes?: number;
  videoUrl?: string;
  images?: string[];
}

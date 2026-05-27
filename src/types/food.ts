/**
 * Food Tier System Types
 * S = Michelin (米其林)
 * A = Black Pearl (黑珍珠)
 * B = Local Blogger (本地博主)
 */

// Food Tier Classification
export type FoodTier = "S" | "A" | "B";

// Restaurant Tier mapping
export type RestaurantTier = "michelin" | "blackpearl" | "local";

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
export const tierToRestaurantType: Record<FoodTier, RestaurantTier> = {
  S: "michelin",
  A: "blackpearl",
  B: "local",
};

export const restaurantTypeToTier: Record<RestaurantTier, FoodTier> = {
  michelin: "S",
  blackpearl: "A",
  local: "B",
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

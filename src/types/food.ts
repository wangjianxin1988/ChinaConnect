export type RestaurantType = "michelin" | "blackpearl" | "local";

export type BloggerPlatform = "douyin" | "xiaohongshu" | "bilibili" | "weibo";

export interface Restaurant {
  id: string;
  name: string;
  nameEn?: string;
  type: RestaurantType;
  // Michelin specific
  star?: 1 | 2 | 3;
  // Black Pearl specific
  diamond?: 1 | 2 | 3;
  // Base info
  cuisine: string;
  avgPrice: number;
  rating: number;
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
  // Local recommendation / blogger fields
  bloggerName?: string;
  bloggerPlatform?: BloggerPlatform;
  bloggerReason?: string; // 博主推荐理由
  videoUrl?: string; // 视频链接
  // Common
  tags: string[];
  imageUrl?: string;
  description?: string;
  descriptionEn?: string;
  // Price transparency
  touristPrice?: number; // 老外价
  localPrice?: number; // 本地价
  // Menu
  menuUrl?: string;
  recommendedDishes?: RecommendedDish[];
  // Dish highlights for local recommendations
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

export interface City {
  id: string;
  name: string;
  nameZh: string;
  lat: number;
  lng: number;
  restaurants: Restaurant[];
}

export interface FilterState {
  cuisines: string[];
  priceRange: [number, number] | null;
  distance: number | null;
  minRating: number | null;
  types: RestaurantType[];
  foreignerFriendly: boolean;
  hasEnglishMenu: boolean;
  hasPictureMenu: boolean;
}

export interface MapLayerState {
  michelin: boolean;
  blackpearl: boolean;
  local: boolean;
}

export interface UserLocation {
  lat: number;
  lng: number;
}

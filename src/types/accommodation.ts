/**
 * Budget Hotel Accommodation Types
 * Types for平价酒店 (affordable/budget hotels) module
 */

// Budget hotel type classification
export type BudgetHotelType = "budget_hostel" | "economy_hotel" | "motel";

// Extended hotel category for the unified hotel system
export type HotelCategory =
  | "luxury"       // 豪华酒店
  | "mid_range"    // 中端酒店
  | "budget"       // 经济型酒店
  | "hostel"       // 青年旅舍
  | "love_hotel"   // 情趣酒店
  | "esports_hotel"; // 电竞酒店

// Unified hotel interface for the new system
export interface HotelItem {
  id: string;
  name: string;
  nameEn: string;
  category: HotelCategory;
  priceMin: number;   // CNY per night
  priceMax: number;
  city: string;
  cityZh: string;
  district: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  rating: number;
  reviewCount?: number;
  image: string;      // Pexels or local image URL
  phone?: string;
  highlights: string[];
  amenities?: string[];
  description?: string;
  bookingUrl?: string;
}

// Hotel category config with labels and colors
export const HOTEL_CATEGORY_CONFIG: Record<HotelCategory, { label: string; labelZh: string; icon: string; color: string }> = {
  luxury: { label: "Luxury", labelZh: "豪华酒店", icon: "👑", color: "bg-purple-100 text-purple-700 border-purple-200" },
  mid_range: { label: "Mid-Range", labelZh: "中端酒店", icon: "🏨", color: "bg-blue-100 text-blue-700 border-blue-200" },
  budget: { label: "Budget", labelZh: "经济型酒店", icon: "💰", color: "bg-green-100 text-green-700 border-green-200" },
  hostel: { label: "Hostel", labelZh: "青年旅舍", icon: "🛏️", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  love_hotel: { label: "Love Hotel", labelZh: "情趣酒店", icon: "💕", color: "bg-pink-100 text-pink-700 border-pink-200" },
  esports_hotel: { label: "Esports", labelZh: "电竞酒店", icon: "🎮", color: "bg-orange-100 text-orange-700 border-orange-200" },
};

// Blogger platform for recommendations
export type BloggerPlatform = "douyin" | "xiaohongshu" | "bilibili" | "weibo";

// Hotel amenities
export interface Amenity {
  id: string;
  label: string;
  labelZh: string;
  icon: string;
}

// Standard amenities for budget hotels
export const BUDGET_AMENITIES: Amenity[] = [
  { id: "wifi", label: "Free WiFi", labelZh: "免费WiFi", icon: "📶" },
  { id: "ac", label: "Air Conditioning", labelZh: "空调", icon: "❄️" },
  { id: "hot_water", label: "24h Hot Water", labelZh: "24小时热水", icon: "🚿" },
  { id: "24h_checkin", label: "24h Check-in", labelZh: "24小时入住", icon: "🕐" },
  { id: "luggage", label: "Luggage Storage", labelZh: "行李寄存", icon: "🧳" },
  { id: "laundry", label: "Laundry", labelZh: "洗衣服务", icon: "🧺" },
  { id: "locker", label: "Locker", labelZh: "储物柜", icon: "🔐" },
  { id: "breakfast", label: "Breakfast", labelZh: "早餐", icon: "🍳" },
  { id: "kitchen", label: "Shared Kitchen", labelZh: "公用厨房", icon: "🍲" },
  { id: "parking", label: "Parking", labelZh: "停车场", icon: "🅿️" },
  { id: "elevator", label: "Elevator", labelZh: "电梯", icon: "🛗" },
  { id: "heating", label: "Heating", labelZh: "暖气", icon: "🔥" },
];

// Metro nearby information
export interface MetroNearby {
  line: string;
  station: string;
  walkingMinutes: number;
}

// Budget hotel interface
export interface BudgetHotel {
  id: string;
  name: string;
  nameEn: string;
  type: BudgetHotelType;
  avgPrice: number; // CNY per night
  city: string;
  cityZh: string;
  district: string;
  address: string;
  metro?: MetroNearby;
  coordinates?: {
    lat: number;
    lng: number;
  };
  rating: number;
  reviewCount?: number;
  // Blogger recommendation
  bloggerName?: string;
  bloggerPlatform?: BloggerPlatform;
  bloggerReason?: string;
  bloggerAvatar?: string;
  // Amenities
  amenities: string[];
  // Foreigner friendly
  foreignerFriendly: boolean;
  hasEnglishSign: boolean;
  // Room types available
  roomTypes?: string[];
  // Check-in time
  checkInTime?: string;
  checkOutTime?: string;
  // Notes
  tips?: string;
  description?: string;
  descriptionEn?: string;
  // Contact
  phone?: string;
  bookingUrl?: string;
}

// BudgetHotel type labels
export const BUDGET_HOTEL_TYPE_LABELS: Record<
  BudgetHotelType,
  { label: string; labelZh: string; color: string }
> = {
  budget_hostel: {
    label: "Hostel",
    labelZh: "青年旅舍",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  economy_hotel: {
    label: "Economy Hotel",
    labelZh: "经济型酒店",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  motel: {
    label: "Motel",
    labelZh: "招待所",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
};

// Platform labels
export const BLOGGER_PLATFORM_LABELS: Record<BloggerPlatform, string> = {
  douyin: "抖音",
  xiaohongshu: "小红书",
  bilibili: "B站",
  weibo: "微博",
};

// Helper to get amenity label
export function getAmenityLabel(amenityId: string): string {
  const amenity = BUDGET_AMENITIES.find((a) => a.id === amenityId);
  return amenity?.label ?? amenityId;
}

// Helper to get amenity Chinese label
export function getAmenityLabelZh(amenityId: string): string {
  const amenity = BUDGET_AMENITIES.find((a) => a.id === amenityId);
  return amenity?.labelZh ?? amenityId;
}

// Helper to get amenity icon
export function getAmenityIcon(amenityId: string): string {
  const amenity = BUDGET_AMENITIES.find((a) => a.id === amenityId);
  return amenity?.icon ?? "📌";
}

// Price range helper
export function getPriceRange(avgPrice: number): { min: number; max: number } {
  return {
    min: Math.round(avgPrice * 0.7),
    max: Math.round(avgPrice * 1.3),
  };
}

// Filter state for budget hotels
export interface BudgetHotelFilterState {
  types: BudgetHotelType[];
  priceRange: [number, number] | null;
  minRating: number | null;
  metroNearby: boolean;
  foreignerFriendly: boolean;
  amenities: string[];
}

// ============================================================================
// Extended Hotel Types - 全品类酒店分类
// ============================================================================

// Extended hotel category classification (covers all hotel types)
export type HotelCategory =
  | "luxury"        // 豪华酒店
  | "mid_range"     // 中端酒店
  | "budget"        // 经济型酒店
  | "youth_hostel"  // 青年旅舍
  | "love_hotel"    // 情趣酒店
  | "gaming_hotel"; // 电竞酒店

// Price tier for filtering
export type PriceTier = "ultra_luxury" | "luxury" | "upper_mid" | "mid" | "budget" | "ultra_budget";

// Coordinates interface
export interface Coordinates {
  lat: number;
  lng: number;
}

// Full hotel interface for the new unified system
export interface Hotel {
  id: string;
  name: string;
  nameEn: string;
  category: HotelCategory;
  priceRange: string;        // e.g. "¥200-400/night"
  priceTier?: PriceTier;
  city: string;              // city slug, e.g. "beijing"
  cityZh: string;            // Chinese city name, e.g. "北京"
  district?: string;         // district name
  address: string;
  coordinates?: Coordinates;
  rating: number;            // 1-5
  reviewCount?: number;
  image?: string;            // main image URL
  images?: string[];         // additional images
  phone?: string;            // contact phone
  mapUrl?: string;           // map link (Gaode/Baidu)
  bookingUrl?: string;       // booking platform link
  website?: string;          // official website
  highlights: string[];      // key features
  amenities?: string[];      // amenity IDs
  description?: string;
  descriptionEn?: string;
  // Location info
  metro?: MetroNearby;
  foreignerFriendly?: boolean;
  hasEnglishSign?: boolean;
  // Room info
  roomTypes?: string[];
  checkInTime?: string;
  checkOutTime?: string;
  // Category-specific fields
  categoryFeatures?: string[];  // e.g. ["e-sports PCs", "PS5", "VR"] for gaming_hotel
  tips?: string;
  // Metadata
  bloggerName?: string;
  bloggerPlatform?: BloggerPlatform;
  bloggerReason?: string;
}

// Hotel category labels and display config
export const HOTEL_CATEGORY_LABELS: Record<
  HotelCategory,
  { label: string; labelZh: string; color: string; icon: string; description: string }
> = {
  luxury: {
    label: "Luxury Hotel",
    labelZh: "豪华酒店",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    icon: "👑",
    description: "Five-star international brands and boutique luxury properties",
  },
  mid_range: {
    label: "Mid-Range Hotel",
    labelZh: "中端酒店",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: "🏨",
    description: "Comfortable 3-4 star hotels with good amenities",
  },
  budget: {
    label: "Budget Hotel",
    labelZh: "经济型酒店",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: "💰",
    description: "Affordable chain hotels with basic comfort",
  },
  youth_hostel: {
    label: "Youth Hostel",
    labelZh: "青年旅舍",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: "🎒",
    description: "Social hostels with dormitory and private rooms",
  },
  love_hotel: {
    label: "Love Hotel",
    labelZh: "情趣酒店",
    color: "bg-pink-100 text-pink-700 border-pink-200",
    icon: "💕",
    description: "Themed romantic hotels for couples",
  },
  gaming_hotel: {
    label: "Gaming Hotel",
    labelZh: "电竞酒店",
    color: "bg-cyan-100 text-cyan-700 border-cyan-200",
    icon: "🎮",
    description: "Hotels with high-end gaming PCs and e-sports facilities",
  },
};

// Price tier labels
export const PRICE_TIER_LABELS: Record<PriceTier, { label: string; labelZh: string; range: string }> = {
  ultra_luxury: { label: "Ultra Luxury", labelZh: "超豪华", range: "¥5000+" },
  luxury: { label: "Luxury", labelZh: "豪华", range: "¥1500-5000" },
  upper_mid: { label: "Upper Mid-Range", labelZh: "中高端", range: "¥500-1500" },
  mid: { label: "Mid-Range", labelZh: "中端", range: "¥200-500" },
  budget: { label: "Budget", labelZh: "经济", range: "¥100-200" },
  ultra_budget: { label: "Ultra Budget", labelZh: "超经济", range: "¥<100" },
};

// Extended amenity set for all hotel categories
export const EXTENDED_AMENITIES: Amenity[] = [
  ...BUDGET_AMENITIES,
  { id: "pool", label: "Swimming Pool", labelZh: "游泳池", icon: "🏊" },
  { id: "gym", label: "Fitness Center", labelZh: "健身房", icon: "💪" },
  { id: "spa", label: "Spa & Wellness", labelZh: "水疗中心", icon: "🧖" },
  { id: "restaurant", label: "Restaurant", labelZh: "餐厅", icon: "🍽️" },
  { id: "bar", label: "Bar/Lounge", labelZh: "酒吧", icon: "🍸" },
  { id: "concierge", label: "Concierge", labelZh: "礼宾服务", icon: "🎩" },
  { id: "room_service", label: "Room Service", labelZh: "客房服务", icon: "🛎️" },
  { id: "business_center", label: "Business Center", labelZh: "商务中心", icon: "💼" },
  { id: "kids_club", label: "Kids Club", labelZh: "儿童乐园", icon: "🧸" },
  { id: "shuttle", label: "Airport Shuttle", labelZh: "机场接送", icon: "🚐" },
  { id: "gaming_pc", label: "Gaming PC", labelZh: "电竞电脑", icon: "🖥️" },
  { id: "ps5", label: "PlayStation 5", labelZh: "PS5", icon: "🎮" },
  { id: "vr", label: "VR Equipment", labelZh: "VR设备", icon: "🥽" },
  { id: "karaoke", label: "Karaoke", labelZh: "KTV", icon: "🎤" },
  { id: "jacuzzi", label: "Jacuzzi", labelZh: "按摩浴缸", icon: "🛁" },
  { id: "theme_room", label: "Themed Room", labelZh: "主题房", icon: "🎭" },
];

// Helper: map HotelCategory to BudgetHotelType (for backward compatibility)
export function categoryToBudgetType(category: HotelCategory): BudgetHotelType | null {
  const mapping: Record<string, BudgetHotelType> = {
    budget: "economy_hotel",
    youth_hostel: "budget_hostel",
  };
  return mapping[category] ?? null;
}

// Helper: get all categories as an array
export function getAllCategories(): HotelCategory[] {
  return ["luxury", "mid_range", "budget", "youth_hostel", "love_hotel", "gaming_hotel"];
}

// Filter state for the new Hotel type
export interface HotelFilterState {
  categories: HotelCategory[];
  priceRange: [number, number] | null;
  minRating: number | null;
  metroNearby: boolean;
  foreignerFriendly: boolean;
  amenities: string[];
  searchQuery: string;
}

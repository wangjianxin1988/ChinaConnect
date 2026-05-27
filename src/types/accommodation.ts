/**
 * Budget Hotel Accommodation Types
 * Types for平价酒店 (affordable/budget hotels) module
 */

// Budget hotel type classification
export type BudgetHotelType = "budget_hostel" | "economy_hotel" | "motel";

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

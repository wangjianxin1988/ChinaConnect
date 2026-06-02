/**
 * ChinaConnect User Membership System Types
 * Database types for membership, wallet, orders, AI routes, and favorites
 *
 * Generated from: supabase/migrations/20260531_user_system.sql
 * Extends: existing profiles, ai_conversations, bookmarks tables
 */

import type { Json } from "@/types/database";

// ============================================================
// Membership Tiers
// ============================================================

export type MembershipTierSlug = "free" | "pro" | "enterprise";

export interface MembershipTier {
  id: string;
  name: string;
  slug: MembershipTierSlug;
  description: string | null;
  description_zh: string | null;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  ai_requests_daily: number;    // -1 = unlimited
  ai_requests_monthly: number;  // -1 = unlimited
  max_saved_routes: number;     // -1 = unlimited
  max_conversations: number;    // -1 = unlimited
  max_favorites: number;        // -1 = unlimited
  features: TierFeatures;
  display_order: number;
  badge_color: string | null;
  icon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TierFeatures {
  route_export: boolean;
  priority_support: boolean;
  advanced_ai_model: boolean;
  group_planning: boolean;
  offline_access: boolean;
}

// ============================================================
// User Memberships
// ============================================================

export type MembershipStatus =
  | "active"
  | "expired"
  | "cancelled"
  | "suspended"
  | "pending_payment";

export type BillingCycle = "monthly" | "yearly" | "lifetime" | "trial";

export interface UserMembership {
  id: string;
  user_id: string;
  tier_id: string;
  status: MembershipStatus;
  billing_cycle: BillingCycle | null;
  started_at: string;
  expires_at: string | null;
  cancelled_at: string | null;
  auto_renew: boolean;
  order_id: string | null;
  ai_requests_used_today: number;
  ai_requests_used_month: number;
  daily_reset_at: string;
  monthly_reset_at: string;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

// Joined view with tier details
export interface UserMembershipWithTier extends UserMembership {
  tier: MembershipTier;
}

// ============================================================
// Wallets
// ============================================================

export type WalletStatus = "active" | "frozen" | "closed";

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  frozen_amount: number;
  currency: string;
  total_recharged: number;
  total_consumed: number;
  status: WalletStatus;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Wallet Transactions
// ============================================================

export type TransactionType =
  | "recharge"
  | "consumption"
  | "refund"
  | "reward"
  | "adjustment"
  | "withdrawal";

export type TransactionReferenceType =
  | "order"
  | "ai_usage"
  | "admin"
  | "reward"
  | "refund";

export type TransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "reversed";

export type PaymentChannel =
  | "alipay"
  | "wechat_pay"
  | "creem"
  | "apple_pay"
  | "admin";

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  type: TransactionType;
  amount: number;        // positive = credit, negative = debit
  balance_before: number;
  balance_after: number;
  description: string | null;
  description_zh: string | null;
  reference_type: TransactionReferenceType | null;
  reference_id: string | null;
  payment_channel: PaymentChannel | null;
  external_txn_id: string | null;
  status: TransactionStatus;
  metadata: Json;
  created_at: string;
}

// ============================================================
// Orders
// ============================================================

export type OrderType =
  | "recharge"
  | "membership_upgrade"
  | "membership_renew"
  | "membership_new";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded"
  | "partially_refunded";

export interface Order {
  id: string;
  user_id: string;
  order_type: OrderType;
  order_number: string;
  amount: number;
  currency: string;
  discount_amount: number;
  final_amount: number;
  tier_id: string | null;
  billing_cycle: BillingCycle | null;
  status: OrderStatus;
  payment_method: PaymentChannel | null;
  payment_provider: string | null;
  external_order_id: string | null;
  paid_at: string | null;
  completed_at: string | null;
  coupon_code: string | null;
  coupon_discount: number;
  description: string | null;
  metadata: Json;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

// Order with joined tier info
export interface OrderWithTier extends Order {
  tier: Pick<MembershipTier, "id" | "name" | "slug"> | null;
}

// ============================================================
// AI Routes
// ============================================================

export type RouteStatus = "saved" | "published" | "archived";

export type TravelStyle =
  | "budget"
  | "comfort"
  | "luxury"
  | "adventure"
  | "cultural"
  | "foodie"
  | "family";

export interface AIRoute {
  id: string;
  user_id: string;
  conversation_id: string | null;
  title: string;
  title_zh: string | null;
  summary: string | null;
  summary_zh: string | null;
  city_id: string | null;
  city_ids: string[];
  start_date: string | null;
  end_date: string | null;
  days: number | null;
  route_data: RouteData;
  tags: string[];
  travel_style: TravelStyle | null;
  is_public: boolean;
  is_featured: boolean;
  status: RouteStatus;
  likes_count: number;
  views_count: number;
  saves_count: number;
  ai_model: string | null;
  ai_provider: string | null;
  generation_tokens: number | null;
  created_at: string;
  updated_at: string;
}

export interface RouteData {
  days: RouteDay[];
  total_estimated_cost: number | null;
  transport_summary: TransportSegment[];
  highlights: string[];
  tips: string[];
}

export interface RouteDay {
  day_number: number;
  city: string;
  city_zh?: string;
  theme?: string;
  activities: RouteActivity[];
  meals?: RouteMeal[];
  accommodation?: string;
  estimated_cost?: number;
  notes?: string;
}

export interface RouteActivity {
  time: string;           // "09:00"
  title: string;
  title_zh?: string;
  location: string;
  location_zh?: string;
  lat?: number;
  lng?: number;
  duration_minutes: number;
  description?: string;
  cost_estimate?: number;
  booking_required?: boolean;
  tips?: string[];
}

export interface RouteMeal {
  type: "breakfast" | "lunch" | "dinner" | "snack";
  restaurant?: string;
  restaurant_zh?: string;
  cuisine?: string;
  cost_estimate?: number;
  recommendation?: string;
}

export interface TransportSegment {
  from: string;
  to: string;
  mode: "walk" | "taxi" | "metro" | "bus" | "train" | "flight" | "bike";
  duration_minutes: number;
  cost_estimate?: number;
  notes?: string;
}

// ============================================================
// AI Conversation Snapshots
// ============================================================

export type SnapshotType =
  | "auto"
  | "manual"
  | "crash_recovery"
  | "end_of_conversation";

export interface AIConversationSnapshot {
  id: string;
  conversation_id: string;
  user_id: string;
  messages: SnapshotMessage[];
  snapshot_type: SnapshotType;
  message_count: number;
  total_tokens: number;
  conversation_context: Json;
  is_latest: boolean;
  created_at: string;
}

export interface SnapshotMessage {
  role: "user" | "assistant" | "system";
  content: string;
  tokens_used?: number;
  created_at?: string;
}

// ============================================================
// Extended Profile (additions from migration)
// ============================================================

export interface ProfileMembershipFields {
  bio: string | null;
  membership_tier: MembershipTierSlug;
  wallet_balance: number;
  onboarding_completed: boolean;
  last_active_at: string;
  signup_source: string | null;
}

// ============================================================
// Extended AI Conversation (additions from migration)
// ============================================================

export interface AIConversationExtensions {
  route_id: string | null;
  status: "active" | "completed" | "archived";
  is_route_saved: boolean;
  total_tokens: number;
  last_snapshot_at: string | null;
}

// ============================================================
// Extended Bookmark (new favorite types)
// ============================================================

export type FavoriteType =
  | "attraction"
  | "restaurant"
  | "itinerary"
  | "post"
  | "city"
  | "food"
  | "app_info"
  | "route";

// ============================================================
// Views: Dashboard
// ============================================================

export interface UserDashboardView {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  membership_tier: MembershipTierSlug;
  points: number;
  travel_level: number;
  wallet_balance: number;
  tier_name: string;
  tier_slug: MembershipTierSlug;
  ai_daily_limit: number;
  ai_used_today: number;
  ai_monthly_limit: number;
  ai_used_month: number;
  saved_routes: number;
  favorites_count: number;
  conversations_count: number;
  membership_expires_at: string | null;
  last_active_at: string;
}

// ============================================================
// Views: Order Summary
// ============================================================

export interface OrderSummaryView {
  id: string;
  user_id: string;
  order_number: string;
  order_type: OrderType;
  amount: number;
  final_amount: number;
  currency: string;
  status: OrderStatus;
  payment_method: PaymentChannel | null;
  paid_at: string | null;
  completed_at: string | null;
  tier_name: string | null;
  billing_cycle: BillingCycle | null;
  user_display_name: string | null;
  user_avatar: string | null;
  created_at: string;
}

// ============================================================
// RPC Function Return Types
// ============================================================

export interface UserMembershipInfo {
  tier_name: string;
  tier_slug: MembershipTierSlug;
  ai_daily_limit: number;
  ai_monthly_limit: number;
  ai_used_today: number;
  ai_used_month: number;
  max_saved_routes: number;
  max_favorites: number;
  features: TierFeatures;
  expires_at: string | null;
  is_active: boolean;
}

// ============================================================
// Constants
// ============================================================

export const TIER_LIMITS: Record<
  MembershipTierSlug,
  {
    aiDaily: number;
    aiMonthly: number;
    maxRoutes: number;
    maxConversations: number;
    maxFavorites: number;
    priceMonthly: number;
    priceYearly: number;
  }
> = {
  free: {
    aiDaily: 10,
    aiMonthly: 200,
    maxRoutes: 5,
    maxConversations: 20,
    maxFavorites: 50,
    priceMonthly: 0,
    priceYearly: 0,
  },
  pro: {
    aiDaily: 100,
    aiMonthly: 3000,
    maxRoutes: 50,
    maxConversations: 200,
    maxFavorites: 500,
    priceMonthly: 29,
    priceYearly: 290,
  },
  enterprise: {
    aiDaily: -1, // unlimited
    aiMonthly: -1,
    maxRoutes: -1,
    maxConversations: -1,
    maxFavorites: -1,
    priceMonthly: 99,
    priceYearly: 990,
  },
} as const;

/** -1 means unlimited */
export const isUnlimited = (value: number): boolean => value === -1;

/** Check if a limit has been reached */
export const isLimitReached = (used: number, limit: number): boolean => {
  if (limit === -1) return false; // unlimited
  return used >= limit;
};

/** Format balance for display (e.g., "¥128.50") */
export const formatBalance = (
  amount: number,
  currency: string = "CNY"
): string => {
  const symbols: Record<string, string> = {
    CNY: "¥",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };
  const symbol = symbols[currency] ?? currency + " ";
  return `${symbol}${amount.toFixed(2)}`;
};

/** Generate a human-readable order number */
export const generateOrderNumber = (): string => {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CC${datePart}${randPart}`;
};

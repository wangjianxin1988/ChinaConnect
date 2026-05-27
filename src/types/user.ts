/**
 * ChinaConnect User System Types
 * User, Profile, Badge, Points History types
 */

import type { UserLevel } from "@/types/database";

// ============================================
// Core User Types
// ============================================

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  nationality: string | null;
  bio: string | null;
  level: UserLevel;
  points: number;
  posts_count: number;
  check_ins_count: number;
  likes_received: number;
  best_answers: number;
  native_language: string;
  travel_level: number;
  badges: string[];
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

// Re-export from database types
export type { UserLevel };

// ============================================
// User Preferences
// ============================================

export interface UserPreferences {
  language: "en" | "zh" | "ja" | "ko";
  currency: "CNY" | "USD" | "EUR" | "JPY" | "KRW";
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  likes: boolean;
  comments: boolean;
  checkInReminders: boolean;
  weeklyDigest: boolean;
}

export interface PrivacySettings {
  showProfile: boolean;
  showTravelHistory: boolean;
  showBadges: boolean;
}

// ============================================
// Badge System
// ============================================

export type BadgeCategory = "exploration" | "food" | "social" | "achievement" | "streak";

export type BadgeTier = "bronze" | "silver" | "gold" | "platinum";

export interface Badge {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  icon: string;
  category: BadgeCategory;
  tier: "bronze" | "silver" | "gold" | "platinum";
  requirement: BadgeRequirement;
  points: number;
  rarity: number; // 1-100, percentage of users who have it
}

export interface BadgeRequirement {
  type: "check_ins" | "posts" | "likes" | "streak" | "cities" | "restaurants" | "achievement";
  count: number;
  target?: string; // e.g., city slug for city-specific badges
}

export interface EarnedBadge extends Omit<Badge, "rarity"> {
  earned_at: string;
  display_order: number;
}

// ============================================
// Points System
// ============================================

export interface PointsHistory {
  id: string;
  user_id: string;
  points: number;
  action: PointsAction;
  description: string;
  descriptionZh: string;
  reference_id: string | null;
  reference_type: PointsReferenceType | null;
  created_at: string;
}

export type PointsAction =
  | "check_in"
  | "post"
  | "like_received"
  | "like_given"
  | "best_answer"
  | "streak_bonus"
  | "daily_login"
  | "badge_earned"
  | "referral"
  | "review";

export type PointsReferenceType = "check_in" | "post" | "comment" | "badge" | "streak" | "user";

// Points configuration
export const POINTS_CONFIG = {
  // Actions
  CHECK_IN: 5,
  POST: 10,
  LIKE_RECEIVED: 2,
  LIKE_GIVEN: 1,
  BEST_ANSWER: 50,
  DAILY_LOGIN: 1,
  STREAK_BONUS: 10,
  BADGE_EARNED: 20,
  REFERRAL: 50,
  REVIEW: 5,

  // Streak multipliers
  STREAK_THRESHOLDS: [3, 7, 30, 100] as const,
  STREAK_MULTIPLIERS: [1, 1.5, 2, 3] as const,

  // Level thresholds
  LEVEL_THRESHOLDS: {
    小白: 0,
    探索者: 100,
    旅行家: 500,
    中国通: 1000,
    传奇: 5000,
  },
} as const;

// ============================================
// Leaderboard
// ============================================

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  level: UserLevel;
  points: number;
  check_ins_count: number;
}

export interface LeaderboardFilters {
  period: "all" | "monthly" | "weekly";
  category?: "points" | "check_ins" | "posts";
  limit?: number;
  offset?: number;
}

// ============================================
// Auth Types
// ============================================

export type AuthProvider = "google" | "github" | "email";

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
}

export interface AuthError {
  code: string;
  message: string;
  details?: unknown;
}

export interface SignInOptions {
  provider?: AuthProvider;
  email?: string;
  password?: string;
  magicLink?: boolean;
  redirectTo?: string;
}

export interface SignUpData {
  email: string;
  password?: string;
  displayName?: string;
  nationality?: string;
  nativeLanguage?: string;
}

// ============================================
// Gamification State
// ============================================

export interface GamificationState {
  points: number;
  level: UserLevel;
  pointsToNextLevel: number | null;
  currentStreak: number;
  longestStreak: number;
  badges: EarnedBadge[];
  recentPoints: PointsHistory[];
  isLoading: boolean;
}

export interface StreakData {
  current: number;
  longest: number;
  lastCheckIn: string | null;
  checkInsToday: number;
}

// ============================================
// Favorite Types
// ============================================

export type FavoriteType = "city" | "restaurant" | "hotel" | "attraction";

export interface FavoriteItem {
  id: string;
  type: FavoriteType;
  reference_id: string;
  name: string;
  nameZh?: string;
  image_url?: string;
  rating?: number;
  added_at: string;
  note?: string;
  tags: string[];
}

// ============================================
// Conversation History
// ============================================

export interface ConversationSummary {
  id: string;
  user_id: string;
  title: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  tokens_used: number | null;
  created_at: string;
}

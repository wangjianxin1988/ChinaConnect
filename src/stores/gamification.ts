/**
 * Gamification Store (Zustand)
 * Centralized state management for points, levels, badges, and streaks
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EarnedBadge, LeaderboardEntry, PointsHistory, PointsAction, PointsReferenceType, GamificationState, UserLevel } from "@/types/user";
import { POINTS_CONFIG } from "@/types/user";
import { calculateLevel, getPointsToNextLevel, LEVEL_THRESHOLDS } from "@/types/database";

// ============================================
// Store Types
// ============================================

interface GamificationStore extends GamificationState {
  // Computed
  isDemoMode: boolean;

  // Actions
  addPoints: (
    action: PointsAction,
    description: string,
    descriptionZh: string,
    referenceId?: string,
    referenceType?: PointsReferenceType,
  ) => void;
  setPoints: (points: number) => void;
  setLevel: (level: UserLevel) => void;
  setStreak: (current: number, longest: number) => void;
  addBadge: (badge: EarnedBadge) => void;
  setBadges: (badges: EarnedBadge[]) => void;
  addPointsHistory: (entry: PointsHistory) => void;
  setPointsHistory: (history: PointsHistory[]) => void;
  setLeaderboard: (entries: LeaderboardEntry[]) => void;
  resetGamification: () => void;
  loadFromProfile: (profile: {
    points: number;
    level: UserLevel;
    badges: string[];
  }) => void;
}

// ============================================
// Badge Definitions (mirrored from useGamification)
// ============================================

interface BadgeDefinition {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  icon: string;
  category: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  points: number;
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: "first_checkin",
    name: "First Steps",
    nameZh: "初来乍到",
    description: "Complete your first check-in",
    descriptionZh: "完成你的第一次签到",
    icon: "map-pin",
    category: "exploration",
    tier: "bronze",
    points: 10,
  },
  {
    id: "explorer_10",
    name: "Explorer",
    nameZh: "探索者",
    description: "Check in at 10 different places",
    descriptionZh: "在10个不同地点签到",
    icon: "compass",
    category: "exploration",
    tier: "bronze",
    points: 50,
  },
  {
    id: "globetrotter_50",
    name: "Globetrotter",
    nameZh: "环球旅行者",
    description: "Check in at 50 different places",
    descriptionZh: "在50个不同地点签到",
    icon: "globe",
    category: "exploration",
    tier: "silver",
    points: 200,
  },
  {
    id: "world_traveler_100",
    name: "World Traveler",
    nameZh: "世界旅行家",
    description: "Check in at 100 different places",
    descriptionZh: "在100个不同地点签到",
    icon: "plane",
    category: "exploration",
    tier: "gold",
    points: 500,
  },
  {
    id: "foodie_10",
    name: "Foodie",
    nameZh: "美食家",
    description: "Favorite 10 restaurants",
    descriptionZh: "收藏10家餐厅",
    icon: "utensils",
    category: "food",
    tier: "bronze",
    points: 50,
  },
  {
    id: "streak_3",
    name: "Getting Started",
    nameZh: "小试牛刀",
    description: "Check in 3 days in a row",
    descriptionZh: "连续签到3天",
    icon: "flame",
    category: "streak",
    tier: "bronze",
    points: 20,
  },
  {
    id: "streak_7",
    name: "Week Warrior",
    nameZh: "坚持一周",
    description: "Check in 7 days in a row",
    descriptionZh: "连续签到7天",
    icon: "calendar",
    category: "streak",
    tier: "silver",
    points: 50,
  },
  {
    id: "streak_30",
    name: "Monthly Master",
    nameZh: "月度大师",
    description: "Check in 30 days in a row",
    descriptionZh: "连续签到30天",
    icon: "trophy",
    category: "streak",
    tier: "gold",
    points: 200,
  },
  {
    id: "first_post",
    name: "Storyteller",
    nameZh: "讲述者",
    description: "Create your first post",
    descriptionZh: "创建你的第一篇帖子",
    icon: "pen",
    category: "social",
    tier: "bronze",
    points: 20,
  },
  {
    id: "liked_100",
    name: "Appreciated",
    nameZh: "受赞赏",
    description: "Receive 100 likes",
    descriptionZh: "收到100个赞",
    icon: "heart",
    category: "social",
    tier: "bronze",
    points: 100,
  },
];

// ============================================
// Initial State
// ============================================

const initialState: GamificationState & { isDemoMode: boolean } = {
  points: 0,
  level: "小白",
  pointsToNextLevel: 100,
  currentStreak: 0,
  longestStreak: 0,
  badges: [],
  recentPoints: [],
  isLoading: false,
  isDemoMode: !import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL === "your-project-url",
};

// ============================================
// Store Implementation
// ============================================

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Add points with action multiplier
      addPoints: (action, description, descriptionZh, referenceId, referenceType) => {
        const state = get();
        let pointsAmount: number;

        switch (action) {
          case "check_in":
            pointsAmount = POINTS_CONFIG.CHECK_IN;
            break;
          case "post":
            pointsAmount = POINTS_CONFIG.POST;
            break;
          case "like_received":
            pointsAmount = POINTS_CONFIG.LIKE_RECEIVED;
            break;
          case "like_given":
            pointsAmount = POINTS_CONFIG.LIKE_GIVEN;
            break;
          case "best_answer":
            pointsAmount = POINTS_CONFIG.BEST_ANSWER;
            break;
          case "daily_login":
            pointsAmount = POINTS_CONFIG.DAILY_LOGIN;
            break;
          case "streak_bonus":
            pointsAmount = POINTS_CONFIG.STREAK_BONUS;
            break;
          case "badge_earned":
            pointsAmount = POINTS_CONFIG.BADGE_EARNED;
            break;
          case "review":
            pointsAmount = POINTS_CONFIG.REVIEW;
            break;
          default:
            pointsAmount = 0;
        }

        // Apply streak multiplier
        let multiplier = 1;
        for (let i = 0; i < POINTS_CONFIG.STREAK_THRESHOLDS.length; i++) {
          if (state.currentStreak >= POINTS_CONFIG.STREAK_THRESHOLDS[i]) {
            multiplier = POINTS_CONFIG.STREAK_MULTIPLIERS[i];
          }
        }

        const finalPoints = Math.round(pointsAmount * multiplier);
        const newTotal = state.points + finalPoints;
        const newLevel = calculateLevel(newTotal);
        const nextLevel = getPointsToNextLevel(newTotal);

        // Create history entry
        const entry: PointsHistory = {
          id: crypto.randomUUID(),
          user_id: "current-user", // Will be replaced with actual user ID
          points: finalPoints,
          action,
          description,
          descriptionZh,
          reference_id: referenceId || null,
          reference_type: referenceType || null,
          created_at: new Date().toISOString(),
        };

        set({
          points: newTotal,
          level: newLevel,
          pointsToNextLevel: nextLevel,
          recentPoints: [...state.recentPoints.slice(-49), entry], // Keep last 50
        });
      },

      setPoints: (points) => {
        set({
          points,
          level: calculateLevel(points),
          pointsToNextLevel: getPointsToNextLevel(points),
        });
      },

      setLevel: (level) => {
        set({ level });
      },

      setStreak: (current, longest) => {
        set({
          currentStreak: current,
          longestStreak: Math.max(longest, current),
        });
      },

      addBadge: (badge) => {
        const state = get();
        const exists = state.badges.some((b) => b.id === badge.id);
        if (!exists) {
          set({
            badges: [...state.badges, badge],
          });
        }
      },

      setBadges: (badges) => {
        set({ badges });
      },

      addPointsHistory: (entry) => {
        const state = get();
        set({
          recentPoints: [...state.recentPoints.slice(-49), entry],
        });
      },

      setPointsHistory: (history) => {
        set({ recentPoints: history });
      },

      setLeaderboard: (entries) => {
        set({ leaderboard: entries });
      },

      resetGamification: () => {
        set({
          points: 0,
          level: "小白",
          pointsToNextLevel: 100,
          currentStreak: 0,
          longestStreak: 0,
          badges: [],
          recentPoints: [],
        });
      },

      loadFromProfile: (profile) => {
        const newLevel = profile.level || calculateLevel(profile.points);
        set({
          points: profile.points,
          level: newLevel,
          pointsToNextLevel: getPointsToNextLevel(profile.points),
        });
      },
    }),
    {
      name: "chinaconnect-gamification",
      partialize: (state) => ({
        points: state.points,
        level: state.level,
        pointsToNextLevel: state.pointsToNextLevel,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        badges: state.badges,
        recentPoints: state.recentPoints,
      }),
    },
  ),
);

// ============================================
// Selector Hooks
// ============================================

export const usePoints = () => useGamificationStore((state) => state.points);
export const useLevel = () => useGamificationStore((state) => state.level);
export const useStreak = () => useGamificationStore((state) => ({
  current: state.currentStreak,
  longest: state.longestStreak,
}));
export const useBadges = () => useGamificationStore((state) => state.badges);
export const useRecentPoints = () => useGamificationStore((state) => state.recentPoints);
export const useLeaderboard = () => useGamificationStore((state) => state.leaderboard);
export const useIsDemoMode = () => useGamificationStore((state) => state.isDemoMode);

// ============================================
// Gamification Actions
// ============================================

export const gamificationActions = {
  // Check-in action
  async performCheckIn(): Promise<void> {
    const { addPoints, setStreak, addBadge } = useGamificationStore.getState();

    // Add points
    addPoints("check_in", "Daily check-in", "每日签到");

    // Update streak
    const today = new Date().toDateString();
    const state = useGamificationStore.getState();
    const lastCheckIn = state.recentPoints.find((p) => p.action === "check_in")?.created_at;
    const lastDate = lastCheckIn ? new Date(lastCheckIn).toDateString() : null;

    let newStreak = 1;
    if (lastDate === today) {
      newStreak = state.currentStreak;
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastDate === yesterday.toDateString()) {
        newStreak = state.currentStreak + 1;
      }
    }

    setStreak(newStreak, Math.max(state.longestStreak, newStreak));

    // Check for streak badges
    const badgeDef = BADGE_DEFINITIONS.find(
      (b) => b.id === `streak_${newStreak}` && b.category === "streak",
    );
    if (badgeDef) {
      addBadge({
        ...badgeDef,
        requirement: { type: "streak", count: newStreak },
        earned_at: new Date().toISOString(),
        display_order: state.badges.length,
      });
    }
  },

  // Post action
  performPost(): void {
    useGamificationStore.getState().addPoints(
      "post",
      "Created a new post",
      "发布了新帖子",
    );
  },

  // Like received action
  performLikeReceived(): void {
    useGamificationStore.getState().addPoints(
      "like_received",
      "Received a like",
      "收到一个赞",
    );
  },

  // Daily login
  performDailyLogin(): void {
    useGamificationStore.getState().addPoints(
      "daily_login",
      "Daily login bonus",
      "每日登录奖励",
    );
  },
};

// ============================================
// Export badge definitions
// ============================================

export { BADGE_DEFINITIONS };
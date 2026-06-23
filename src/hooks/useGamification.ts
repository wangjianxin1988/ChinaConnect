// @ts-nocheck
/**
 * useGamification Hook
 * Manages points, badges, streaks, and leaderboard
 */

import { authClient } from "@/services/auth";
import { getPointsToNextLevel } from "@/types/database";
import type {
  Badge,
  EarnedBadge,
  LeaderboardEntry,
  LeaderboardFilters,
  PointsAction,
  PointsHistory,
  PointsReferenceType,
  StreakData,
  UserLevel,
} from "@/types/user";
import { POINTS_CONFIG } from "@/types/user";
import { useCallback, useEffect, useState } from "react";

// ============================================
// Helper Types
// ============================================

interface ProfilePointsData {
  points: number | null;
  level: UserLevel | null;
  badges: string[] | null;
}

interface ProfileStatsData {
  check_ins_count: number | null;
  posts_count: number | null;
  likes_received: number | null;
  badges: string[] | null;
}

// ============================================
// Hook Types
// ============================================

export interface UseGamificationOptions {
  userId?: string;
  autoLoad?: boolean;
}

export interface UseGamificationReturn {
  // State
  points: number;
  level: UserLevel;
  pointsToNextLevel: number | null;
  currentStreak: number;
  longestStreak: number;
  badges: EarnedBadge[];
  recentPoints: PointsHistory[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addPoints: (
    action: PointsAction,
    description: string,
    descriptionZh: string,
    referenceId?: string,
    referenceType?: PointsReferenceType,
  ) => Promise<boolean>;
  checkAndAwardBadges: () => Promise<EarnedBadge[]>;
  getStreakData: () => Promise<StreakData>;
  updateStreak: () => Promise<boolean>;
  fetchLeaderboard: (filters?: LeaderboardFilters) => Promise<void>;
  refreshGamification: () => Promise<void>;
}

// ============================================
// Badge Definitions
// ============================================

const BADGES: Badge[] = [
  {
    id: "first_checkin",
    name: "First Steps",
    nameZh: "初来乍到",
    description: "Complete your first check-in",
    descriptionZh: "完成你的第一次签到",
    icon: "map-pin",
    category: "exploration",
    tier: "bronze",
    requirement: { type: "check_ins", count: 1 },
    points: 10,
    rarity: 80,
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
    requirement: { type: "check_ins", count: 10 },
    points: 50,
    rarity: 45,
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
    requirement: { type: "check_ins", count: 50 },
    points: 200,
    rarity: 15,
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
    requirement: { type: "check_ins", count: 100 },
    points: 500,
    rarity: 5,
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
    requirement: { type: "restaurants", count: 10 },
    points: 50,
    rarity: 40,
  },
  {
    id: "food_critic_50",
    name: "Food Critic",
    nameZh: "美食评论家",
    description: "Favorite 50 restaurants",
    descriptionZh: "收藏50家餐厅",
    icon: "star",
    category: "food",
    tier: "silver",
    requirement: { type: "restaurants", count: 50 },
    points: 200,
    rarity: 10,
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
    requirement: { type: "streak", count: 3 },
    points: 20,
    rarity: 60,
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
    requirement: { type: "streak", count: 7 },
    points: 50,
    rarity: 35,
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
    requirement: { type: "streak", count: 30 },
    points: 200,
    rarity: 10,
  },
  {
    id: "streak_100",
    name: "Legend",
    nameZh: "传奇",
    description: "Check in 100 days in a row",
    descriptionZh: "连续签到100天",
    icon: "crown",
    category: "streak",
    tier: "platinum",
    requirement: { type: "streak", count: 100 },
    points: 1000,
    rarity: 1,
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
    requirement: { type: "posts", count: 1 },
    points: 20,
    rarity: 70,
  },
  {
    id: "posts_10",
    name: "Contributor",
    nameZh: "贡献者",
    description: "Create 10 posts",
    descriptionZh: "创建10篇帖子",
    icon: "book",
    category: "social",
    tier: "silver",
    requirement: { type: "posts", count: 10 },
    points: 100,
    rarity: 25,
  },
  {
    id: "posts_50",
    name: "Prolific Writer",
    nameZh: "多产作家",
    description: "Create 50 posts",
    descriptionZh: "创建50篇帖子",
    icon: "feather",
    category: "social",
    tier: "gold",
    requirement: { type: "posts", count: 50 },
    points: 400,
    rarity: 8,
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
    requirement: { type: "likes", count: 100 },
    points: 100,
    rarity: 30,
  },
];

// ============================================
// Storage Keys
// ============================================

const STREAK_KEY = "chinaconnect-streak";
const POINTS_HISTORY_KEY = "chinaconnect-points-history";
const EARNED_BADGES_KEY = "chinaconnect-earned-badges";
const _LAST_CHECKIN_KEY = "chinaconnect-last-checkin";

// ============================================
// Helper Functions
// ============================================

function getStreakFromStorage(): StreakData {
  if (typeof window === "undefined") {
    return { current: 0, longest: 0, lastCheckIn: null, checkInsToday: 0 };
  }

  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) {
      return { current: 0, longest: 0, lastCheckIn: null, checkInsToday: 0 };
    }

    const data = JSON.parse(raw) as StreakData & { lastCheckInDate?: string };

    // Check if last check-in was today
    const today = new Date().toDateString();
    const lastDate = data.lastCheckIn ? new Date(data.lastCheckIn).toDateString() : null;
    const checkInsToday = lastDate === today ? data.checkInsToday : 0;

    return {
      ...data,
      checkInsToday,
    };
  } catch {
    return { current: 0, longest: 0, lastCheckIn: null, checkInsToday: 0 };
  }
}

function saveStreakToStorage(streak: StreakData): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  } catch {
    // ignore
  }
}

function getPointsHistoryFromStorage(): PointsHistory[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(POINTS_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePointsHistoryToStorage(history: PointsHistory[]): void {
  if (typeof window === "undefined") return;

  try {
    // Keep only last 100 entries
    const trimmed = history.slice(-100);
    localStorage.setItem(POINTS_HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
}

function getEarnedBadgesFromStorage(): EarnedBadge[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(EARNED_BADGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEarnedBadgesToStorage(badges: EarnedBadge[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(EARNED_BADGES_KEY, JSON.stringify(badges));
  } catch {
    // ignore
  }
}

// ============================================
// Hook Implementation
// ============================================

export function useGamification(options: UseGamificationOptions = {}): UseGamificationReturn {
  const { userId, autoLoad = true } = options;

  // State
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState<UserLevel>("小白");
  const [pointsToNextLevel, setPointsToNextLevel] = useState<number | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [badges, setBadges] = useState<EarnedBadge[]>([]);
  const [recentPoints, setRecentPoints] = useState<PointsHistory[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // Initial Load
  // ============================================

  useEffect(() => {
    if (autoLoad && userId) {
      loadGamificationData();
    } else if (autoLoad && !userId) {
      // Load from local storage for non-authenticated users
      loadLocalGamificationData();
    }
  }, [autoLoad, userId]);

  async function loadGamificationData() {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load profile for points/level
      const { data: profileData } = (await authClient
        .from("profiles")
        .select("points, level, badges")
        .eq("user_id", userId)
        .single()) as { data: ProfilePointsData | null };

      if (profileData) {
        setPoints(profileData.points ?? 0);
        setLevel(profileData.level ?? "小白");
        setPointsToNextLevel(getPointsToNextLevel(profileData.points ?? 0));
      }

      // Load streak from local storage
      const streakData = getStreakFromStorage();
      setCurrentStreak(streakData.current);
      setLongestStreak(streakData.longest);

      // Load badges from local storage
      const earnedBadges = getEarnedBadgesFromStorage();
      setBadges(earnedBadges);

      // Load recent points from local storage
      const pointsHistory = getPointsHistoryFromStorage();
      setRecentPoints(pointsHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load gamification data");
    } finally {
      setIsLoading(false);
    }
  }

  function loadLocalGamificationData() {
    const streakData = getStreakFromStorage();
    setCurrentStreak(streakData.current);
    setLongestStreak(streakData.longest);

    const earnedBadges = getEarnedBadgesFromStorage();
    setBadges(earnedBadges);

    const pointsHistory = getPointsHistoryFromStorage();
    setRecentPoints(pointsHistory);
  }

  // ============================================
  // Actions
  // ============================================

  const addPoints = useCallback(
    async (
      action: PointsAction,
      description: string,
      descriptionZh: string,
      referenceId?: string,
      referenceType?: PointsReferenceType,
    ): Promise<boolean> => {
      try {
        setError(null);

        // Calculate points for action
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
        const streakData = getStreakFromStorage();
        let multiplier = 1;
        for (let i = 0; i < POINTS_CONFIG.STREAK_THRESHOLDS.length; i++) {
          if (streakData.current >= POINTS_CONFIG.STREAK_THRESHOLDS[i]) {
            multiplier = POINTS_CONFIG.STREAK_MULTIPLIERS[i];
          }
        }
        const finalPoints = Math.round(pointsAmount * multiplier);

        // Create points history entry
        const entry: PointsHistory = {
          id: crypto.randomUUID(),
          user_id: userId || "anonymous",
          points: finalPoints,
          action,
          description,
          descriptionZh,
          reference_id: referenceId || null,
          reference_type: referenceType || null,
          created_at: new Date().toISOString(),
        };

        // Save to local storage
        const history = getPointsHistoryFromStorage();
        history.push(entry);
        savePointsHistoryToStorage(history);
        setRecentPoints(history);

        // Update points in state
        const newTotal = points + finalPoints;
        setPoints(newTotal);
        setPointsToNextLevel(getPointsToNextLevel(newTotal));

        // Update profile in Supabase if authenticated
        if (userId) {
          await authClient.from("profiles").update({ points: newTotal }).eq("user_id", userId);
        }

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add points");
        return false;
      }
    },
    [userId, points],
  );

  const checkAndAwardBadges = useCallback(async (): Promise<EarnedBadge[]> => {
    if (!userId) return [];

    try {
      setError(null);

      // Get current profile stats
      const { data: profileData } = (await authClient
        .from("profiles")
        .select("check_ins_count, posts_count, likes_received, badges")
        .eq("user_id", userId)
        .single()) as { data: ProfileStatsData | null };

      if (!profileData) return [];

      const stats = {
        checkIns: profileData.check_ins_count ?? 0,
        posts: profileData.posts_count ?? 0,
        likes: profileData.likes_received ?? 0,
      };

      const earnedBadges = getEarnedBadgesFromStorage();
      const earnedBadgeIds = new Set(earnedBadges.map((b) => b.id));
      const newBadges: EarnedBadge[] = [];

      // Check each badge
      for (const badge of BADGES) {
        if (earnedBadgeIds.has(badge.id)) continue;

        let qualifies = false;

        switch (badge.requirement.type) {
          case "check_ins":
            qualifies = stats.checkIns >= badge.requirement.count;
            break;
          case "posts":
            qualifies = stats.posts >= badge.requirement.count;
            break;
          case "likes":
            qualifies = stats.likes >= badge.requirement.count;
            break;
          case "streak": {
            const streak = getStreakFromStorage();
            qualifies = streak.current >= badge.requirement.count;
            break;
          }
        }

        if (qualifies) {
          const earned: EarnedBadge = {
            id: badge.id,
            name: badge.name,
            nameZh: badge.nameZh,
            description: badge.description,
            descriptionZh: badge.descriptionZh,
            icon: badge.icon,
            category: badge.category,
            tier: badge.tier,
            requirement: badge.requirement,
            points: badge.points,
            earned_at: new Date().toISOString(),
            display_order: earnedBadges.length + newBadges.length,
          };

          newBadges.push(earned);
        }
      }

      // Save new badges
      if (newBadges.length > 0) {
        const allEarned = [...earnedBadges, ...newBadges];
        saveEarnedBadgesToStorage(allEarned);
        setBadges(allEarned);

        // Update profile badges in Supabase
        await authClient
          .from("profiles")
          .update({ badges: allEarned.map((b) => b.id) })
          .eq("user_id", userId);

        // Award points for each new badge
        for (const badge of newBadges) {
          await addPoints(
            "badge_earned",
            `Earned badge: ${badge.name}`,
            `获得徽章：${badge.nameZh}`,
            badge.id,
            "badge",
          );
        }
      }

      return newBadges;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check badges");
      return [];
    }
  }, [userId, addPoints]);

  const getStreakData = useCallback((): Promise<StreakData> => {
    return Promise.resolve(getStreakFromStorage());
  }, []);

  const updateStreak = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);

      const today = new Date().toDateString();
      const streak = getStreakFromStorage();
      const lastCheckInDate = streak.lastCheckIn
        ? new Date(streak.lastCheckIn).toDateString()
        : null;

      // Already checked in today
      if (lastCheckInDate === today) {
        return true;
      }

      // Calculate if streak continues
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      let newStreak: number;
      if (lastCheckInDate === yesterdayStr) {
        // Continue streak
        newStreak = streak.current + 1;
      } else if (lastCheckInDate === null) {
        // First check-in
        newStreak = 1;
      } else {
        // Streak broken, start fresh
        newStreak = 1;
      }

      const newLongest = Math.max(streak.longest, newStreak);

      const updatedStreak: StreakData = {
        current: newStreak,
        longest: newLongest,
        lastCheckIn: new Date().toISOString(),
        checkInsToday: 1,
      };

      saveStreakToStorage(updatedStreak);
      setCurrentStreak(newStreak);
      setLongestStreak(newLongest);

      // Award streak bonus points for milestones
      const streakBonus = POINTS_CONFIG.STREAK_THRESHOLDS.includes(
        newStreak as (typeof POINTS_CONFIG.STREAK_THRESHOLDS)[number],
      );
      if (streakBonus) {
        await addPoints(
          "streak_bonus",
          `Streak bonus: ${newStreak} days!`,
          `连续签到奖励：${newStreak}天！`,
        );
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update streak");
      return false;
    }
  }, [addPoints]);

  const fetchLeaderboard = useCallback(async (filters: LeaderboardFilters = {}): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const { period = "all", category = "points", limit = 10, offset = 0 } = filters;

      const query = authClient
        .from("leaderboard_view")
        .select("*")
        .order(category === "check_ins" ? "check_ins_count" : "points", {
          ascending: false,
        })
        .range(offset, offset + limit - 1);

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      const entries: LeaderboardEntry[] = (data || []).map((row, index) => ({
        rank: offset + index + 1,
        user_id: row.user_id,
        display_name: row.display_name,
        avatar_url: row.avatar_url,
        level: row.level,
        points: row.points,
        check_ins_count: row.check_ins_count,
      }));

      setLeaderboard(entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch leaderboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshGamification = useCallback(async (): Promise<void> => {
    if (userId) {
      await loadGamificationData();
    } else {
      loadLocalGamificationData();
    }
  }, [userId]);

  // ============================================
  // Return
  // ============================================

  return {
    // State
    points,
    level,
    pointsToNextLevel,
    currentStreak,
    longestStreak,
    badges,
    recentPoints,
    leaderboard,
    isLoading,
    error,

    // Actions
    addPoints,
    checkAndAwardBadges,
    getStreakData,
    updateStreak,
    fetchLeaderboard,
    refreshGamification,
  };
}

// ============================================
// Export badge definitions for other components
// ============================================

export { BADGES };

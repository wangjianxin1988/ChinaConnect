/**
 * GamificationPanel Component
 * Comprehensive gamification dashboard with points, streaks, badges, and leaderboard
 */

import { cn } from "@/lib/utils";
import { LEVEL_THRESHOLDS } from "@/types/database";
import type { EarnedBadge, GamificationState, LeaderboardEntry, UserLevel } from "@/types/user";
import { useState } from "react";
import { BadgeDisplay } from "./BadgeDisplay";
import { PointsDisplay } from "./PointsDisplay";

interface GamificationPanelProps {
  gamification: GamificationState;
  leaderboard?: LeaderboardEntry[];
  isOwnProfile?: boolean;
  onViewAllBadges?: () => void;
  onViewLeaderboard?: () => void;
  className?: string;
}

type TabType = "overview" | "badges" | "history" | "leaderboard";

export function GamificationPanel({
  gamification,
  leaderboard = [],
  isOwnProfile = true,
  onViewAllBadges,
  onViewLeaderboard,
  className,
}: GamificationPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const tabs: { id: TabType; label: string; labelZh: string }[] = [
    { id: "overview", label: "Overview", labelZh: "概览" },
    { id: "badges", label: "Badges", labelZh: "徽章" },
    { id: "history", label: "History", labelZh: "历史" },
    { id: "leaderboard", label: "Leaderboard", labelZh: "排行榜" },
  ];

  return (
    <div className={cn("bg-white rounded-xl shadow-sm border", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Gamification</h2>
        <p className="text-sm text-gray-500">Track your progress and achievements</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "overview" && (
          <OverviewTab gamification={gamification} isOwnProfile={isOwnProfile} />
        )}

        {activeTab === "badges" && (
          <BadgesTab badges={gamification.badges} onViewAll={onViewAllBadges} />
        )}

        {activeTab === "history" && <HistoryTab recentPoints={gamification.recentPoints} />}

        {activeTab === "leaderboard" && (
          <LeaderboardTab leaderboard={leaderboard} onViewAll={onViewLeaderboard} />
        )}
      </div>
    </div>
  );
}

// ============================================
// Overview Tab
// ============================================

interface OverviewTabProps {
  gamification: GamificationState;
  isOwnProfile: boolean;
}

function OverviewTab({ gamification, isOwnProfile }: OverviewTabProps) {
  const { points, level, pointsToNextLevel, currentStreak, longestStreak, badges } = gamification;

  return (
    <div className="space-y-6">
      {/* Points Card */}
      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-blue-900">Your Progress</h3>
          {currentStreak > 0 && (
            <div className="flex items-center gap-1 text-orange-600">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
              <span className="font-semibold">{currentStreak} day streak!</span>
            </div>
          )}
        </div>
        <PointsDisplay
          points={points}
          level={level}
          pointsToNextLevel={pointsToNextLevel}
          size="lg"
          showProgress
          showBreakdown
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Check-in Streak"
          value={currentStreak}
          subLabel={`Best: ${longestStreak}`}
          icon={
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
          }
          color="orange"
        />
        <StatCard
          label="Badges Earned"
          value={badges.length}
          subLabel={`${getBadgesByTier(badges).gold + getBadgesByTier(badges).platinum} gold+`}
          icon={
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          }
          color="amber"
        />
        <StatCard
          label="Points to Next"
          value={pointsToNextLevel ?? 0}
          subLabel={getNextLevelName(level)}
          icon={
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v12M6 12h12" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          label="Total Points"
          value={points}
          subLabel="Lifetime earned"
          icon={
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          }
          color="purple"
        />
      </div>

      {/* Level Progress */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Level Progress</h3>
        <LevelProgress currentLevel={level} points={points} />
      </div>
    </div>
  );
}

// ============================================
// Badges Tab
// ============================================

interface BadgesTabProps {
  badges: EarnedBadge[];
  onViewAll?: () => void;
}

function BadgesTab({ badges, onViewAll }: BadgesTabProps) {
  const sortedBadges = [...badges].sort((a, b) => {
    const tierOrder = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
    return tierOrder[a.tier] - tierOrder[b.tier];
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          {badges.length} badge{badges.length !== 1 ? "s" : ""} earned
        </p>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </button>
        )}
      </div>

      {badges.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg
            className="h-12 w-12 mx-auto mb-3 text-gray-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
          </svg>
          <p className="text-sm">No badges earned yet</p>
          <p className="text-xs text-gray-400 mt-1">Start exploring to earn badges!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {sortedBadges.map((badge) => (
            <BadgeDisplay key={badge.id} badges={[badge]} size="lg" showDetails />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// History Tab
// ============================================

interface HistoryTabProps {
  recentPoints: {
    id: string;
    points: number;
    action: string;
    description: string;
    created_at: string;
  }[];
}

function HistoryTab({ recentPoints }: HistoryTabProps) {
  if (recentPoints.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No activity yet</p>
        <p className="text-xs text-gray-400 mt-1">Start exploring to earn points!</p>
      </div>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "check_in":
        return (
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        );
      case "post":
        return (
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 19l7-7 3 3-7 7-3-3z" />
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          </svg>
        );
      case "badge_earned":
        return (
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
          </svg>
        );
      default:
        return (
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v12M6 12h12" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-3">
      {recentPoints.slice(0, 20).map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              {getActionIcon(entry.action)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{entry.description}</p>
              <p className="text-xs text-gray-500">
                {new Date(entry.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-sm font-semibold text-green-600">+{entry.points}</div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Leaderboard Tab
// ============================================

interface LeaderboardTabProps {
  leaderboard: LeaderboardEntry[];
  onViewAll?: () => void;
}

function LeaderboardTab({ leaderboard, onViewAll }: LeaderboardTabProps) {
  return (
    <div className="space-y-4">
      {leaderboard.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Leaderboard not available</p>
          <p className="text-xs text-gray-400 mt-1">Check back later!</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {leaderboard.slice(0, 5).map((entry) => (
              <div
                key={entry.user_id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg",
                  entry.rank <= 3
                    ? "bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200"
                    : "bg-gray-50",
                )}
              >
                {/* Rank */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                    entry.rank === 1 && "bg-amber-500 text-white",
                    entry.rank === 2 && "bg-gray-400 text-white",
                    entry.rank === 3 && "bg-amber-700 text-white",
                    entry.rank > 3 && "bg-gray-200 text-gray-600",
                  )}
                >
                  {entry.rank}
                </div>

                {/* User info */}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{entry.display_name || "Anonymous"}</p>
                  <p className="text-xs text-gray-500">{entry.level}</p>
                </div>

                {/* Points */}
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{entry.points.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">pts</p>
                </div>
              </div>
            ))}
          </div>

          {onViewAll && (
            <button
              onClick={onViewAll}
              className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View Full Leaderboard
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ============================================
// Helper Components
// ============================================

interface StatCardProps {
  label: string;
  value: number;
  subLabel: string;
  icon: React.ReactNode;
  color: "blue" | "orange" | "amber" | "purple" | "green";
}

function StatCard({ label, value, subLabel, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("p-1.5 rounded-lg", colorClasses[color])}>{icon}</div>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
      <div className="text-xs text-gray-500">{subLabel}</div>
    </div>
  );
}

// ============================================
// Helper Functions
// ============================================

function getBadgesByTier(badges: EarnedBadge[]): Record<string, number> {
  return badges.reduce(
    (acc, badge) => {
      acc[badge.tier] = (acc[badge.tier] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

function getNextLevelName(currentLevel: UserLevel): string {
  const levelOrder: UserLevel[] = ["小白", "探索者", "旅行家", "中国通", "传奇"];
  const currentIndex = levelOrder.indexOf(currentLevel);
  if (currentIndex === levelOrder.length - 1) return "Max Level";
  return levelOrder[currentIndex + 1];
}

function LevelProgress({ currentLevel, points }: { currentLevel: UserLevel; points: number }) {
  const levels: UserLevel[] = ["小白", "探索者", "旅行家", "中国通", "传奇"];
  const currentIndex = levels.indexOf(currentLevel);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{levels[0]}</span>
        <span>{levels[levels.length - 1]}</span>
      </div>
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        {/* Progress fill */}
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
          style={{
            width: `${((currentIndex + points / (LEVEL_THRESHOLDS[currentLevel] || 1)) / (levels.length - 1)) * 100}%`,
          }}
        />
        {/* Level markers */}
        <div className="absolute inset-0 flex justify-between items-center px-1">
          {levels.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full",
                index <= currentIndex ? "bg-blue-600" : "bg-gray-300",
              )}
            />
          ))}
        </div>
      </div>
      <div className="text-center text-xs text-gray-500 mt-1">
        {currentLevel === "传奇" ? "Maximum level reached!" : `Next: ${levels[currentIndex + 1]}`}
      </div>
    </div>
  );
}

/**
 * Leaderboard Component for ChinaConnect
 * Shows rankings by city/check-ins with mock data support
 */

import { LevelBadge } from "@/components/user/LevelBadge";
import { PointsDisplay } from "@/components/user/PointsDisplay";
import {
  MOCK_CITY_LEADERBOARD,
  MOCK_LEADERBOARD,
  type MockProfile,
} from "@/data/community/mockData";
import { supabase } from "@/supabase/config";
import type { Database } from "@/types/database";
import { useEffect, useState } from "react";

type LeaderboardEntry = Database["public"]["Views"]["leaderboard_view"]["Row"];

// Check if we're using real Supabase
const USE_MOCK = !import.meta.env.PUBLIC_SUPABASE_URL;

interface LeaderboardProps {
  type?: "points" | "checkins";
  city?: string;
  limit?: number;
  className?: string;
}

export function Leaderboard({
  type = "points",
  city,
  limit = 10,
  className = "",
}: LeaderboardProps) {
  const [entries, setEntries] = useState<(LeaderboardEntry | MockProfile)[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        if (USE_MOCK) {
          // Use mock data
          let mockData = MOCK_LEADERBOARD;

          if (city && MOCK_CITY_LEADERBOARD[city]) {
            mockData = MOCK_CITY_LEADERBOARD[city];
          }

          setEntries(mockData.slice(0, limit));
        } else {
          // Use real Supabase data
          const { data, error } = await supabase
            .from("leaderboard_view")
            .select("*")
            .order(type === "points" ? "points" : "check_ins_count", { ascending: false })
            .limit(limit);

          if (error) throw error;
          setEntries(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [type, city, limit]);

  if (isLoading) {
    return (
      <div className={`animate-pulse space-y-2 ${className}`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <span className="text-4xl mb-2 block">🏆</span>
        <p>No rankings yet</p>
        <p className="text-sm">Be the first to top the leaderboard!</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {entries.map((entry, index) => (
        <LeaderboardRow
          key={"user_id" in entry ? entry.user_id : (entry as MockProfile).id}
          rank={index + 1}
          entry={entry}
          highlight={index < 3}
        />
      ))}
    </div>
  );
}

interface LeaderboardRowProps {
  rank: number;
  entry: LeaderboardEntry | MockProfile;
  highlight?: boolean;
}

function LeaderboardRow({ rank, entry, highlight }: LeaderboardRowProps) {
  const rankEmoji = getRankEmoji(rank);

  // Handle both mock and real data formats
  const displayName = entry.display_name || (entry as MockProfile).display_name || "Anonymous";
  const avatarUrl = entry.avatar_url || (entry as MockProfile).avatar_url || null;
  const level = "level" in entry ? entry.level : (entry as MockProfile).level || "小白";
  const points = entry.points || (entry as MockProfile).points || 0;
  const checkInsCount =
    "check_ins_count" in entry
      ? entry.check_ins_count
      : (entry as MockProfile).check_ins_count || 0;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
        highlight
          ? "bg-amber-50 dark:bg-amber-900/20"
          : "bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      {/* Rank */}
      <div className={`w-10 text-center text-2xl ${highlight ? "" : "opacity-50"}`}>
        {rankEmoji}
      </div>

      {/* Avatar */}
      <div className="relative">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-lg">
            {displayName?.[0]?.toUpperCase() || "?"}
          </div>
        )}
      </div>

      {/* Name and Level */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{displayName}</span>
          <LevelBadge level={level} size="sm" />
        </div>
        <div className="text-xs text-gray-500">{checkInsCount} check-ins</div>
      </div>

      {/* Points */}
      <div className="text-right">
        <PointsDisplay points={points} size="sm" showProgress={false} />
      </div>
    </div>
  );
}

function getRankEmoji(rank: number): string {
  switch (rank) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";
    default:
      return `#${rank}`;
  }
}

// City Leaderboard Tabs
interface CityLeaderboardProps {
  className?: string;
}

export function CityLeaderboard({ className = "" }: CityLeaderboardProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<"points" | "checkins">("points");
  const cities = [
    "All Cities",
    "Beijing",
    "Shanghai",
    "Guangzhou",
    "Shenzhen",
    "Chengdu",
    "Hangzhou",
    "Xi'an",
    "Suzhou",
  ];

  return (
    <div className={className}>
      {/* Type Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setActiveType("points")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeType === "points"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          Points Ranking
        </button>
        <button
          type="button"
          onClick={() => setActiveType("checkins")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeType === "checkins"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          Check-in Ranking
        </button>
      </div>

      {/* City Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {cities.map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => setSelectedCity(city === "All Cities" ? null : city)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              (city === "All Cities" && !selectedCity) || selectedCity === city
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {city === "All Cities" ? "🌍 All Cities" : city}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <Leaderboard type={activeType} city={selectedCity || undefined} />
    </div>
  );
}

export default Leaderboard;

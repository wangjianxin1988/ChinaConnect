/**
 * User Profile Component for ChinaConnect
 * Displays user profile with stats and activity
 */

import type { Database } from "@/types/database";
import { POINTS } from "@/types/database";
import { LevelBadge } from "./LevelBadge";
import { PointsDisplay } from "./PointsDisplay";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface UserProfileProps {
  profile: Profile;
  stats?: {
    postsCount: number;
    checkInsCount: number;
    likesReceived: number;
    bestAnswers: number;
  };
  isOwnProfile?: boolean;
  className?: string;
}

export function UserProfile({
  profile,
  stats = {
    postsCount: 0,
    checkInsCount: 0,
    likesReceived: 0,
    bestAnswers: 0,
  },
  isOwnProfile = false,
  className = "",
}: UserProfileProps) {
  const displayName = profile.display_name || "Anonymous";
  const avatarUrl = profile.avatar_url || null;
  const nationality = profile.nationality || null;
  const bio = "bio" in profile ? profile.bio : null;
  const level = "level" in profile ? profile.level : "小白";
  const points = profile.points || 0;

  const finalStats = {
    postsCount: stats.postsCount || 0,
    checkInsCount: stats.checkInsCount || 0,
    likesReceived: stats.likesReceived || 0,
    bestAnswers: stats.bestAnswers || 0,
  };

  const nationalityEmoji = getNationalityEmoji(nationality);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        {/* Avatar */}
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName || "User avatar"}
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-3xl">
              {displayName?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          {isOwnProfile && (
            <span className="absolute -bottom-1 -right-1 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
              YOU
            </span>
          )}
        </div>

        {/* Name and Level */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-1">{displayName}</h1>
          <div className="flex items-center gap-2 mb-2">
            <LevelBadge level={level} size="md" />
            {nationality && (
              <span className="text-2xl" title={nationality}>
                {nationalityEmoji}
              </span>
            )}
          </div>
          {bio && <p className="text-gray-600 dark:text-gray-300 text-sm">{bio}</p>}
        </div>
      </div>

      {/* Points Display */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <PointsDisplay points={points} showProgress size="lg" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Posts"
          value={finalStats.postsCount}
          subLabel={`+${finalStats.postsCount * POINTS.POST} pts`}
          icon="📝"
        />
        <StatCard
          label="Check-ins"
          value={finalStats.checkInsCount}
          subLabel={`+${finalStats.checkInsCount * POINTS.CHECK_IN} pts`}
          icon="📍"
        />
        <StatCard
          label="Likes Received"
          value={finalStats.likesReceived}
          subLabel={`+${finalStats.likesReceived * POINTS.LIKE_RECEIVED} pts`}
          icon="❤️"
        />
        <StatCard
          label="Best Answers"
          value={finalStats.bestAnswers}
          subLabel={`+${finalStats.bestAnswers * POINTS.BEST_ANSWER} pts`}
          icon="⭐"
        />
      </div>

      {/* Member Since */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Member since {new Date(profile.created_at).toLocaleDateString()}
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  subLabel: string;
  icon: string;
}

function StatCard({ label, value, subLabel, icon }: StatCardProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-xs text-blue-600 dark:text-blue-400">{subLabel}</div>
    </div>
  );
}

function getNationalityEmoji(nationality: string | null): string {
  if (!nationality) return "";

  const nationalityMap: Record<string, string> = {
    // Asia
    China: "🇨🇳",
    Japan: "🇯🇵",
    "South Korea": "🇰🇷",
    "North Korea": "🇰🇵",
    Taiwan: "🇹🇼",
    "Hong Kong": "🇭🇰",
    Macau: "🇲🇴",
    Singapore: "🇸🇬",
    Malaysia: "🇲🇾",
    Thailand: "🇹🇭",
    Vietnam: "🇻🇳",
    India: "🇮🇳",
    Indonesia: "🇮🇩",
    Philippines: "🇵🇭",
    // Europe
    "United Kingdom": "🇬🇧",
    UK: "🇬🇧",
    Germany: "🇩🇪",
    France: "🇫🇷",
    Italy: "🇮🇹",
    Spain: "🇪🇸",
    Portugal: "🇵🇹",
    Netherlands: "🇳🇱",
    Belgium: "🇧🇪",
    Switzerland: "🇨🇭",
    Austria: "🇦🇹",
    Sweden: "🇸🇪",
    Norway: "🇳🇴",
    Denmark: "🇩🇰",
    Finland: "🇫🇮",
    Poland: "🇵🇱",
    Russia: "🇷🇺",
    Ukraine: "🇺🇦",
    // North America
    "United States": "🇺🇸",
    USA: "🇺🇸",
    Canada: "🇨🇦",
    Mexico: "🇲🇽",
    // South America
    Brazil: "🇧🇷",
    Argentina: "🇦🇷",
    Chile: "🇨🇱",
    Colombia: "🇨🇴",
    Peru: "🇵🇪",
    // Oceania
    Australia: "🇦🇺",
    "New Zealand": "🇳🇿",
    // Africa
    "South Africa": "🇿🇦",
    Egypt: "🇪🇬",
    Nigeria: "🇳🇬",
    Kenya: "🇰🇪",
    // Middle East
    UAE: "🇦🇪",
    "Saudi Arabia": "🇸🇦",
    Israel: "🇮🇱",
    Turkey: "🇹🇷",
    Iran: "🇮🇷",
  };

  return nationalityMap[nationality] || "🌍";
}

export default UserProfile;

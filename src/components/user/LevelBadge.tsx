/**
 * Level Badge Component for ChinaConnect
 * Visual representation of user level
 */

import type { UserLevel } from "@/types/database";

interface LevelBadgeProps {
  level: UserLevel;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

// Level colors mapping
const LEVEL_COLORS: Record<UserLevel, { bg: string; text: string; border: string }> = {
  小白: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-300",
  },
  探索者: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-300",
  },
  旅行家: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-300",
  },
  中国通: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-300",
  },
  传奇: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-400",
  },
};

// Level icons (emoji representations)
const LEVEL_ICONS: Record<UserLevel, string> = {
  小白: "🌱",
  探索者: "🧭",
  旅行家: "✈️",
  中国通: "🏯",
  传奇: "👑",
};

export function LevelBadge({
  level,
  size = "md",
  showLabel = true,
  className = "",
}: LevelBadgeProps) {
  const colors = LEVEL_COLORS[level];
  const icon = LEVEL_ICONS[level];

  const sizeClasses = {
    sm: {
      badge: "px-2 py-0.5 text-xs",
      icon: "text-xs",
    },
    md: {
      badge: "px-3 py-1 text-sm",
      icon: "text-base",
    },
    lg: {
      badge: "px-4 py-1.5 text-base",
      icon: "text-xl",
    },
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full border font-medium
        ${colors.bg} ${colors.text} ${colors.border}
        ${sizeClasses[size].badge}
        ${className}
      `}
    >
      <span className={sizeClasses[size].icon}>{icon}</span>
      {showLabel && <span>{level}</span>}
    </span>
  );
}

// Level badge with progress indicator
interface LevelProgressBadgeProps {
  level: UserLevel;
  progress: number; // 0-100
  className?: string;
}

export function LevelProgressBadge({ level, progress, className = "" }: LevelProgressBadgeProps) {
  const colors = LEVEL_COLORS[level];
  const icon = LEVEL_ICONS[level];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-sm font-medium ${colors.text}`}>{level}</span>
          <span className="text-xs text-gray-500">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.bg.replace("bg-", "bg-")} transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default LevelBadge;

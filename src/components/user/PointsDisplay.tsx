/**
 * Points Display Component for ChinaConnect
 * Shows user points with level progress
 */

import {
  LEVEL_THRESHOLDS,
  type UserLevel,
  calculateLevel,
  getPointsToNextLevel,
} from "@/types/database";
import { LevelBadge } from "./LevelBadge";

interface PointsDisplayProps {
  points: number;
  showProgress?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PointsDisplay({
  points,
  showProgress = true,
  size = "md",
  className = "",
}: PointsDisplayProps) {
  const level = calculateLevel(points);
  const pointsToNext = getPointsToNextLevel(points);
  const _currentLevelThreshold = LEVEL_THRESHOLDS[level as keyof typeof LEVEL_THRESHOLDS];

  // Calculate progress within current level
  let progress = 0;
  let progressLabel = "";

  if (pointsToNext === null) {
    // Max level
    progress = 100;
    progressLabel = "Max Level";
  } else {
    // Calculate progress from current level to next
    const levelRanges: { current: UserLevel; next: UserLevel }[] = [
      { current: "小白", next: "探索者" },
      { current: "探索者", next: "旅行家" },
      { current: "旅行家", next: "中国通" },
      { current: "中国通", next: "传奇" },
    ];

    for (const range of levelRanges) {
      if (level === range.current) {
        const currentThreshold = LEVEL_THRESHOLDS[range.current];
        const nextThreshold = LEVEL_THRESHOLDS[range.next];
        const pointsInLevel = points - currentThreshold;
        const levelRange = nextThreshold - currentThreshold;
        progress = Math.round((pointsInLevel / levelRange) * 100);
        progressLabel = `${pointsInLevel} / ${levelRange} to ${range.next}`;
        break;
      }
    }
  }

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const progressBarHeight = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LevelBadge level={level} size={size} />
          <span className={`font-semibold ${sizeClasses[size]}`}>
            {points.toLocaleString()} pts
          </span>
        </div>
        {pointsToNext !== null && (
          <span className="text-xs text-gray-500">
            {pointsToNext.toLocaleString()} to {getNextLevel(level)}
          </span>
        )}
      </div>

      {showProgress && (
        <div className="space-y-1">
          <div
            className={`w-full bg-gray-200 rounded-full overflow-hidden ${progressBarHeight[size]}`}
          >
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-right">{progressLabel}</p>
        </div>
      )}
    </div>
  );
}

function getNextLevel(currentLevel: UserLevel): UserLevel | null {
  const levelOrder: UserLevel[] = ["小白", "探索者", "旅行家", "中国通", "传奇"];
  const currentIndex = levelOrder.indexOf(currentLevel);
  if (currentIndex === -1 || currentIndex === levelOrder.length - 1) {
    return null;
  }
  return levelOrder[currentIndex + 1];
}

export default PointsDisplay;

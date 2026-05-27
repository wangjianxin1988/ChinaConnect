/**
 * FoodTierBadge Component
 * Displays tier badge (S/A/B) with appropriate styling
 * S = Michelin (⭐), A = Black Pearl (💎), B = Local (🔥)
 * Also supports new types: budget_local, hole_in_wall, night_market
 */

import type { BloggerPlatform, FoodTier, RestaurantType } from "@/types/food";
import { BLOGGER_PLATFORM_LABELS, FOOD_TIER_CONFIG, RESTAURANT_TYPE_CONFIG } from "@/types/food";
import React from "react";

interface FoodTierBadgeProps {
  tier: FoodTier;
  showLabel?: boolean;
  showSource?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function FoodTierBadge({
  tier,
  showLabel = true,
  showSource = false,
  size = "md",
  className = "",
}: FoodTierBadgeProps) {
  const config = FOOD_TIER_CONFIG[tier];

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  const iconMap: Record<FoodTier, string> = {
    S: "⭐",
    A: "💎",
    B: "🔥",
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className={`
          inline-flex items-center justify-center rounded-full font-bold
          ${config.color.bg} ${config.color.text} ${config.color.border} border
          ${sizeClasses[size]}
        `}
      >
        <span className={size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"}>
          {iconMap[tier]}
        </span>
        {showLabel && <span className="ml-1 font-semibold">{config.labelZh}</span>}
      </span>
      {showSource && <span className="text-xs text-gray-400">{config.source}</span>}
    </div>
  );
}

interface TierStarsBadgeProps {
  tier: FoodTier;
  starCount?: number;
  diamondCount?: number;
  className?: string;
}

export function TierStarsBadge({
  tier,
  starCount,
  diamondCount,
  className = "",
}: TierStarsBadgeProps) {
  if (tier === "S" && starCount) {
    const stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push(
        <span key={`star-${i}`} className="text-amber-400 text-sm font-bold">
          ★
        </span>,
      );
    }
    return <div className={`flex items-center gap-0.5 ${className}`}>{stars}</div>;
  }

  if (tier === "A" && diamondCount) {
    const diamonds = [];
    for (let i = 0; i < diamondCount; i++) {
      diamonds.push(
        <span key={`diamond-${i}`} className="text-slate-400 text-sm font-bold">
          ◆
        </span>,
      );
    }
    return <div className={`flex items-center gap-0.5 ${className}`}>{diamonds}</div>;
  }

  return null;
}

interface BloggerBadgeProps {
  platform: BloggerPlatform;
  bloggerName: string;
  className?: string;
}

export function BloggerBadge({ platform, bloggerName, className = "" }: BloggerBadgeProps) {
  const platformIcon: Record<BloggerPlatform, string> = {
    douyin: "🎵",
    xiaohongshu: "📕",
    bilibili: "📺",
    weibo: "📱",
  };

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2 py-1
        bg-gradient-to-r from-orange-50 to-red-50
        text-orange-700 rounded-full text-xs font-medium border border-orange-200
        ${className}
      `}
    >
      <span>{platformIcon[platform]}</span>
      <span>{BLOGGER_PLATFORM_LABELS[platform]}</span>
      <span className="text-orange-300">|</span>
      <span className="font-semibold">{bloggerName}</span>
    </div>
  );
}

interface RatingBadgeProps {
  rating: number;
  maxRating?: number;
  source?: string;
  className?: string;
}

export function RatingBadge({ rating, source, className = "" }: RatingBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <span className="text-yellow-500 font-bold">★</span>
      <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
      {source && <span className="text-gray-400 text-xs">/ {source}</span>}
    </div>
  );
}

interface PriceRangeBadgeProps {
  avgPrice: number;
  localPrice?: number;
  touristPrice?: number;
  showRange?: boolean;
  className?: string;
}

export function PriceRangeBadge({
  avgPrice,
  localPrice,
  touristPrice,
  showRange = false,
  className = "",
}: PriceRangeBadgeProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-gray-900 font-semibold">¥{avgPrice}</span>
      {showRange && <span className="text-xs text-gray-400">/人</span>}
      {(localPrice || touristPrice) && (
        <span className="text-xs text-gray-400">(本地价: ¥{localPrice || avgPrice})</span>
      )}
    </div>
  );
}

// Restaurant Type Badge - for displaying new food categories
interface RestaurantTypeBadgeProps {
  type: RestaurantType;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RestaurantTypeBadge({
  type,
  showLabel = true,
  size = "md",
  className = "",
}: RestaurantTypeBadgeProps) {
  const config = RESTAURANT_TYPE_CONFIG[type];

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className={`
          inline-flex items-center justify-center rounded-full font-bold
          ${config.color.bg} ${config.color.text} ${config.color.border} border
          ${sizeClasses[size]}
        `}
      >
        <span className={size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"}>
          {config.icon}
        </span>
        {showLabel && <span className="ml-1 font-semibold">{config.labelZh}</span>}
      </span>
    </div>
  );
}

// Budget Type Badge - specific badge for budget-friendly categories
interface BudgetTypeBadgeProps {
  type: "budget_local" | "hole_in_wall" | "night_market";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const BUDGET_TYPE_CONFIG = {
  budget_local: {
    label: "本地人推荐",
    icon: "🍜",
    color: {
      bg: "bg-green-50",
      text: "text-green-800",
      border: "border-green-200",
    },
  },
  hole_in_wall: {
    label: "苍蝇馆子",
    icon: "🦐",
    color: {
      bg: "bg-yellow-50",
      text: "text-yellow-800",
      border: "border-yellow-200",
    },
  },
  night_market: {
    label: "夜市摊位",
    icon: "🌙",
    color: {
      bg: "bg-indigo-50",
      text: "text-indigo-800",
      border: "border-indigo-200",
    },
  },
};

export function BudgetTypeBadge({ type, size = "md", className = "" }: BudgetTypeBadgeProps) {
  const config = BUDGET_TYPE_CONFIG[type];

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center rounded-full font-bold
        ${config.color.bg} ${config.color.text} ${config.color.border} border
        ${sizeClasses[size]} ${className}
      `}
    >
      <span>{config.icon}</span>
      <span className="ml-1 font-semibold">{config.label}</span>
    </span>
  );
}

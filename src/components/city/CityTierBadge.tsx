import { TIER_CONFIG } from "@/data/cities/tier-data";
import type { CityTier } from "@/data/cities/types";
import React from "react";

interface CityTierBadgeProps {
  tier: CityTier;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function CityTierBadge({
  tier,
  size = "md",
  showLabel = true,
  className = "",
}: CityTierBadgeProps) {
  const config = TIER_CONFIG[tier];

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-semibold border
        ${config.bgColor} ${config.color}
        ${sizeClasses[size]}
        ${className}
      `}
      title={config.description}
    >
      {/* Tier icon */}
      <span
        className={`
          ${tier === "S" ? "text-amber-500" : ""}
          ${tier === "A" ? "text-blue-500" : ""}
          ${tier === "D" ? "text-gray-400" : ""}
        `}
      >
        {tier === "S" && (
          <svg
            role="img"
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-label="S-Tier"
          >
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        )}
        {tier === "A" && (
          <svg
            role="img"
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-label="A-Tier"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        )}
        {tier === "D" && (
          <svg
            role="img"
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-label="D-Tier"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        )}
      </span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

/**
 * Compact tier badge for inline use
 */
export function CityTierBadgeCompact({ tier }: { tier: CityTier }) {
  const config = TIER_CONFIG[tier];

  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border ${config.bgColor} ${config.color}`}
      title={config.description}
    >
      {tier}
    </span>
  );
}

/**
 * Tier indicator dot for list views
 */
export function CityTierDot({ tier }: { tier: CityTier }) {
  const colors = {
    S: "bg-amber-500",
    A: "bg-blue-500",
    D: "bg-gray-400",
  };

  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${colors[tier]}`}
      title={TIER_CONFIG[tier].description}
    />
  );
}

export default CityTierBadge;

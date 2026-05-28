/**
 * City Tier Display Helper
 * Provides consistent tier display logic across the application
 */
import type { CityTier } from "./types";
import { TIER_CONFIG } from "./tier-data";

/**
 * Get tier display info for a given tier
 */
export function getTierDisplayInfo(tier: CityTier) {
  return TIER_CONFIG[tier];
}

/**
 * Get tier color classes for backgrounds and text
 */
export function getTierColorClasses(tier: CityTier) {
  const config = TIER_CONFIG[tier];
  return {
    bg: config.bgColor,
    text: config.color,
    border: config.borderColor,
  };
}

/**
 * Get tier badge class names for a given tier and size
 */
export function getTierBadgeClasses(
  tier: CityTier,
  size: "sm" | "md" | "lg" = "md"
) {
  const config = TIER_CONFIG[tier];
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  return `${config.bgColor} ${config.color} ${config.borderColor} border rounded-full ${sizeClasses[size]}`;
}

/**
 * Check if a city is an S-tier premium city
 */
export function isSTierCity(tier: CityTier): boolean {
  return tier === "S";
}

/**
 * Check if a city is an A-tier semi-premium city
 */
export function isATierCity(tier: CityTier): boolean {
  return tier === "A";
}

/**
 * Check if a city is a D-tier on-demand city
 */
export function isDTierCity(tier: CityTier): boolean {
  return tier === "D";
}

/**
 * Get tier statistics for display
 */
export function getTierStats() {
  return {
    S: {
      label: "S-Tier",
      labelZh: "S级城市",
      description: "Premium cities with complete travel guides, UNESCO sites, and fine dining",
      icon: "star",
      count: 35, // Current S-tier city count
    },
    A: {
      label: "A-Tier",
      labelZh: "A级城市",
      description: "Popular destinations with good local coverage",
      icon: "shield",
      count: 0, // Will be populated dynamically
    },
    D: {
      label: "D-Tier",
      labelZh: "D级城市",
      description: "On-demand generated content for other Chinese cities",
      icon: "circle",
      count: 0, // Will be populated dynamically
    },
  };
}

/**
 * Get tier priority (lower number = higher priority)
 */
export function getTierPriority(tier: CityTier): number {
  const priority: Record<CityTier, number> = {
    S: 1,
    A: 2,
    D: 3,
  };
  return priority[tier];
}

/**
 * Sort cities by tier priority
 */
export function sortByTierPriority<T extends { tier?: CityTier }>(cities: T[]): T[] {
  return [...cities].sort((a, b) => {
    const tierA = a.tier || "D";
    const tierB = b.tier || "D";
    return getTierPriority(tierA) - getTierPriority(tierB);
  });
}
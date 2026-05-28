/**
 * City Tier System - Summary and Usage Guide
 *
 * This document explains the three-tier city classification system and how to use it.
 */

// ============================================================================
// THREE-TIER CITY SYSTEM
// ============================================================================

/**
 * S-Tier Cities (Premium)
 * - 35 cities with full detailed data files
 * - Complete attractions, restaurants, transport, hotels, emergency contacts
 * - Includes UNESCO sites, Michelin restaurants, detailed guides
 *
 * A-Tier Cities (Semi-premium)
 * - ~200-300 cities with template-based generated content
 * - Significant tourism value but less detailed coverage
 * - Based on A_TIER_CITY_TEMPLATES in tier-data.ts
 *
 * D-Tier Cities (On-demand)
 * - 2900+ cities with basic info available on request
 * - Generated on-demand from templates
 * - Not included in the main cities list
 */

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * 1. Get city tier for a specific city:
 *
 * import { S_TIER_CITIES } from "@/data/cities/tier-data";
 *
 * const tier = S_TIER_CITIES["beijing"]?.tier || "D";
 * // Returns: "S"
 */

/**
 * 2. Use CityTierBadge component:
 *
 * import { CityTierBadge } from "@/components/city/CityTierBadge";
 *
 * <CityTierBadge tier="S" size="md" showLabel />
 * // Renders: [Star Icon] S级城市
 */

/**
 * 3. Use CityTierFilter for filtering cities:
 *
 * import { CityTierFilter } from "@/components/city/CityTierFilter";
 *
 * <CityTierFilter
 *   onFilterChange={(selectedTiers) => console.log(selectedTiers)}
 *   showCounts
 * />
 */

/**
 * 4. Use tier utilities:
 *
 * import { getTierDisplayInfo, getTierBadgeClasses } from "@/data/cities/tier-utils";
 *
 * const info = getTierDisplayInfo("S");
 * // Returns: { label: "S-Tier", labelZh: "S级城市", ... }
 */

// ============================================================================
// TIER CONFIGURATION
// ============================================================================

/**
 * TIER_CONFIG provides consistent styling for all tier badges:
 *
 * S: { bgColor: "bg-amber-50", color: "text-amber-700", borderColor: "border-amber-300" }
 * A: { bgColor: "bg-blue-50", color: "text-blue-700", borderColor: "border-blue-300" }
 * D: { bgColor: "bg-gray-50", color: "text-gray-600", borderColor: "border-gray-300" }
 */

// ============================================================================
// CITY DATA STRUCTURE
// ============================================================================

/**
 * Cities are stored in src/data/cities/*.json
 * Each city has:
 * - slug: unique identifier
 * - name/nameEn: city names
 * - coordinates: lat/lng
 * - attractions: array of attractions
 * - restaurants: array with type field (michelin/blackpearl/local)
 * - emergencyContacts: emergency services
 * - ...and more
 *
 * S_TIER_CITIES lookup provides tier info for each city
 */

// ============================================================================
// FOOD TIER SYSTEM
// ============================================================================

/**
 * The food system has its own tier system aligned with restaurant types:
 *
 * S-Tier Food = Michelin restaurants (star ratings 1-3)
 * A-Tier Food = Black Pearl restaurants (diamond ratings 1-3)
 * B-Tier Food = Local blogger recommendations
 *
 * Types: "michelin" | "blackpearl" | "local" | "budget_local" | "hole_in_wall" | "night_market"
 *
 * Components:
 * - FoodTierBadge: displays tier with icon and label
 * - FoodCard: restaurant card with tier, rating, price
 * - ThreeTierFoodSection: filterable restaurant list by tier
 */

// ============================================================================
// DUAL MAP ENGINE
// ============================================================================

/**
 * The dual map engine supports two map providers:
 *
 * Google Maps (WGS-84 coordinates)
 * - Best for international users
 * - Standard GPS coordinates
 *
 * Amap/高德地图 (GCJ-02 coordinates)
 * - Best for China-based users
 * - China-specific coordinate system
 *
 * Auto-detection via useMapProvider hook:
 * - IP-based country detection
 * - localStorage caching
 * - Manual toggle option
 *
 * Components:
 * - DualMap: main map component with controls
 * - DynamicMap: SSR-safe wrapper with loading skeleton
 * - LeafletMap: underlying Leaflet implementation
 */

// ============================================================================
// FILE STRUCTURE
// ============================================================================

/**
 * Key files:
 * - src/data/cities/types.ts      - City tier types and helpers
 * - src/data/cities/tier-data.ts  - Tier configs and city metadata
 * - src/data/cities/tier-utils.ts - Tier utility functions
 * - src/components/city/CityTierBadge.tsx - Tier badge component
 * - src/components/city/CityTierFilter.tsx - Tier filter component
 * - src/components/food/FoodTierBadge.tsx - Food tier badge
 * - src/components/food/FoodCard.tsx - Restaurant card
 * - src/components/Map/DualMap.tsx - Dual map component
 * - src/hooks/useMapProvider.ts - Map provider detection hook
 */

export {};
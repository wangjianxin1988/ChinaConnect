import { S_TIER_CITIES } from "./tier-data";

// City tier classification
export type CityTier = "S" | "A" | "B" | "C" | "D";

// S-tier: Premium cities with full detailed data (35 cities)
// A-tier: Semi-premium cities with moderate data (200-300 cities)
// D-tier: On-demand cities with generated data (2900+ cities)

export interface CityTierMeta {
  tier: CityTier;
  // S-tier cities are manually curated premium destinations
  // A-tier cities have significant tourism value but less detailed coverage
  // D-tier cities are generated on-demand from templates
  priority?: number; // Display priority within tier (1 = highest)
  region?: string; // e.g., "长三角", "珠三角", etc.
  tags?: string[]; // e.g., ["UNESCO", "Business Hub", "Coastal"]
  compositeScore?: number; // City scoring from multi-source data
  overallRank?: number | null; // Overall ranking by composite score
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location extends Coordinates {
  name?: string;
  nameEn?: string;
}

export interface Attraction {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  coordinates?: Coordinates;
  address?: string;
  openingHours?: string;
  ticketPrice?: string;
  description?: string;
  imageUrl?: string;
  recommendedVisitTime?: string;
  highlights?: string[];
  tips?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  nameEn: string;
  type: "michelin" | "blackpearl" | "local";
  cuisine: string;
  avgPrice: number;
  rating: number;
  coordinates?: Coordinates;
  address?: string;
  phone?: string;
  hours?: string;
  description?: string;
  dishHighlights?: string[];
  tags?: string[];
  star?: number;
  diamond?: number;
  /** Special highlight tags for city page display */
  highlightTags?: RestaurantHighlightTag[];
}

export type RestaurantHighlightTag = "local_recommend" | "affordable" | "street_food";

export interface EmergencyContact {
  type: string;
  name: string;
  nameEn: string;
  phone: string;
  address: string;
  coordinates?: Coordinates;
  notes?: string;
}

export interface TransportArrival {
  type: "air" | "train" | "bus";
  from?: string;
  to?: string;
  duration?: string;
  price?: string;
  frequency?: string;
  tips?: string;
}

export interface City {
  slug: string;
  name: string;
  nameEn: string;
  country: string;
  population: string;
  coordinates: Coordinates;
  timezone: string;
  description: string;
  coverImage?: string;
  highlights?: string[];
  climate?: {
    type: string;
    bestMonths?: string[];
    avgSummerTemp?: string;
    avgWinterTemp?: string;
    tips?: string;
  };
  quickFacts?: {
    language?: string;
    currency?: string;
    visa?: string;
    electricity?: string;
  };
  attractions: Attraction[];
  restaurants: Restaurant[];
  emergencyContacts: EmergencyContact[];
  // Extended fields used in city pages
  transport?: {
    arrival?: TransportArrival[];
    local?: {
      metro?: string[];
      bus?: string[];
      taxi?: string[];
      bike?: string[];
    };
  };
  payment?: Array<{
    method: string;
    description?: string;
    howToUse?: string[];
    tips?: string[];
  }>;
  culturalTips?: Array<{
    title: string;
    content: string;
    importance?: "high" | "medium" | "low";
  }>;
  hotels?: Array<{
    name: string;
    nameEn: string;
    budget: "luxury" | "mid" | "budget";
    priceRange: string;
    address: string;
    rating: number;
    highlights?: string[];
    bookingTips?: string;
  }>;
  // Tier classification for city prioritization
  tier?: CityTier;
}

/**
 * Get city tier from S_TIER_CITIES lookup
 * Returns the tier classification for a city
 */
export function getCityTier(slug: string): CityTier | undefined {
  if (S_TIER_CITIES[slug]) {
    return S_TIER_CITIES[slug].tier;
  }
  return undefined;
}

/**
 * Get all cities grouped by tier
 */
export function getCitiesByTier(): Record<CityTier, City[]> {
  const result: Record<CityTier, City[]> = { S: [], A: [], B: [], C: [], D: [] };

  for (const city of cities) {
    const tier = getCityTier(city.slug);
    if (tier) {
      result[tier].push(city);
    } else {
      // Cities not in S_TIER_CITIES are D-tier (on-demand generated)
      result.D.push(city);
    }
  }

  return result;
}

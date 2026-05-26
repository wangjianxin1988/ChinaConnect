// City data types - mirrors the JSON structure in src/data/cities/*.json
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
  type: string;
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
}

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
}

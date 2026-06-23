// @ts-nocheck
// City type definitions

export interface CityCoordinates {
  lat: number;
  lng: number;
}

export interface CityClimate {
  type: string; // 'temperate' | 'subtropical' | etc.
  bestMonths: string[];
  avgSummerTemp: string;
  avgWinterTemp: string;
  tips: string;
}

export interface Attraction {
  id: string;
  name: string;
  nameEn: string;
  category: string; // 'historical' | 'cultural' | 'natural' | 'modern'
  description: string;
  address: string;
  coordinates: CityCoordinates;
  openingHours: string;
  ticketPrice: string;
  recommendedVisitTime: string;
  highlights: string[];
  tips: string;
}

export interface Restaurant {
  id: string;
  name: string;
  nameEn: string;
  type: "michelin" | "blackpearl" | "local";
  cuisine: string;
  star?: 1 | 2 | 3; // Michelin stars
  diamond?: 1 | 2 | 3; // Black Pearl diamonds
  avgPrice: number;
  rating: number;
  address: string;
  coordinates: CityCoordinates;
  phone?: string;
  hours?: string;
  description: string;
  dishHighlights: string[];
  tags: string[];
  imageUrl?: string;
}

export interface TransportOption {
  type: "air" | "train" | "bus";
  from: string;
  to: string;
  duration: string;
  price: string;
  frequency: string;
  tips?: string;
}

export interface LocalTransport {
  metro: string[];
  bus: string[];
  taxi: string[];
  bike: string[];
}

export interface Hotel {
  name: string;
  nameEn: string;
  budget: "luxury" | "mid" | "budget";
  priceRange: string;
  address: string;
  coordinates: CityCoordinates;
  rating: number;
  highlights: string[];
  bookingTips?: string;
}

export interface EmergencyContact {
  type: "hospital" | "police" | "embassy" | "fire" | "ambulance";
  name: string;
  nameEn: string;
  phone: string;
  address: string;
  coordinates: CityCoordinates;
  notes?: string;
}

export interface PaymentGuide {
  method: string;
  icon: string;
  description: string;
  howToUse: string[];
  tips: string[];
}

export interface CulturalTip {
  category: string;
  title: string;
  content: string;
  importance: "high" | "medium" | "low";
}

export interface City {
  slug: string;
  name: string;
  nameEn: string;
  country: string;
  population: string;
  coordinates: CityCoordinates;
  timezone: string;
  description: string;
  coverImage: string;
  highlights: string[];

  // Modules
  climate: CityClimate;
  attractions: Attraction[];
  restaurants: Restaurant[];
  transport: {
    arrival: TransportOption[];
    local: LocalTransport;
  };
  hotels: Hotel[];
  payment: PaymentGuide[];
  culturalTips: CulturalTip[];
  emergencyContacts: EmergencyContact[];

  // Quick facts
  quickFacts: {
    language: string;
    currency: string;
    visa: string;
    timeZone: string;
    electricity: string;
    water: string;
  };
}

// Module sections for city pages
export type CityModule =
  | "overview"
  | "attractions"
  | "food"
  | "transport"
  | "accommodation"
  | "payment"
  | "culture"
  | "emergency";

export const CITY_MODULES: { id: CityModule; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "📍" },
  { id: "attractions", label: "Attractions", icon: "🏛️" },
  { id: "food", label: "Food", icon: "🍜" },
  { id: "transport", label: "Transport", icon: "🚇" },
  { id: "accommodation", label: "Stay", icon: "🏨" },
  { id: "payment", label: "Payment", icon: "💳" },
  { id: "culture", label: "Culture", icon: "🎎" },
  { id: "emergency", label: "Emergency", icon: "🚨" },
];

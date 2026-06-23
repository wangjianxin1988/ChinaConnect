// @ts-nocheck
/**
 * AI Structured Output Schemas for ChinaConnect
 * Type definitions for structured itinerary output and tool results
 */

// ============================================
// Core Itinerary Types
// ============================================

export interface Activity {
  time: string;
  name: string;
  nameZh?: string;
  location: string;
  duration: string;
  cost: number;
  category: "attraction" | "food" | "transport" | "shopping" | "free";
  notes?: string;
}

export interface Restaurant {
  name: string;
  nameZh?: string;
  cuisine: string;
  type: "michelin" | "blackpearl" | "local" | "street_food";
  avgPrice: number;
  signatureDishes: string[];
  address?: string;
  rating?: number;
  recommended?: boolean;
}

export interface DayPlan {
  day: number;
  theme: string;
  activities: Activity[];
  meals: {
    breakfast?: Restaurant;
    lunch?: Restaurant;
    dinner?: Restaurant;
  };
  dayBudget: number;
  transportTips?: string[];
}

export interface BudgetItem {
  category: string;
  amount: number;
  notes?: string;
}

export interface Budget {
  currency: "¥";
  items: BudgetItem[];
  total: number;
  perDay: number;
  budgetLevel: "budget" | "midRange" | "luxury";
}

export interface PracticalInfo {
  category: "visa" | "payment" | "transport" | "emergency" | "culture" | "weather" | "sim";
  title: string;
  content: string;
  importance: "high" | "medium" | "low";
}

// ============================================
// Structured Itinerary Output
// ============================================

export interface StructuredItinerary {
  destination: {
    name: string;
    nameZh: string;
    description: string;
    bestTime: string;
    recommendedDays: number;
  };
  days: DayPlan[];
  budget: Budget;
  practicalInfo: PracticalInfo[];
  emergencyNumbers: EmergencyNumber[];
  disclaimer?: string;
}

export interface EmergencyNumber {
  service: string;
  number: string;
  note?: string;
}

// ============================================
// Tool Input/Output Types
// ============================================

export interface CitySearchInput {
  city: string;
}

export interface CitySearchOutput {
  found: boolean;
  city?: string;
  cityZh?: string;
  description?: string;
  climate?: {
    type: string;
    bestMonths: string[];
    avgSummerTemp: string;
    avgWinterTemp: string;
    tips: string;
  };
  topAttractions?: string[];
  topRestaurants?: string[];
  bestMonths?: string[];
  availableCities?: string[];
  message?: string;
}

export interface HotelSearchInput {
  city: string;
  budget?: "low" | "medium" | "high";
}

export interface HotelSearchOutput {
  city: string;
  hotels: Array<{
    name: string;
    nameEn: string;
    budget: string;
    priceRange: string;
    rating: number;
    address?: string;
    highlights?: string[];
    bookingTips?: string;
  }>;
  message?: string;
}

export interface FoodSearchInput {
  city: string;
  cuisine?: string;
  budget?: "low" | "medium" | "high";
}

export interface FoodSearchOutput {
  city: string;
  budget: string;
  restaurants: Array<{
    name: string;
    nameEn: string;
    type: string;
    cuisine: string;
    avgPrice: string;
    highlights: string[];
    rating?: number;
    address?: string;
  }>;
}

export interface TransportSearchInput {
  from: string;
  to: string;
}

export interface TransportSearchOutput {
  from: string;
  to: string;
  options: Array<{
    type: string;
    duration: string;
    price: string;
    tips: string;
  }>;
  message?: string;
}

export interface WeatherSearchInput {
  city: string;
}

export interface WeatherSearchOutput {
  city: string;
  climate: string;
  bestMonths: string[];
  avgSummerTemp: string;
  avgWinterTemp: string;
  tips: string;
}

export interface VisaInfoInput {
  nationality: string;
}

export interface VisaInfoOutput {
  nationality: string;
  visaType: string;
  duration: string;
  requirements: string[];
  notes: string[];
}

export interface TranslationInput {
  text: string;
  targetLang: string;
  sourceLang?: string;
}

export interface TranslationOutput {
  original: string;
  translated: string;
  pronunciation?: string;
  sourceLang: string;
  targetLang: string;
}

export interface EmergencyInfoInput {
  city?: string;
}

export interface EmergencyInfoOutput {
  emergencyNumbers: EmergencyNumber[];
  hospitals: Array<{
    name: string;
    phone: string;
    address: string;
    notes?: string;
  }>;
  tips: string[];
}

export interface SubwayRouteInput {
  city: string;
  from: string;
  to: string;
}

export interface SubwayRouteOutput {
  city: string;
  from: string;
  to: string;
  route: Array<{
    line: string;
    stations: number;
    duration: string;
    cost: string;
  }>;
  tips: string[];
}

export interface BudgetCalculatorInput {
  city: string;
  days: number;
  budgetLevel: "budget" | "midRange" | "luxury";
  travelers?: number;
}

export interface BudgetCalculatorOutput {
  city: string;
  days: number;
  budgetLevel: string;
  breakdown: {
    accommodation: number;
    food: number;
    transport: number;
    attractions: number;
    total: number;
    perDay: number;
  };
  currency: "¥";
  tips: string[];
}

export interface RouteOptimizerInput {
  city: string;
  attractions: string[];
  days: number;
}

export interface RouteOptimizerOutput {
  city: string;
  optimizedDays: Array<{
    day: number;
    theme: string;
    stops: Array<{
      name: string;
      order: number;
      suggestedTime: string;
      duration: string;
    }>;
  }>;
  totalDistance: string;
  tips: string[];
}

export interface CulturalTipsInput {
  city: string;
}

export interface CulturalTipsOutput {
  city: string;
  tips: Array<{
    title: string;
    content: string;
    importance: "high" | "medium" | "low";
  }>;
}

export interface PaymentGuideInput {
  city?: string;
}

export interface PaymentGuideOutput {
  methods: Array<{
    name: string;
    description: string;
    setup: string;
    tips: string[];
  }>;
  generalTips: string[];
}

export interface CrowdLevelInput {
  city: string;
  attraction?: string;
  month?: string;
}

export interface CrowdLevelOutput {
  city: string;
  attraction?: string;
  month?: string;
  level: "low" | "moderate" | "high" | "extreme";
  tips: string[];
  bestTimes: string[];
}

export interface NearbyPOIInput {
  city: string;
  type: "restaurant" | "attraction" | "hotel" | "hospital" | "metro";
  near?: string;
}

export interface NearbyPOIOutput {
  city: string;
  type: string;
  near?: string;
  results: Array<{
    name: string;
    nameEn?: string;
    distance: string;
    type: string;
    rating?: number;
    price?: string;
  }>;
}

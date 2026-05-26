/**
 * ChinaConnect AI Types
 * Type definitions for AI planning system
 */

// ============================================
// Intent & Workflow Types
// ============================================

export type IntentType =
  | "travel_planning"
  | "business_arrangement"
  | "food_recommendation"
  | "emergency_help"
  | "life_consultation"
  | "casual_chat";

export interface IntentResult {
  intent: IntentType;
  confidence: number;
  secondaryIntents: IntentType[];
  reasoning: string;
  suggestedParams: {
    destination?: string;
    timeIndicator?: string;
    location?: string;
  };
}

export type WorkflowStep =
  | "intent_recognition"
  | "parameter_extraction"
  | "city_matching"
  | "route_generation"
  | "content_enrichment"
  | "practical_info"
  | "formatting"
  | "saving";

export interface WorkflowProgress {
  step: number;
  stepName: string;
  stepKey: WorkflowStep;
  progress: number; // 0-100
  data?: unknown;
}

// ============================================
// Tool Types
// ============================================

export type ToolName =
  | "city_database"
  | "weather_api"
  | "hotel_search"
  | "transport_search"
  | "translation_api"
  | "map_service"
  | "anysearch";

export interface ToolCall {
  name: ToolName;
  parameters: Record<string, unknown>;
  result?: unknown;
  error?: string;
  timestamp: number;
}

export interface ToolDefinition {
  name: ToolName;
  description: string;
  parameters: {
    name: string;
    type: "string" | "number" | "boolean" | "object" | "array";
    required: boolean;
    description: string;
  }[];
}

// ============================================
// Message Types
// ============================================

export type MessageRole = "user" | "assistant" | "system";

export interface MessageCitation {
  text: string;
  index: number;
  score: number;
  url?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  citations?: MessageCitation[];
  toolCalls?: ToolCall[];
  workflowProgress?: WorkflowProgress;
  intentResult?: IntentResult;
}

export interface ParsedItinerary {
  summary: ItinerarySummary;
  dailyItinerary: DailyPlan[];
  practicalInfo?: PracticalInfo[];
}

export interface ItinerarySummary {
  destination: string;
  totalDays: number;
  bestSeason: string;
  estimatedTotalCost: number;
  currency: string;
  costBreakdown: {
    accommodation: number;
    food: number;
    transport: number;
    attractions: number;
  };
  topHighlights: string[];
  travelTips: string[];
}

export interface DailyPlan {
  day: number;
  theme: string;
  dailyCost: number;
  locations: PlannedLocation[];
  meals: {
    breakfast?: MealPlan;
    lunch?: MealPlan;
    dinner?: MealPlan;
  };
  transportToAttractions: TransportSegment;
  accommodation?: AccommodationPlan;
}

export interface PlannedLocation {
  name: string;
  nameZh?: string;
  coordinates: { lat: number; lng: number };
  durationHours: number;
  bestTimeStart: string;
  bestTimeEnd: string;
  ticketInfo: {
    price: string;
    bookingRequired: boolean;
    bookingUrl?: string;
    discounts?: string[];
  };
  highlights: string[];
  insiderTip?: string;
  photographySpots?: string[];
}

export interface MealPlan {
  name: string;
  cuisine: string;
  priceRange: string;
  recommendedDishes?: string[];
  location: string;
  distanceFromAttraction?: string;
  reservationRequired?: boolean;
}

export interface TransportSegment {
  type: "metro" | "taxi" | "walk" | "bus" | "train" | "flight";
  route: string;
  duration: string;
  cost: string;
  tips?: string[];
}

export interface AccommodationPlan {
  name: string;
  stars: number;
  pricePerNight: string;
  location: string;
  nearestMetro?: string;
  highlights: string[];
}

export interface PracticalInfo {
  category: string;
  title: string;
  content: string;
  importance: "high" | "medium" | "low";
}

// ============================================
// Conversation & Memory Types
// ============================================

export interface Conversation {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  itinerary?: ParsedItinerary;
  userParams?: ExtractedParams;
}

export interface SavedItinerary {
  id: string;
  name: string;
  destination: string;
  days: number;
  createdAt: string;
  updatedAt: string;
  data: ParsedItinerary;
  shareCode?: string;
}

// Short-term memory (session)
export interface ShortTermMemory {
  conversationId: string;
  messages: Message[];
  currentItinerary?: ParsedItinerary;
  currentParams?: ExtractedParams;
  currentIntent?: IntentResult;
  toolCalls: ToolCall[];
}

// Long-term memory (localStorage)
export interface LongTermMemory {
  savedItineraries: SavedItinerary[];
  userPreferences: UserPreferences;
  conversationHistory: ConversationSummary[];
}

export interface UserPreferences {
  defaultLanguage: "en" | "zh" | "ja" | "ko";
  defaultBudget: "budget" | "medium" | "luxury";
  preferredTravelStyles: string[];
  visitedCities: string[];
  favoriteAttractions: string[];
}

export interface ConversationSummary {
  id: string;
  name: string;
  destination?: string;
  days?: number;
  createdAt: string;
  messageCount: number;
  hasItinerary: boolean;
}

// ============================================
// Parameter Extraction
// ============================================

export interface ExtractedParams {
  destination: string;
  days?: number;
  budgetLevel: "budget" | "medium" | "luxury";
  groupSize: number;
  travelDates?: string;
  transportPreference?: "train" | "flight" | "any";
  travelStyles: string[];
  specialNeeds?: string[];
  language: "en" | "zh" | "ja" | "ko";
}

// ============================================
// AI Configuration
// ============================================

export interface AIConfig {
  apiUrl: string;
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export interface ReActState {
  step: number;
  thought: string;
  action: string;
  actionInput: Record<string, unknown>;
  observation: string;
  finalAnswer?: string;
}

// ============================================
// API Response Types
// ============================================

export interface WeatherResponse {
  location: {
    city: string;
    coordinates: { lat: number; lng: number };
  };
  forecast: Array<{
    date: string;
    weather: {
      condition: string;
      temperatureC: { min: number; max: number };
      humidityPercent: number;
      windKmh: number;
    };
    travelAdvisory: {
      goodForOutdoor: boolean;
      warnings: string[];
      recommendations: string[];
    };
  }>;
}

export interface HotelSearchParams {
  city: string;
  checkIn?: string;
  checkOut?: string;
  priceRange?: { min: number; max: number };
  starRating?: number[];
  locationPreference?: string;
  amenities?: string[];
  userRatingMin?: number;
}

export interface TransportSearchParams {
  fromCity: string;
  toCity: string;
  date: string;
  transportType?: "train" | "flight" | "all";
  timePreference?: "morning" | "afternoon" | "evening" | "any";
  passengers?: { adults: number; children: number; infants: number };
}

export interface TranslationParams {
  text: string;
  sourceLang?: string;
  targetLang: "en" | "zh" | "ja" | "ko" | "es" | "fr" | "de";
}

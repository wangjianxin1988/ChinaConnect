/**
 * Itinerary Builder
 * Converts raw conversations and stored ai_routes rows into SavedItinerary
 * objects that the chat sidebar and ItineraryDisplay can render.
 */

import type {
  AccommodationPlan,
  DailyPlan,
  MealPlan,
  Message,
  ParsedItinerary,
  PlannedLocation,
  SavedItinerary,
  TransportSegment,
} from "./types";
import { extractRouteFromConversation, type ExtractedRoute } from "./route-saver";

// ---------------------------------------------------------------------------
// ExtractedRoute -> SavedItinerary
// ---------------------------------------------------------------------------

function parseBestTime(raw: string): { start: string; end: string } {
  if (!raw) return { start: "", end: "" };
  const parts = raw.split(/\s*-\s*/);
  if (parts.length >= 2) return { start: parts[0].trim(), end: parts[1].trim() };
  return { start: raw.trim(), end: "" };
}

function toPlannedLocation(loc: {
  name: string;
  nameZh?: string;
  lat: number;
  lng: number;
  durationHours: number;
  bestTime: string;
  ticketPrice: string;
  highlights: string[];
  insiderTip?: string;
}): PlannedLocation {
  const t = parseBestTime(loc.bestTime);
  return {
    name: loc.name,
    nameZh: loc.nameZh,
    coordinates: { lat: loc.lat, lng: loc.lng },
    durationHours: loc.durationHours,
    bestTimeStart: t.start,
    bestTimeEnd: t.end,
    ticketInfo: {
      price: loc.ticketPrice ?? "",
      bookingRequired: false,
    },
    highlights: loc.highlights ?? [],
    insiderTip: loc.insiderTip,
  };
}

function toMealPlan(name: string | undefined): MealPlan | undefined {
  if (!name) return undefined;
  return { name, cuisine: "", priceRange: "", location: "" };
}

function toDailyPlan(day: {
  day: number;
  theme: string;
  dailyCost: number;
  locations: Array<{
    name: string;
    nameZh?: string;
    lat: number;
    lng: number;
    durationHours: number;
    bestTime: string;
    ticketPrice: string;
    highlights: string[];
    insiderTip?: string;
  }>;
  meals?: { breakfast?: string; lunch?: string; dinner?: string };
  transport: string;
  accommodation?: string;
  notes?: string[];
}): DailyPlan {
  const transportSegment: TransportSegment = {
    type: "walk",
    route: day.transport || "",
    duration: "",
    cost: "",
  };
  const accommodation: AccommodationPlan | undefined = day.accommodation
    ? { name: day.accommodation, stars: 0, pricePerNight: "", location: "", highlights: [] }
    : undefined;
  return {
    day: day.day,
    theme: day.theme || "",
    dailyCost: day.dailyCost || 0,
    locations: (day.locations || []).map(toPlannedLocation),
    meals: {
      breakfast: toMealPlan(day.meals?.breakfast),
      lunch: toMealPlan(day.meals?.lunch),
      dinner: toMealPlan(day.meals?.dinner),
    },
    transportToAttractions: transportSegment,
    accommodation,
    notes: day.notes,
  };
}

/** Convert an extracted route (from a conversation or ai_routes row) into a SavedItinerary. */
export function extractedRouteToSavedItinerary(route: ExtractedRoute): SavedItinerary {
  const data: ParsedItinerary = {
    summary: {
      destination: route.destination,
      totalDays: route.days || 1,
      bestSeason: "",
      estimatedTotalCost: route.totalEstimatedCost || 0,
      currency: route.currency || "CNY",
      costBreakdown: { accommodation: 0, food: 0, transport: 0, attractions: 0 },
      topHighlights: route.highlights || [],
      travelTips: route.tips || [],
    },
    dailyItinerary: (route.dailyPlans || []).map(toDailyPlan),
  };
  return {
    id: "local_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
    name: route.titleZh || route.title,
    destination: route.destination,
    days: route.days || 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: {
      ...data,
      rawPlan: route.rawPlan || undefined,
    },
  };
}

/**
 * Try to build a SavedItinerary from the current conversation messages.
 * Returns null when no destination can be identified yet.
 */
export function buildSavedItineraryFromConversation(messages: Message[]): SavedItinerary | null {
  const route = extractRouteFromConversation(messages, null);
  if (!route) return null;
  return extractedRouteToSavedItinerary(route);
}

/**
 * Fallback itinerary builder — always produces a SavedItinerary from the last
 * assistant reply so the "Save itinerary" button is available after every
 * completed exchange, even when destination parsing is ambiguous.
 */
export function buildFallbackItinerary(messages: Message[]): SavedItinerary | null {
  let content = "";
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "assistant" && messages[i].content.trim()) {
      content = messages[i].content.trim();
      break;
    }
  }
  if (!content) return null;

  const route = extractRouteFromConversation(messages, null);
  const destination = route?.destination || "China Travel";
  const days = route?.days || 1;
  const highlights = route?.highlights || [];

  const data: ParsedItinerary = {
    summary: {
      destination,
      totalDays: days,
      bestSeason: "",
      estimatedTotalCost: route?.totalEstimatedCost || 0,
      currency: route?.currency || "CNY",
      costBreakdown: { accommodation: 0, food: 0, transport: 0, attractions: 0 },
      topHighlights: highlights,
      travelTips: route?.tips || [],
    },
    dailyItinerary: (route?.dailyPlans || []).map(toDailyPlan),
    rawPlan: content,
  };

  const generic = destination === "China Travel";
  return {
    id: "local_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
    name: generic ? "Travel Plan" : `${destination} ${days}-Day Trip`,
    destination,
    days,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data,
  };
}

// ---------------------------------------------------------------------------
// ai_routes row -> SavedItinerary
// ---------------------------------------------------------------------------

interface RouteRow {
  id: string;
  title: string | null;
  title_zh?: string | null;
  summary?: string | null;
  summary_zh?: string | null;
  days?: number | null;
  route_data?: {
    destination?: string | null;
    days?: Array<Record<string, unknown>>;
    total_estimated_cost?: number;
    currency?: string;
    transport_summary?: string[];
    highlights?: string[];
    tips?: string[];
    raw_plan?: string | null;
  } | null;
  created_at?: string | null;
  updated_at?: string | null;
}

function destinationFromTitle(title: string): string {
  const match = title.match(/^(.+?)(?:\s+\d+\s*-?\s*Day|\s+\d+\s*日| Trip|\s+之旅)/i);
  return match ? match[1].trim() : title;
}

/** Convert an ai_routes row (from Supabase) into a SavedItinerary. */
export function routeRowToSavedItinerary(row: RouteRow): SavedItinerary {
  const rd = row.route_data ?? {};
  const destination = rd.destination || destinationFromTitle(row.title || "");
  const rawDays = Array.isArray(rd.days) ? (rd.days as Array<Record<string, unknown>>) : [];
  const daysCount = row.days || rawDays.length || 1;

  const dailyItinerary: DailyPlan[] = rawDays.map((raw) => {
    const day = raw as unknown as {
      day?: number;
      theme?: string;
      dailyCost?: number;
      locations?: Array<{
        name: string;
        nameZh?: string;
        lat: number;
        lng: number;
        durationHours: number;
        bestTime: string;
        ticketPrice: string;
        highlights: string[];
        insiderTip?: string;
      }>;
      meals?: { breakfast?: string; lunch?: string; dinner?: string };
      transport?: string;
      accommodation?: string;
      notes?: string[];
    };
    return toDailyPlan({
      day: day.day ?? 1,
      theme: day.theme ?? "",
      dailyCost: day.dailyCost ?? 0,
      locations: day.locations ?? [],
      meals: day.meals,
      transport: day.transport ?? "",
      accommodation: day.accommodation,
      notes: day.notes,
    });
  });

  const data: ParsedItinerary = {
    summary: {
      destination,
      totalDays: daysCount,
      bestSeason: "",
      estimatedTotalCost: rd.total_estimated_cost ?? 0,
      currency: rd.currency ?? "CNY",
      costBreakdown: { accommodation: 0, food: 0, transport: 0, attractions: 0 },
      topHighlights: rd.highlights ?? [],
      travelTips: rd.tips ?? [],
    },
    dailyItinerary,
    rawPlan: rd.raw_plan ?? undefined,
  };

  return {
    id: row.id,
    name: row.title_zh || row.title || "Saved itinerary",
    destination,
    days: daysCount,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
    data,
  };
}

// ---------------------------------------------------------------------------
// SavedItinerary -> ExtractedRoute (for persistence)
// ---------------------------------------------------------------------------

/** Convert a SavedItinerary back into an ExtractedRoute so it can be saved to ai_routes. */
export function savedItineraryToExtractedRoute(it: SavedItinerary): ExtractedRoute {
  return {
    title: it.name,
    titleZh: it.name,
    summary: it.data.summary.topHighlights.join(", ") || it.name,
    summaryZh: "",
    rawPlan: it.data.rawPlan,
    destination: it.destination,
    days: it.days || it.data.summary.totalDays || 1,
    dailyPlans: (it.data.dailyItinerary || []).map((d) => ({
      day: d.day,
      theme: d.theme,
      dailyCost: d.dailyCost,
      locations: (d.locations || []).map((l) => ({
        name: l.name,
        nameZh: l.nameZh,
        lat: l.coordinates.lat,
        lng: l.coordinates.lng,
        durationHours: l.durationHours,
        bestTime: [l.bestTimeStart, l.bestTimeEnd].filter(Boolean).join("-"),
        ticketPrice: l.ticketInfo?.price ?? "",
        highlights: l.highlights ?? [],
        insiderTip: l.insiderTip,
      })),
      meals: {
        breakfast: d.meals?.breakfast?.name,
        lunch: d.meals?.lunch?.name,
        dinner: d.meals?.dinner?.name,
      },
      transport: d.transportToAttractions?.route || "",
      accommodation: d.accommodation?.name,
    })),
    totalEstimatedCost: it.data.summary.estimatedTotalCost ?? 0,
    currency: it.data.summary.currency || "CNY",
    highlights: it.data.summary.topHighlights ?? [],
    tips: it.data.summary.travelTips ?? [],
    transportSummary: [],
    travelStyle: "comfort",
    tags: [],
    aiModel: "",
    aiProvider: "",
  };
}

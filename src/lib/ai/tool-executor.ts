/**
 * Tool Executor for ChinaConnect AI
 * Maps tool names to their execution functions.
 * Used by MiniMaxClient to dispatch tool calls during AI conversations.
 */

import { executeWebSearch, type WebSearchParams, type WebSearchResult } from "@/lib/ai/search/web-search";
import { executeAmapPOISearch, type AmapPOIParams, type AmapPOIResult } from "@/lib/ai/search/amap-poi";
import { executeAmapRouteSearch, type AmapRouteParams, type AmapRouteResult } from "@/lib/ai/search/amap-route";
import {
  CitySearch,
  HotelSearch,
  FoodSearch,
  TransportSearch,
  VisaInfo,
  TranslationHelper,
  WeatherInfo,
  EmergencyInfo,
  SubwayRoute,
  BudgetCalculator,
  RouteOptimizer,
  CulturalTips,
  PaymentGuide,
  CrowdLevel,
  NearbyPOI,
} from "@/lib/ai/tools";

// ============================================
// Union type for all tool results
// ============================================

type ToolResult = Record<string, unknown>;

// ============================================
// Tool Executor Type
// ============================================

export type ToolExecutorFn = (args: Record<string, string>) => Promise<ToolResult> | ToolResult;

// ============================================
// Tool Executor Map
// ============================================

/**
 * Maps tool names (as used in MiniMax function_call) to their execution functions.
 * All tools are async — local tools call real-time APIs (Amap, WebSearch, OpenMete)
 * with fallback to static data.
 */
export const TOOL_EXECUTOR_MAP: Record<string, ToolExecutorFn> = {
  // ── City & travel tools (async — real-time APIs + static fallback) ──
  CitySearch: (p) => CitySearch({ city: p.city }),
  HotelSearch: (p) => HotelSearch({ city: p.city, budget: p.budget }),
  FoodSearch: (p) => FoodSearch({ city: p.city, cuisine: p.cuisine, budget: p.budget }),
  TransportSearch: (p) => TransportSearch({ from: p.from, to: p.to }),
  VisaInfo: (p) => VisaInfo({ nationality: p.nationality }),
  TranslationHelper: (p) => TranslationHelper({ text: p.text, targetLang: p.targetLang, sourceLang: p.sourceLang }),
  WeatherInfo: (p) => WeatherInfo({ city: p.city }),
  EmergencyInfo: (p) => EmergencyInfo({ city: p.city }),
  SubwayRoute: (p) => SubwayRoute({ city: p.city, from: p.from, to: p.to }),
  BudgetCalculator: (p) => BudgetCalculator({ city: p.city, days: Number(p.days) || 3, budgetLevel: p.budgetLevel, travelers: Number(p.travelers) || 1 }),
  RouteOptimizer: (p) => RouteOptimizer({ city: p.city, attractions: p.attractions ? p.attractions.split(",") : undefined, days: Number(p.days) || 1 }),
  CulturalTips: (p) => CulturalTips({ city: p.city }),
  PaymentGuide: (p) => PaymentGuide({ city: p.city }),
  CrowdLevel: (p) => CrowdLevel({ city: p.city, attraction: p.attraction, month: p.month }),
  NearbyPOI: (p) => NearbyPOI({ city: p.city, type: p.type, near: p.near }),

  // ── Search tools (async) ──
  WebSearch: (p) =>
    executeWebSearch({
      query: p.query,
      location: p.location,
      maxResults: p.maxResults ? Number(p.maxResults) : undefined,
    } satisfies WebSearchParams),

  AmapPOISearch: (p) =>
    executeAmapPOISearch({
      keywords: p.keywords,
      city: p.city,
      type: p.type,
      page: p.page ? Number(p.page) : undefined,
      pageSize: p.pageSize ? Number(p.pageSize) : undefined,
    } satisfies AmapPOIParams),

  AmapRouteSearch: (p) =>
    executeAmapRouteSearch({
      origin: p.origin,
      destination: p.destination,
      mode: p.mode as "driving" | "transit" | "walking" | "riding" | undefined,
      city: p.city,
      strategy: p.strategy ? Number(p.strategy) : undefined,
    } satisfies AmapRouteParams),
};

// ============================================
// Main Execute Function
// ============================================

/**
 * Execute a tool by name with the given arguments.
 * Handles both sync and async tool functions.
 * Returns a JSON string suitable for the AI tool response.
 */
export async function executeToolByName(name: string, args: Record<string, string>): Promise<string> {
  const executor = TOOL_EXECUTOR_MAP[name];
  if (!executor) {
    return JSON.stringify({
      success: false,
      error: `Unknown tool: ${name}. Available tools: ${Object.keys(TOOL_EXECUTOR_MAP).join(", ")}`,
    });
  }

  try {
    const result = await executor(args);
    return JSON.stringify(result);
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: `Tool execution failed: ${String(error)}`,
    });
  }
}

// ============================================
// Tool List Helper
// ============================================

/** Get all available tool names */
export function getAvailableToolNames(): string[] {
  return Object.keys(TOOL_EXECUTOR_MAP);
}

/** Check if a tool exists */
export function hasTool(name: string): boolean {
  return name in TOOL_EXECUTOR_MAP;
}

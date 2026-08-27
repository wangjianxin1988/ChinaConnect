/**
 * Route Saver - Auto-save routes and conversation snapshots
 * Offline-first: localStorage primary, Supabase as backup/sync target.
 *
 * Flow:
 *   1. During conversation: auto-save snapshots every N messages (localStorage)
 *   2. When itinerary is complete: extract compact route, save to ai_routes
 *   3. Sync to Supabase when online
 */

import { supabase } from "@/services/supabase";
import { parseDailyPlansFromContent } from "./parse-days";

import { getLocalStorageManager, type ConversationSnapshot } from "./local-storage-manager";
import {
  ITINERARY_LANGS,
  localizeSummary,
  localizeTitle,
  normalizeItineraryLang,
} from "./itinerary-i18n";
import type {
  ConversationSummary,
  DailyPlan,
  Message,
  ParsedItinerary,
  PlannedLocation,
  SavedItinerary,
} from "./types";

// ============================================
// Types
// ============================================

/** Compact route object stored in ai_routes table */
export interface ExtractedRoute {
  title: string;
  titleZh?: string;
  /** Per-language localized titles (keyed by ItineraryLang). */
  titleLocalized?: Record<string, string>;
  summary: string;
  summaryZh?: string;
  /** Per-language localized summaries (keyed by ItineraryLang). */
  summaryLocalized?: Record<string, string>;
  destination: string;
  days: number;
  dailyPlans: ExtractedDayPlan[];
  totalEstimatedCost: number;
  currency: string;
  highlights: string[];
  tips: string[];
  transportSummary: string[];
  travelStyle: "budget" | "comfort" | "luxury" | "adventure" | "cultural" | "foodie" | "family";
  tags: string[];
  startDate?: string;
  endDate?: string;
  rawPlan?: string;
  aiModel: string;
  aiProvider: string;
}

export interface ExtractedDayPlan {
  day: number;
  theme: string;
  dailyCost: number;
  locations: ExtractedLocation[];
  meals: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  transport: string;
  accommodation?: string;
  notes?: string[];
}

export interface ExtractedLocation {
  name: string;
  nameZh?: string;
  lat: number;
  lng: number;
  durationHours: number;
  bestTime: string;
  ticketPrice: string;
  highlights: string[];
  insiderTip?: string;
}

// ============================================
// Config
// ============================================

/** How many messages between auto-snapshots */
const SNAPSHOT_INTERVAL = 4;

/** MiniMax model info */
const AI_MODEL = "MiniMax-M2.7-highspeed";
const AI_PROVIDER = "minimax";

// ============================================
// Route Extraction
// ============================================

/**
 * Extract a compact route object from a raw conversation and parsed itinerary.
 * This is the key function that converts verbose AI output into a storable route.
 */
export function extractRouteFromConversation(
  messages: Message[],
  itinerary?: ParsedItinerary | null,
  userParams?: { destination?: string; days?: number; budgetLevel?: string },
  language: string = "en",
): ExtractedRoute | null {
  // Try to get data from itinerary first, fall back to message parsing
  const destination =
    itinerary?.summary?.destination ||
    userParams?.destination ||
    extractDestinationFromMessages(messages);

  const days =
    itinerary?.summary?.totalDays || userParams?.days || extractDaysFromMessages(messages);

  if (!destination) return null;

  // Keep the full assistant reply (markdown with booking links) so saved
  // itineraries always contain the detailed confirmed plan. In multi-turn
  // conversations the final CONFIRMED plan is selected (last full day-plan).
  const rawPlan = getFinalPlanContent(messages) || "";

  // Build daily plans: structured itinerary first, else parse day sections
  // from the assistant reply (multi-language).
  const dailyPlans: ExtractedDayPlan[] = itinerary?.dailyItinerary
    ? itinerary.dailyItinerary.map(extractDayPlan)
    : rawPlan
      ? parseDailyPlansFromContent(rawPlan)
      : [];

  // Determine travel style from budget level or itinerary hints
  const travelStyle = determineTravelStyle(userParams?.budgetLevel, messages);

  // Generate title
  const title = days ? `${destination} ${days}-Day Trip` : `Trip to ${destination}`;
  const titleZh = days ? `${destination}${days}日游` : `${destination}之旅`;

  // Generate summary from highlights or itinerary
  const highlights = itinerary?.summary?.topHighlights || extractHighlightsFromMessages(messages);
  const tips = itinerary?.summary?.travelTips || [];
  const summary = generateSummary(destination, days, highlights);
  const summaryZh = generateSummaryZh(destination, days, highlights);

  // Per-language title/summary so saved routes always display in the
  // user's own language (schema keeps title/title_zh; title_i18n holds the rest).
  const langKey = normalizeItineraryLang(language);
  const titleLocalized: Record<string, string> = {};
  const summaryLocalized: Record<string, string> = {};
  for (const l of ITINERARY_LANGS) {
    titleLocalized[l] = localizeTitle(l, destination, days);
    summaryLocalized[l] = localizeSummary(l, destination, days, highlights);
  }
  titleLocalized[langKey] = localizeTitle(langKey, destination, days);
  summaryLocalized[langKey] = localizeSummary(langKey, destination, days, highlights);

  // Extract transport summary
  const transportSummary = dailyPlans.map((dp) => dp.transport).filter((t) => t && t !== "walk");

  // Generate tags
  const tags = generateTags(destination, travelStyle, days);

  return {
    title,
    titleZh,
    titleLocalized,
    summary,
    summaryZh,
    summaryLocalized,
    destination,
    days: days || 1,
    dailyPlans,
    totalEstimatedCost: itinerary?.summary?.estimatedTotalCost || 0,
    currency: itinerary?.summary?.currency || "CNY",
    highlights,
    tips,
    transportSummary,
    travelStyle,
    tags,
    rawPlan,
    aiModel: AI_MODEL,
    aiProvider: AI_PROVIDER,
  };
}

// ----------------------------------------
// Extraction Helpers
// ----------------------------------------

function extractDayPlan(day: DailyPlan): ExtractedDayPlan {
  return {
    day: day.day,
    theme: day.theme,
    dailyCost: day.dailyCost,
    locations: (day.locations || []).map(extractLocation),
    meals: {
      breakfast: day.meals?.breakfast?.name,
      lunch: day.meals?.lunch?.name,
      dinner: day.meals?.dinner?.name,
    },
    transport: day.transportToAttractions
      ? day.transportToAttractions.type + ": " + day.transportToAttractions.route
      : "",
    accommodation: day.accommodation?.name,
  };
}

function extractLocation(loc: PlannedLocation): ExtractedLocation {
  return {
    name: loc.name,
    nameZh: loc.nameZh,
    lat: loc.coordinates?.lat || 0,
    lng: loc.coordinates?.lng || 0,
    durationHours: loc.durationHours,
    bestTime: loc.bestTimeStart + " - " + loc.bestTimeEnd,
    ticketPrice: loc.ticketInfo?.price || "Free",
    highlights: loc.highlights || [],
    insiderTip: loc.insiderTip,
  };
}

function getLastAssistantContent(messages: Message[]): string | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "assistant" && messages[i].content.trim()) {
      return messages[i].content.trim();
    }
  }
  return undefined;
}

/**
 * Pick the FINAL confirmed itinerary from a multi-turn conversation.
 *
 * Heuristics:
 *  - An assistant message that looks like a complete day-by-day plan (contains
 *    day markers and/or several clock times) is preferred over a short reply.
 *  - Among plan-looking messages the LAST one wins (it reflects the user's
 *    final refinements).
 *  - Short confirmations ("Sure!", "Happy to help") are never chosen as the
 *    saved plan; we fall back to the most recent full plan.
 */
export function getFinalPlanContent(messages: Message[]): string | undefined {
  let lastFallback: string | undefined;
  let lastPlan: string | undefined;
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role !== "assistant" || !msg.content.trim()) continue;
    const content = msg.content.trim();
    if (!lastFallback) lastFallback = content;
    if (looksLikeFullPlan(content)) {
      lastPlan = content;
      break;
    }
  }
  return lastPlan || lastFallback;
}

/** Multi-language day-plan signatures used to spot a full itinerary reply. */
const PLAN_SIGNATURES: RegExp[] = [
  /\bday\s+\d+/i,            // en
  /第\s*\d+\s*天/,            // zh
  /第\s*\d+\s*[日天]/,        // ja / zh-TW
  /\d+\s*일차/,                // ko
  /(?:ngày|day)\s+\d+/i,     // vi / en
  /[дд]ень\s*\d+/i,          // ru
  /(?:jour|journée)\s*\d+/i, // fr
  /tag\s*\d+/i,               // de
  /اليوم\s*\d+|يوم\s*\d+/,   // ar
  /روز\s*\d+|روز\d+/i,       // fa
  /วันที่\s*\d+/,              // th
];

function looksLikeFullPlan(content: string): boolean {
  // A full plan usually has day markers and multiple time-stamped entries.
  const hasDay = PLAN_SIGNATURES.some((re) => re.test(content));
  const timeCount = (content.match(/\b(?:0?\d|1\d|2[0-3])[:：]\d{2}\b/g) || []).length;
  const bulletCount = (content.match(/^[-*•·]\s+/gm) || []).length;
  return hasDay && (timeCount >= 2 || bulletCount >= 4);
}

const DESTINATION_PATTERNS: RegExp[] = [
  // English
  /(?:visit|go to|travel to|trip to|explore|heading to|going to|want to (?:go|travel|visit)|plan (?:a |my )?(?:trip|travel|visit|itinerary) to)\s+([A-Za-z][A-Za-z\u00C0-\u024F\u4e00-\u9fff\s'\-]{1,40}?)(?=\s*(?:,|\n|[。，.。!?；;]|for |in |on |from |$))/i,
  // Chinese (simplified/traditional)
  /(?:去|前往|到|想去|打算去|计划去|安排去|游玩|旅游|旅行)\s*(?:一下)?\s*([\u4e00-\u9fffA-Za-z]{2,12})/,
  // Japanese
  /(?:へ|に|で)\s*(?:旅行|旅|観光|行く|訪れる)|(?:旅行|観光|旅)\s*(?:先|は)\s*([\u4e00-\u9fffA-Za-z]{2,12})/,
  // Korean
  /(?:여행|가고|가고 싶|방문|계획)\s*(?:할까|해|합니다|이에요|이야)?\s*([가-힣A-Za-z]{2,12})/,
  // Vietnamese
  /(?:đến|tới|đi|du lịch|tham quan)\s+([A-Za-z\u00C0-\u024F]{2,20})/i,
  // Russian
  /(?:поехать|поездка|путешествие|отправиться|посетить)\s+(?:в|во|на)\s+([A-Za-z\u0400-\u04FF]{2,20})/i,
  // French
  /(?:visiter|aller|voyager|partir|voyage)\s+(?:à|a|en|au|aux|pour)\s+([A-Za-z\u00C0-\u024F]{2,20})/i,
  // German
  /(?:reisen|fahren|fliegen|besuchen|Reise)\s+(?:nach|in|zu)\s+([A-Za-z\u00C0-\u024F]{2,20})/i,
  // Arabic
  /(?:سفر|زيارة|الذهاب|السفر)\s+(?:إلى|الي|الى)\s+([\u0600-\u06FF A-Za-z]{2,20})/i,
  // Persian
  /(?:سفر|گردش|رفتن|بازدید)\s+(?:به|ب)\s+([\u0600-\u06FF A-Za-z]{2,20})/i,
  // Thai
  /(?:เที่ยว|ไป|เดินทาง|ท่องเที่ยว)\s+([\u0E00-\u0E7F A-Za-z]{2,20})/i,
];

function extractDestinationFromMessages(messages: Message[]): string | undefined {
  const clean = (raw: string): string =>
    raw.trim().replace(/^[\s\-—:：|]+|[\s\-—:：|]+$/g, "");

  // Look in user messages first
  for (const msg of messages) {
    if (msg.role !== "user") continue;
    for (const re of DESTINATION_PATTERNS) {
      const match = msg.content.match(re);
      if (match?.[1]) {
        const value = clean(match[1]);
        if (value && value.length >= 2) return value;
      }
    }
    // Fallback: any CJK city-like token (2-6 chars) after common verbs
    const cjk = msg.content.match(/[\u4e00-\u9fff]{2,6}(?:市|城)?/);
    if (cjk && cjk[0] && !/^(你好|请问|帮我|计划|安排|准备|想要|希望|谢谢|再见|好的|中国|旅游|旅行|行程|酒店|美食|交通|景点|几天|预算|大概|多少)$/.test(cjk[0])) {
      return cjk[0];
    }
  }
  // Then look in assistant messages for destination headers
  for (const msg of messages) {
    if (msg.role !== "assistant") continue;
    const match = msg.content.match(
      /(?:#{1,3}\s*)?(?:Trip to|Itinerary.*?for|Exploring|行程|旅行|旅程|Plan for|Reise(?:plan)? (?:nach|für)|Путешествие в|Voyage à|Viaggio a)\s+([A-Za-z\u00C0-\u024F\u4e00-\u9fff\s'\-]{2,40})/i,
    );
    if (match?.[1]) {
      const value = clean(match[1]);
      if (value) return value;
    }
  }
  return undefined;
}

const DAY_COUNT_PATTERNS: RegExp[] = [
  /(\d+)\s*(?:day|days|night|nights|天|日|日間|일|วัน|ngày|дней|дня|день|jours|tages|tage|أيام|روز|日目)/i,
  /(?:第|day|jour|день|ngày|วัน)\s*(\d+)\s*(?:天|日|일|วัน|ngày)?/i,
];

function extractDaysFromMessages(messages: Message[]): number | undefined {
  for (const msg of messages) {
    if (msg.role !== "user") continue;
    for (const re of DAY_COUNT_PATTERNS) {
      const match = msg.content.match(re);
      if (match?.[1]) {
        const n = parseInt(match[1], 10);
        if (n >= 1 && n <= 90) return n;
      }
    }
  }
  return undefined;
}

function extractHighlightsFromMessages(messages: Message[]): string[] {
  // Extract bullet points from assistant messages that look like highlights
  const highlights: string[] = [];
  for (const msg of messages) {
    if (msg.role !== "assistant") continue;
    const bullets = msg.content.match(/^[-*]\s+(.+)$/gm);
    if (bullets) {
      for (const b of bullets.slice(0, 5)) {
        highlights.push(b.replace(/^[-*]\s+/, ""));
      }
    }
    if (highlights.length >= 5) break;
  }
  return highlights.slice(0, 5);
}

function determineTravelStyle(
  budgetLevel?: string,
  _messages?: Message[],
): ExtractedRoute["travelStyle"] {
  switch (budgetLevel) {
    case "luxury":
      return "luxury";
    case "budget":
      return "budget";
    default:
      return "comfort";
  }
}

function generateSummary(
  destination: string,
  days: number | undefined,
  highlights: string[],
): string {
  const dayStr = days ? `${days}-day ` : "";
  const hlStr =
    highlights.length > 0 ? " Highlights include " + highlights.slice(0, 3).join(", ") + "." : "";
  return `A ${dayStr}travel itinerary for ${destination}.${hlStr}`;
}

function generateSummaryZh(
  destination: string,
  days: number | undefined,
  highlights: string[],
): string {
  const dayStr = days ? `${days}天` : "";
  const hlStr = highlights.length > 0 ? "亮点包括" + highlights.slice(0, 3).join("、") + "。" : "";
  return `${destination}${dayStr}旅行行程。${hlStr}`;
}

function generateTags(destination: string, style: string, days?: number): string[] {
  const tags = [destination.toLowerCase(), style];
  if (days) {
    if (days <= 2) tags.push("weekend");
    else if (days <= 5) tags.push("short-trip");
    else tags.push("extended-trip");
  }
  return tags;
}

// ============================================
// Save Route to Supabase
// ============================================

/**
 * Save a route to Supabase ai_routes table.
 * Also updates the conversation to mark it as route-saved.
 */
export async function saveRoute(
  userId: string,
  conversationId: string,
  routeData: ExtractedRoute,
): Promise<{ success: boolean; routeId?: string; error?: string }> {
  const lsm = getLocalStorageManager(userId);

  try {
    // Try Supabase first
    const { data, error } = await supabase
      .from("ai_routes")
      .insert({
        user_id: userId,
        conversation_id: conversationId || null,
        title: routeData.title,
        title_zh: routeData.titleZh || null,
        summary: routeData.summary,
        summary_zh: routeData.summaryZh || null,
        days: routeData.days,
        route_data: {
          destination: routeData.destination,
          title: routeData.title,
          title_zh: routeData.titleZh || null,
          title_i18n: routeData.titleLocalized || null,
          summary: routeData.summary,
          summary_i18n: routeData.summaryLocalized || null,
          days: routeData.dailyPlans,
          total_estimated_cost: routeData.totalEstimatedCost,
          currency: routeData.currency,
          transport_summary: routeData.transportSummary,
          highlights: routeData.highlights,
          tips: routeData.tips,
          raw_plan: routeData.rawPlan || null,
        },
        tags: routeData.tags,
        travel_style: routeData.travelStyle,
        ai_model: routeData.aiModel,
        ai_provider: routeData.aiProvider,
        start_date: routeData.startDate || null,
        end_date: routeData.endDate || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[RouteSaver] Supabase save failed, saving locally:", error);
      saveRouteLocally(userId, conversationId, routeData);
      return { success: true, error: "Saved locally (offline)" };
    }

    // Also save to localStorage as cache
    saveRouteLocally(userId, conversationId, routeData, data.id);

    return { success: true, routeId: data.id };
  } catch (err) {
    console.error("[RouteSaver] Network error, saving locally:", err);
    saveRouteLocally(userId, conversationId, routeData);
    return { success: true, error: "Saved locally (offline)" };
  }
}

/**
 * Save route data to localStorage (offline cache).
 * Stored under a per-user key so accounts can never cross-contaminate.
 */
function saveRouteLocally(
  userId: string,
  conversationId: string,
  routeData: ExtractedRoute,
  supabaseId?: string,
): void {
  try {
    const lsm = getLocalStorageManager(userId);
    lsm.upsertSavedRoute({
      id: supabaseId || "local_" + Date.now(),
      userId,
      conversationId,
      ...routeData,
      createdAt: new Date().toISOString(),
      synced: !!supabaseId,
    });
  } catch (e) {
    console.error("[RouteSaver] Failed to save route locally:", e);
  }
}

// ============================================
// Auto-Save Snapshot
// ============================================

/**
 * Auto-save a conversation snapshot.
 * Called every N messages during conversation.
 * Saves to localStorage first, then tries Supabase in background.
 */
export async function autoSaveSnapshot(
  userId: string,
  conversationId: string,
  messages: Message[],
  itinerary?: ParsedItinerary,
): Promise<void> {
  if (messages.length === 0) return;

  const lsm = getLocalStorageManager(userId);

  // 1. Always save to localStorage first (instant, no network)
  const saved = lsm.saveSnapshot(conversationId, messages, itinerary, false);

  if (saved) {
    // Mark as needing sync
    lsm.addToPendingSync(conversationId);
  }

  // 2. Try to sync to Supabase in background (fire-and-forget)
  syncSnapshotToSupabase(userId, conversationId, messages).catch((err) => {
    console.warn("[RouteSaver] Background snapshot sync failed:", err);
  });

  // 3. Run cleanup if needed
  lsm.runCleanupIfNeeded();
}

/**
 * Check if a snapshot should be saved (every N messages).
 */
export function shouldSaveSnapshot(messageCount: number): boolean {
  return messageCount > 0 && messageCount % SNAPSHOT_INTERVAL === 0;
}

/**
 * Sync a snapshot to Supabase ai_conversation_snapshots table.
 */
async function syncSnapshotToSupabase(
  userId: string,
  conversationId: string,
  messages: Message[],
): Promise<void> {
  const lsm = getLocalStorageManager(userId);

  try {
    // Serialize messages for storage
    const serialized = messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : String(m.timestamp),
      citations: m.citations,
      toolCalls: m.toolCalls,
    }));

    const { error } = await supabase.from("ai_conversation_snapshots").insert({
      conversation_id: conversationId,
      user_id: userId,
      messages: serialized,
      snapshot_type: "auto",
      message_count: messages.length,
      is_latest: true,
    });

    if (!error) {
      // Mark as synced
      lsm.removeFromPendingSync(conversationId);
      // Update local snapshot to reflect sync
      const snap = lsm.loadSnapshot(conversationId);
      if (snap) {
        lsm.saveSnapshot(conversationId, messages, snap.itinerary, true);
      }
    }
  } catch {
    // Offline — will retry later via pending sync queue
  }
}

/**
 * Sync all pending snapshots to Supabase.
 * Call this on page load or when coming back online.
 */
export async function syncPendingSnapshots(userId: string): Promise<number> {
  const lsm = getLocalStorageManager(userId);
  const pending = lsm.getPendingSync();
  let synced = 0;

  for (const conversationId of pending) {
    const snap = lsm.loadSnapshot(conversationId);
    if (!snap) {
      lsm.removeFromPendingSync(conversationId);
      continue;
    }

    const messages = snap.messages.map((sm) => ({
      id: sm.id,
      role: sm.role,
      content: sm.content,
      timestamp: sm.timestamp,
      citations: sm.citations,
      toolCalls: sm.toolCalls,
    }));

    try {
      const { error } = await supabase.from("ai_conversation_snapshots").insert({
        conversation_id: conversationId,
        user_id: userId,
        messages,
        snapshot_type: "auto",
        message_count: snap.messageCount,
        is_latest: true,
      });

      if (!error) {
        lsm.removeFromPendingSync(conversationId);
        synced++;
      }
    } catch {
      // Still offline, skip
    }
  }

  return synced;
}

// ============================================
// Restore Snapshot
// ============================================

/**
 * Load the latest snapshot for a conversation from localStorage.
 * Falls back to Supabase if not in localStorage.
 */
export async function restoreSnapshot(
  conversationId: string,
): Promise<ConversationSnapshot | null> {
  // Bind storage to the current user so per-user keys are used.
  let userId: string | null = null;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    userId = sessionData.session?.user?.id ?? null;
  } catch {
    // anonymous
  }
  const lsm = getLocalStorageManager(userId);

  // Try localStorage first
  const local = lsm.loadSnapshot(conversationId);
  if (local) return local;

  // Try Supabase
  try {
    const { data, error } = await supabase
      .from("ai_conversation_snapshots")
      .select("messages, message_count, created_at")
      .eq("conversation_id", conversationId)
      .eq("is_latest", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    const snapshot: ConversationSnapshot = {
      conversationId,
      messages: data.messages as ConversationSnapshot["messages"],
      savedAt: data.created_at,
      messageCount: data.message_count,
      syncedToSupabase: true,
    };

    // Cache locally
    lsm.saveSnapshot(
      conversationId,
      (data.messages as ConversationSnapshot["messages"]).map((sm) => ({
        ...sm,
        timestamp: new Date(sm.timestamp),
      })),
      undefined,
      true,
    );

    return snapshot;
  } catch {
    return null;
  }
}

/**
 * Find and return the most recent unsaved conversation (for restore prompt on page load).
 */
export function findRestorableConversation(userId?: string | null): {
  conversationId: string;
  messageCount: number;
  savedAt: string;
  preview: string;
} | null {
  const lsm = getLocalStorageManager(userId);
  const snap = lsm.findUnsavedSnapshot();

  if (!snap || snap.messageCount === 0) return null;

  // Get a preview from the first user message
  const firstUserMsg = snap.deserializedMessages.find((m) => m.role === "user");
  const preview = firstUserMsg
    ? firstUserMsg.content.slice(0, 100) + (firstUserMsg.content.length > 100 ? "..." : "")
    : "Previous conversation";

  return {
    conversationId: snap.conversationId,
    messageCount: snap.messageCount,
    savedAt: snap.savedAt,
    preview,
  };
}

/**
 * Dismiss a restorable conversation (delete its snapshot).
 */
export function dismissRestorableConversation(
  conversationId: string,
  userId?: string | null,
): void {
  const lsm = getLocalStorageManager(userId);
  lsm.deleteSnapshot(conversationId);
}

// ============================================
// End-of-Conversation Save
// ============================================

/**
 * Full save when conversation ends (AI generates complete itinerary).
 * 1. Save snapshot with end_of_conversation type
 * 2. Extract and save route
 * 3. Update conversation summary
 */
export async function saveConversationEnd(
  userId: string,
  conversationId: string,
  messages: Message[],
  itinerary?: ParsedItinerary | null,
  userParams?: { destination?: string; days?: number; budgetLevel?: string },
): Promise<{ routeId?: string; snapshotSaved: boolean }> {
  const lsm = getLocalStorageManager(userId);
  let routeId: string | undefined;

  // 1. Save final snapshot
  lsm.saveSnapshot(conversationId, messages, itinerary || undefined, false);
  lsm.removeFromPendingSync(conversationId); // No longer pending

  // 2. Sync final snapshot to Supabase
  try {
    const serialized = messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : String(m.timestamp),
    }));

    await supabase.from("ai_conversation_snapshots").insert({
      conversation_id: conversationId,
      user_id: userId,
      messages: serialized,
      snapshot_type: "end_of_conversation",
      message_count: messages.length,
      is_latest: true,
    });
  } catch (err) {
    console.warn("[RouteSaver] Failed to save end snapshot to Supabase:", err);
  }

  // 3. Extract and save route if itinerary exists
  const route = extractRouteFromConversation(messages, itinerary, userParams);
  if (route) {
    const result = await saveRoute(userId, conversationId, route);
    routeId = result.routeId;
  }

  // 4. Update conversation summary in localStorage
  const summary: import("./types").ConversationSummary = {
    id: conversationId,
    name: route ? route.title : "Conversation " + new Date().toLocaleDateString(),
    destination: route?.destination,
    days: route?.days,
    createdAt: new Date().toISOString(),
    messageCount: messages.length,
    hasItinerary: !!itinerary,
  };

  lsm.upsertConversation({
    id: conversationId,
    name: summary.name,
    createdAt: summary.createdAt,
    updatedAt: new Date().toISOString(),
    messageCount: messages.length,
    hasItinerary: !!itinerary,
    preview: route?.destination,
  });

  return { routeId, snapshotSaved: true };
}

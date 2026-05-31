/**
 * Route Saver - Auto-save routes and conversation snapshots
 * Offline-first: localStorage primary, Supabase as backup/sync target.
 *
 * Flow:
 *   1. During conversation: auto-save snapshots every N messages (localStorage)
 *   2. When itinerary is complete: extract compact route, save to ai_routes
 *   3. Sync to Supabase when online
 */

import { supabase } from '@/services/supabase';
import { getLocalStorageManager, type ConversationSnapshot } from './local-storage-manager';
import type {
  ConversationSummary,
  DailyPlan,
  Message,
  ParsedItinerary,
  PlannedLocation,
  SavedItinerary,
} from './types';

// ============================================
// Types
// ============================================

/** Compact route object stored in ai_routes table */
export interface ExtractedRoute {
  title: string;
  titleZh?: string;
  summary: string;
  summaryZh?: string;
  destination: string;
  days: number;
  dailyPlans: ExtractedDayPlan[];
  totalEstimatedCost: number;
  currency: string;
  highlights: string[];
  tips: string[];
  transportSummary: string[];
  travelStyle: 'budget' | 'comfort' | 'luxury' | 'adventure' | 'cultural' | 'foodie' | 'family';
  tags: string[];
  startDate?: string;
  endDate?: string;
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
const AI_MODEL = 'MiniMax-M2.7-highspeed';
const AI_PROVIDER = 'minimax';

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
  userParams?: { destination?: string; days?: number; budgetLevel?: string }
): ExtractedRoute | null {
  // Try to get data from itinerary first, fall back to message parsing
  const destination =
    itinerary?.summary?.destination ||
    userParams?.destination ||
    extractDestinationFromMessages(messages);

  const days =
    itinerary?.summary?.totalDays ||
    userParams?.days ||
    extractDaysFromMessages(messages);

  if (!destination) return null;

  // Build daily plans
  const dailyPlans: ExtractedDayPlan[] = itinerary?.dailyItinerary
    ? itinerary.dailyItinerary.map(extractDayPlan)
    : [];

  // Determine travel style from budget level or itinerary hints
  const travelStyle = determineTravelStyle(userParams?.budgetLevel, messages);

  // Generate title
  const title = days
    ? `${destination} ${days}-Day Trip`
    : `Trip to ${destination}`;
  const titleZh = days
    ? `${destination}${days}日游`
    : `${destination}之旅`;

  // Generate summary from highlights or itinerary
  const highlights = itinerary?.summary?.topHighlights || extractHighlightsFromMessages(messages);
  const tips = itinerary?.summary?.travelTips || [];
  const summary = generateSummary(destination, days, highlights);
  const summaryZh = generateSummaryZh(destination, days, highlights);

  // Extract transport summary
  const transportSummary = dailyPlans
    .map((dp) => dp.transport)
    .filter((t) => t && t !== 'walk');

  // Generate tags
  const tags = generateTags(destination, travelStyle, days);

  return {
    title,
    titleZh,
    summary,
    summaryZh,
    destination,
    days: days || 1,
    dailyPlans,
    totalEstimatedCost: itinerary?.summary?.estimatedTotalCost || 0,
    currency: itinerary?.summary?.currency || 'CNY',
    highlights,
    tips,
    transportSummary,
    travelStyle,
    tags,
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
      ? day.transportToAttractions.type + ': ' + day.transportToAttractions.route
      : '',
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
    bestTime: loc.bestTimeStart + ' - ' + loc.bestTimeEnd,
    ticketPrice: loc.ticketInfo?.price || 'Free',
    highlights: loc.highlights || [],
    insiderTip: loc.insiderTip,
  };
}

function extractDestinationFromMessages(messages: Message[]): string | undefined {
  // Look in user messages for destination keywords
  for (const msg of messages) {
    if (msg.role !== 'user') continue;
    const match = msg.content.match(
      /(?:visit|go to|travel to|trip to|explore|plan.*?to|want.*?to go)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
    );
    if (match) return match[1];
  }
  // Look in assistant messages for destination headers
  for (const msg of messages) {
    if (msg.role !== 'assistant') continue;
    const match = msg.content.match(
      /(?:#|##)\s*(?:Trip to|Itinerary.*?for|Exploring)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
    );
    if (match) return match[1];
  }
  return undefined;
}

function extractDaysFromMessages(messages: Message[]): number | undefined {
  for (const msg of messages) {
    if (msg.role !== 'user') continue;
    const match = msg.content.match(/(\d+)\s*(?:day|days|天)/i);
    if (match) return parseInt(match[1], 10);
  }
  return undefined;
}

function extractHighlightsFromMessages(messages: Message[]): string[] {
  // Extract bullet points from assistant messages that look like highlights
  const highlights: string[] = [];
  for (const msg of messages) {
    if (msg.role !== 'assistant') continue;
    const bullets = msg.content.match(/^[-*]\s+(.+)$/gm);
    if (bullets) {
      for (const b of bullets.slice(0, 5)) {
        highlights.push(b.replace(/^[-*]\s+/, ''));
      }
    }
    if (highlights.length >= 5) break;
  }
  return highlights.slice(0, 5);
}

function determineTravelStyle(
  budgetLevel?: string,
  _messages?: Message[]
): ExtractedRoute['travelStyle'] {
  switch (budgetLevel) {
    case 'luxury': return 'luxury';
    case 'budget': return 'budget';
    default: return 'comfort';
  }
}

function generateSummary(destination: string, days: number | undefined, highlights: string[]): string {
  const dayStr = days ? `${days}-day ` : '';
  const hlStr = highlights.length > 0
    ? ' Highlights include ' + highlights.slice(0, 3).join(', ') + '.'
    : '';
  return `A ${dayStr}travel itinerary for ${destination}.${hlStr}`;
}

function generateSummaryZh(destination: string, days: number | undefined, highlights: string[]): string {
  const dayStr = days ? `${days}天` : '';
  const hlStr = highlights.length > 0
    ? '亮点包括' + highlights.slice(0, 3).join('、') + '。'
    : '';
  return `${destination}${dayStr}旅行行程。${hlStr}`;
}

function generateTags(destination: string, style: string, days?: number): string[] {
  const tags = [destination.toLowerCase(), style];
  if (days) {
    if (days <= 2) tags.push('weekend');
    else if (days <= 5) tags.push('short-trip');
    else tags.push('extended-trip');
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
  routeData: ExtractedRoute
): Promise<{ success: boolean; routeId?: string; error?: string }> {
  const lsm = getLocalStorageManager();

  try {
    // Try Supabase first
    const { data, error } = await supabase
      .from('ai_routes')
      .insert({
        user_id: userId,
        conversation_id: conversationId || null,
        title: routeData.title,
        title_zh: routeData.titleZh || null,
        summary: routeData.summary,
        summary_zh: routeData.summaryZh || null,
        days: routeData.days,
        route_data: {
          days: routeData.dailyPlans,
          total_estimated_cost: routeData.totalEstimatedCost,
          transport_summary: routeData.transportSummary,
          highlights: routeData.highlights,
          tips: routeData.tips,
        },
        tags: routeData.tags,
        travel_style: routeData.travelStyle,
        ai_model: routeData.aiModel,
        ai_provider: routeData.aiProvider,
        start_date: routeData.startDate || null,
        end_date: routeData.endDate || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[RouteSaver] Supabase save failed, saving locally:', error);
      saveRouteLocally(userId, conversationId, routeData);
      return { success: true, error: 'Saved locally (offline)' };
    }

    // Also save to localStorage as cache
    saveRouteLocally(userId, conversationId, routeData, data.id);

    return { success: true, routeId: data.id };
  } catch (err) {
    console.error('[RouteSaver] Network error, saving locally:', err);
    saveRouteLocally(userId, conversationId, routeData);
    return { success: true, error: 'Saved locally (offline)' };
  }
}

/**
 * Save route data to localStorage (offline cache).
 */
function saveRouteLocally(
  userId: string,
  conversationId: string,
  routeData: ExtractedRoute,
  supabaseId?: string
): void {
  try {
    const key = 'cc_ai_saved_routes';
    const existing = localStorage.getItem(key);
    const routes = existing ? JSON.parse(existing) : [];

    routes.unshift({
      id: supabaseId || 'local_' + Date.now(),
      userId,
      conversationId,
      ...routeData,
      createdAt: new Date().toISOString(),
      synced: !!supabaseId,
    });

    // Keep max 50 routes locally
    const trimmed = routes.slice(0, 50);
    localStorage.setItem(key, JSON.stringify(trimmed));
  } catch (e) {
    console.error('[RouteSaver] Failed to save route locally:', e);
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
  itinerary?: ParsedItinerary
): Promise<void> {
  if (messages.length === 0) return;

  const lsm = getLocalStorageManager();

  // 1. Always save to localStorage first (instant, no network)
  const saved = lsm.saveSnapshot(conversationId, messages, itinerary, false);

  if (saved) {
    // Mark as needing sync
    lsm.addToPendingSync(conversationId);
  }

  // 2. Try to sync to Supabase in background (fire-and-forget)
  syncSnapshotToSupabase(userId, conversationId, messages).catch((err) => {
    console.warn('[RouteSaver] Background snapshot sync failed:', err);
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
  messages: Message[]
): Promise<void> {
  const lsm = getLocalStorageManager();

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

    const { error } = await supabase
      .from('ai_conversation_snapshots')
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        messages: serialized,
        snapshot_type: 'auto',
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
  const lsm = getLocalStorageManager();
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
      const { error } = await supabase
        .from('ai_conversation_snapshots')
        .insert({
          conversation_id: conversationId,
          user_id: userId,
          messages,
          snapshot_type: 'auto',
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
  conversationId: string
): Promise<ConversationSnapshot | null> {
  const lsm = getLocalStorageManager();

  // Try localStorage first
  const local = lsm.loadSnapshot(conversationId);
  if (local) return local;

  // Try Supabase
  try {
    const { data, error } = await supabase
      .from('ai_conversation_snapshots')
      .select('messages, message_count, created_at')
      .eq('conversation_id', conversationId)
      .eq('is_latest', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    const snapshot: ConversationSnapshot = {
      conversationId,
      messages: data.messages as ConversationSnapshot['messages'],
      savedAt: data.created_at,
      messageCount: data.message_count,
      syncedToSupabase: true,
    };

    // Cache locally
    lsm.saveSnapshot(
      conversationId,
      (data.messages as ConversationSnapshot['messages']).map((sm) => ({
        ...sm,
        timestamp: new Date(sm.timestamp),
      })),
      undefined,
      true
    );

    return snapshot;
  } catch {
    return null;
  }
}

/**
 * Find and return the most recent unsaved conversation (for restore prompt on page load).
 */
export function findRestorableConversation(): {
  conversationId: string;
  messageCount: number;
  savedAt: string;
  preview: string;
} | null {
  const lsm = getLocalStorageManager();
  const snap = lsm.findUnsavedSnapshot();

  if (!snap || snap.messageCount === 0) return null;

  // Get a preview from the first user message
  const firstUserMsg = snap.deserializedMessages.find((m) => m.role === 'user');
  const preview = firstUserMsg
    ? firstUserMsg.content.slice(0, 100) + (firstUserMsg.content.length > 100 ? '...' : '')
    : 'Previous conversation';

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
export function dismissRestorableConversation(conversationId: string): void {
  const lsm = getLocalStorageManager();
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
  userParams?: { destination?: string; days?: number; budgetLevel?: string }
): Promise<{ routeId?: string; snapshotSaved: boolean }> {
  const lsm = getLocalStorageManager();
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

    await supabase.from('ai_conversation_snapshots').insert({
      conversation_id: conversationId,
      user_id: userId,
      messages: serialized,
      snapshot_type: 'end_of_conversation',
      message_count: messages.length,
      is_latest: true,
    });
  } catch (err) {
    console.warn('[RouteSaver] Failed to save end snapshot to Supabase:', err);
  }

  // 3. Extract and save route if itinerary exists
  const route = extractRouteFromConversation(messages, itinerary, userParams);
  if (route) {
    const result = await saveRoute(userId, conversationId, route);
    routeId = result.routeId;
  }

  // 4. Update conversation summary in localStorage
  const summary: import('./types').ConversationSummary = {
    id: conversationId,
    name: route ? route.title : 'Conversation ' + new Date().toLocaleDateString(),
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

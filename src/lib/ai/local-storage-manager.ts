/**
 * Local Storage Manager for AI Conversations
 * Handles offline-first persistence with graceful quota management.
 * Used as primary store; Supabase is the backup/sync target.
 *
 * 2026-08: ALL keys are now namespaced per authenticated user
 * (cc_ai_<userId>_*) so switching accounts on the same browser can never
 * leak conversations, snapshots or saved routes between users. Legacy
 * unscoped keys are migrated once on first login and then removed.
 */

import type { Message, ParsedItinerary } from "./types";

// ============================================
// Types
// ============================================

export interface StoredConversation {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  hasItinerary: boolean;
  preview?: string;
}

export interface ConversationSnapshot {
  conversationId: string;
  messages: SerializedMessage[];
  itinerary?: ParsedItinerary;
  savedAt: string;
  messageCount: number;
  syncedToSupabase: boolean;
  /** Owning user id (used to migrate legacy unscoped snapshots). */
  userId?: string;
}

export interface SerializedMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  citations?: Message["citations"];
  toolCalls?: Message["toolCalls"];
  workflowProgress?: Message["workflowProgress"];
  intentResult?: Message["intentResult"];
}

// ============================================
// Storage Keys
// ============================================

/** Base key names (scoped under cc_ai_<userId>_ at runtime). */
const BASE_KEYS = {
  CONVERSATIONS: "conversations",
  SNAPSHOTS_PREFIX: "snapshots_",
  PENDING_SYNC: "pending_sync",
  LAST_CLEANUP: "last_cleanup",
  SAVED_ROUTES: "saved_routes",
  SHARE_INDEX: "share_index",
} as const;

/** Legacy unscoped keys (pre-2026-08). */
const LEGACY_KEYS = {
  CONVERSATIONS: "cc_ai_conversations",
  SNAPSHOTS_PREFIX: "cc_ai_snapshots_",
  PENDING_SYNC: "cc_ai_pending_sync",
  LAST_CLEANUP: "cc_ai_last_cleanup",
  SAVED_ROUTES: "cc_ai_saved_routes",
  SHARE_INDEX: "cc_ai_share_index",
} as const;

const MAX_CONVERSATIONS = 50;
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;
const MAX_SNAPSHOTS = 10;

// ============================================
// Helpers
// ============================================

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function safeGetItem(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): boolean {
  if (!isBrowser()) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      console.warn("[LocalStorageManager] Quota exceeded, attempting cleanup...");
      return handleQuotaExceeded(key, value);
    }
    console.error("[LocalStorageManager] Failed to write:", e);
    return false;
  }
}

function safeRemoveItem(key: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/**
 * Handle quota exceeded by removing oldest snapshots, then retry.
 */
function handleQuotaExceeded(key: string, value: string): boolean {
  try {
    const allKeys = Object.keys(localStorage);
    const snapshotKeys = allKeys
      .filter((k) => k.includes(BASE_KEYS.SNAPSHOTS_PREFIX))
      .sort();

    const toRemove = snapshotKeys.slice(0, Math.ceil(snapshotKeys.length / 2));
    for (const k of toRemove) {
      localStorage.removeItem(k);
    }

    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      const remaining = Object.keys(localStorage).filter((k) =>
        k.includes(BASE_KEYS.SNAPSHOTS_PREFIX),
      );
      for (const k of remaining) {
        localStorage.removeItem(k);
      }

      try {
        localStorage.setItem(key, value);
        return true;
      } catch {
        console.error("[LocalStorageManager] Cannot free enough space");
        return false;
      }
    }
  } catch {
    return false;
  }
}

/**
 * Serialize a Message for storage (Date to ISO string).
 */
function serializeMessage(msg: Message): SerializedMessage {
  return {
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : String(msg.timestamp),
    citations: msg.citations,
    toolCalls: msg.toolCalls,
    workflowProgress: msg.workflowProgress,
    intentResult: msg.intentResult,
  };
}

/**
 * Deserialize a stored message back to Message (ISO string to Date).
 */
export function deserializeMessage(sm: SerializedMessage): Message {
  return {
    id: sm.id,
    role: sm.role,
    content: sm.content,
    timestamp: new Date(sm.timestamp),
    citations: sm.citations,
    toolCalls: sm.toolCalls,
    workflowProgress: sm.workflowProgress,
    intentResult: sm.intentResult,
  };
}

// ============================================
// LocalStorageManager (singleton, per-user keys)
// ============================================

class LocalStorageManager {
  /** Currently bound user. All keys are scoped to this id. */
  private userId: string | null = null;
  /** Avoid re-running migration on every setUserId call. */
  private lastMigratedUserId: string | null = null;

  /** Bind storage to a user. Passing null reverts to legacy unscoped keys. */
  setUserId(userId: string | null): void {
    const next = userId || null;
    if (next !== this.lastMigratedUserId) {
      this.userId = next;
      if (next) this.migrateLegacyData(next);
      this.lastMigratedUserId = next;
    } else {
      this.userId = next;
    }
  }

  getUserId(): string | null {
    return this.userId;
  }

  /** Runtime storage key for a base key (scoped to the bound user). */
  private key(base: string): string {
    if (this.userId) return `cc_ai_${this.userId}_${base}`;
    // Anonymous fallback keeps pre-auth behavior intact.
    const entry = Object.entries(BASE_KEYS).find(([, v]) => v === base);
    if (entry) {
      const legacyKey = (LEGACY_KEYS as Record<string, string>)[entry[0]];
      if (legacyKey) return legacyKey;
    }
    return `cc_ai_${base}`;
  }

  private snapshotPrefix(): string {
    return this.key(BASE_KEYS.SNAPSHOTS_PREFIX);
  }

  /**
   * One-time migration: move legacy unscoped data into the current user's
   * scoped keys, attribute saved routes by their embedded userId, then
   * remove the legacy keys so they can never leak across accounts.
   */
  private migrateLegacyData(userId: string): void {
    if (!isBrowser()) return;

    // 1. Saved routes — entries carry their owner userId.
    const legacyRoutes = safeGetItem(LEGACY_KEYS.SAVED_ROUTES);
    if (legacyRoutes) {
      try {
        const routes = JSON.parse(legacyRoutes) as Array<Record<string, unknown>>;
        if (Array.isArray(routes)) {
          const mine = routes.filter((r) => !r.userId || String(r.userId) === userId);
          const existing = this.loadSavedRoutes();
          const merged = [...existing];
          for (const r of mine) {
            const id = String((r as { id?: unknown }).id ?? "");
            if (id && !merged.some((m) => m.id === id)) merged.push(r);
          }
          safeSetItem(this.key(BASE_KEYS.SAVED_ROUTES), JSON.stringify(merged.slice(0, 50)));
        }
      } catch {
        // ignore malformed cache
      }
      safeRemoveItem(LEGACY_KEYS.SAVED_ROUTES);
    }

    // 2. Share index (token -> itinerary id).
    const legacyShare = safeGetItem(LEGACY_KEYS.SHARE_INDEX);
    if (legacyShare) {
      try {
        const idx = JSON.parse(legacyShare) as Record<string, string>;
        const merged = { ...this.loadShareIndex(), ...idx };
        this.saveShareIndex(merged);
      } catch {
        // ignore
      }
      safeRemoveItem(LEGACY_KEYS.SHARE_INDEX);
    }

    // 3. Snapshots — only migratable when the snapshot carries a userId.
    try {
      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith(LEGACY_KEYS.SNAPSHOTS_PREFIX),
      );
      for (const k of keys) {
        const convId = k.slice(LEGACY_KEYS.SNAPSHOTS_PREFIX.length);
        try {
          const raw = localStorage.getItem(k);
          if (raw) {
            const snap = JSON.parse(raw) as { userId?: string };
            if (snap.userId && snap.userId === userId) {
              localStorage.setItem(this.snapshotPrefix() + convId, raw);
            }
          }
        } catch {
          // ignore malformed
        }
        localStorage.removeItem(k);
      }
    } catch {
      // ignore storage errors
    }

    // 4. Conversations index / pending sync / last cleanup have no owner
    //    metadata — attribute to this user only when their scoped key is
    //    still empty (keeps the most recent session working after upgrade).
    if (!safeGetItem(this.key(BASE_KEYS.CONVERSATIONS))) {
      const legacy = safeGetItem(LEGACY_KEYS.CONVERSATIONS);
      if (legacy) {
        safeSetItem(this.key(BASE_KEYS.CONVERSATIONS), legacy);
        safeRemoveItem(LEGACY_KEYS.CONVERSATIONS);
      }
    }
    if (!safeGetItem(this.key(BASE_KEYS.PENDING_SYNC))) {
      const legacy = safeGetItem(LEGACY_KEYS.PENDING_SYNC);
      if (legacy) {
        safeSetItem(this.key(BASE_KEYS.PENDING_SYNC), legacy);
        safeRemoveItem(LEGACY_KEYS.PENDING_SYNC);
      }
    }
    if (!safeGetItem(this.key(BASE_KEYS.LAST_CLEANUP))) {
      const legacy = safeGetItem(LEGACY_KEYS.LAST_CLEANUP);
      if (legacy) {
        safeSetItem(this.key(BASE_KEYS.LAST_CLEANUP), legacy);
        safeRemoveItem(LEGACY_KEYS.LAST_CLEANUP);
      }
    }
  }

  // ----------------------------------------
  // Conversations Index
  // ----------------------------------------

  /** Save the conversations index (list of conversation summaries). */
  saveConversations(conversations: StoredConversation[]): boolean {
    const trimmed = conversations.slice(0, MAX_CONVERSATIONS);
    return safeSetItem(this.key(BASE_KEYS.CONVERSATIONS), JSON.stringify(trimmed));
  }

  /** Load the conversations index. */
  loadConversations(): StoredConversation[] {
    const data = safeGetItem(this.key(BASE_KEYS.CONVERSATIONS));
    if (!data) return [];
    try {
      return JSON.parse(data) as StoredConversation[];
    } catch {
      return [];
    }
  }

  /** Add or update a conversation in the index. */
  upsertConversation(conversation: StoredConversation): void {
    const all = this.loadConversations();
    const idx = all.findIndex((c) => c.id === conversation.id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...conversation, updatedAt: new Date().toISOString() };
    } else {
      all.unshift(conversation);
    }
    this.saveConversations(all);
  }

  /** Remove a conversation from the index. */
  removeConversation(conversationId: string): void {
    const all = this.loadConversations();
    const filtered = all.filter((c) => c.id !== conversationId);
    this.saveConversations(filtered);
  }

  // ----------------------------------------
  // Snapshots
  // ----------------------------------------

  private snapshotKey(conversationId: string): string {
    return this.snapshotPrefix() + conversationId;
  }

  /**
   * Save a conversation snapshot to localStorage.
   * Overwrites any existing snapshot for the same conversation.
   */
  saveSnapshot(
    conversationId: string,
    messages: Message[],
    itinerary?: ParsedItinerary,
    syncedToSupabase = false,
  ): boolean {
    const snapshot: ConversationSnapshot = {
      conversationId,
      messages: messages.map(serializeMessage),
      itinerary,
      savedAt: new Date().toISOString(),
      messageCount: messages.length,
      syncedToSupabase,
      userId: this.userId || undefined,
    };

    return safeSetItem(this.snapshotKey(conversationId), JSON.stringify(snapshot));
  }

  /** Load the latest snapshot for a conversation. */
  loadSnapshot(conversationId: string): ConversationSnapshot | null {
    const data = safeGetItem(this.snapshotKey(conversationId));
    if (!data) return null;
    try {
      return JSON.parse(data) as ConversationSnapshot;
    } catch {
      return null;
    }
  }

  /** Delete a snapshot. */
  deleteSnapshot(conversationId: string): void {
    safeRemoveItem(this.snapshotKey(conversationId));
  }

  /** Get all snapshot conversation IDs currently in storage. */
  getAllSnapshotConversationIds(): string[] {
    if (!isBrowser()) return [];
    const prefix = this.snapshotPrefix();
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key.slice(prefix.length));
      }
    }
    return keys;
  }

  /**
   * Find any conversation that has an unsaved snapshot (for restore prompt).
   * Returns the most recent one.
   */
  findUnsavedSnapshot(): (ConversationSnapshot & { deserializedMessages: Message[] }) | null {
    const ids = this.getAllSnapshotConversationIds();
    if (ids.length === 0) return null;

    let latest: ConversationSnapshot | null = null;

    for (const id of ids) {
      const snap = this.loadSnapshot(id);
      if (!snap) continue;
      if (!latest || snap.savedAt > latest.savedAt) {
        latest = snap;
      }
    }

    if (!latest) return null;

    return {
      ...latest,
      deserializedMessages: latest.messages.map(deserializeMessage),
    };
  }

  /** Clear old snapshots, keeping only the latest N. */
  clearOldSnapshots(keepLatest: number = MAX_SNAPSHOTS): number {
    const ids = this.getAllSnapshotConversationIds();
    if (ids.length <= keepLatest) return 0;

    const snaps: Array<{ id: string; savedAt: string }> = [];
    for (const id of ids) {
      const snap = this.loadSnapshot(id);
      if (snap) {
        snaps.push({ id, savedAt: snap.savedAt });
      }
    }

    snaps.sort((a, b) => b.savedAt.localeCompare(a.savedAt));

    let removed = 0;
    for (let i = keepLatest; i < snaps.length; i++) {
      this.deleteSnapshot(snaps[i].id);
      removed++;
    }

    return removed;
  }

  // ----------------------------------------
  // Pending Sync Queue
  // ----------------------------------------

  /** Mark a snapshot as needing sync to Supabase. */
  addToPendingSync(conversationId: string): void {
    const pending = this.getPendingSync();
    if (!pending.includes(conversationId)) {
      pending.push(conversationId);
      safeSetItem(this.key(BASE_KEYS.PENDING_SYNC), JSON.stringify(pending));
    }
  }

  /** Remove from pending sync queue (after successful sync). */
  removeFromPendingSync(conversationId: string): void {
    const pending = this.getPendingSync().filter((id) => id !== conversationId);
    safeSetItem(this.key(BASE_KEYS.PENDING_SYNC), JSON.stringify(pending));
  }

  /** Get all conversation IDs pending sync. */
  getPendingSync(): string[] {
    const data = safeGetItem(this.key(BASE_KEYS.PENDING_SYNC));
    if (!data) return [];
    try {
      return JSON.parse(data) as string[];
    } catch {
      return [];
    }
  }

  // ----------------------------------------
  // Saved Routes (offline cache)
  // ----------------------------------------

  /** Load the current user's locally cached saved routes. */
  loadSavedRoutes(): Array<Record<string, unknown>> {
    const data = safeGetItem(this.key(BASE_KEYS.SAVED_ROUTES));
    if (!data) return [];
    try {
      const arr = JSON.parse(data);
      return Array.isArray(arr) ? (arr as Array<Record<string, unknown>>) : [];
    } catch {
      return [];
    }
  }

  /** Insert or update a route in the local cache (keeps max 50). */
  upsertSavedRoute(route: Record<string, unknown>): void {
    const routes = this.loadSavedRoutes();
    const idx = routes.findIndex((r) => r.id === route.id);
    if (idx >= 0) {
      routes[idx] = { ...routes[idx], ...route };
    } else {
      routes.unshift(route);
    }
    safeSetItem(this.key(BASE_KEYS.SAVED_ROUTES), JSON.stringify(routes.slice(0, 50)));
  }

  /** Remove a route from the local cache. */
  removeSavedRoute(id: string): void {
    const routes = this.loadSavedRoutes().filter((r) => r.id !== id);
    safeSetItem(this.key(BASE_KEYS.SAVED_ROUTES), JSON.stringify(routes));
  }

  // ----------------------------------------
  // Share Index (token -> route id)
  // ----------------------------------------

  /** Load the current user's local share token index. */
  loadShareIndex(): Record<string, string> {
    const data = safeGetItem(this.key(BASE_KEYS.SHARE_INDEX));
    if (!data) return {};
    try {
      const idx = JSON.parse(data);
      return idx && typeof idx === "object" ? (idx as Record<string, string>) : {};
    } catch {
      return {};
    }
  }

  /** Persist the current user's share token index. */
  saveShareIndex(index: Record<string, string>): void {
    safeSetItem(this.key(BASE_KEYS.SHARE_INDEX), JSON.stringify(index));
  }

  // ----------------------------------------
  // Maintenance
  // ----------------------------------------

  /** Run periodic cleanup. Called once per session at most. */
  runCleanupIfNeeded(): void {
    const lastCleanup = safeGetItem(this.key(BASE_KEYS.LAST_CLEANUP));
    const now = Date.now();

    if (lastCleanup && now - Number(lastCleanup) < CLEANUP_INTERVAL_MS) {
      return;
    }

    const removed = this.clearOldSnapshots(MAX_SNAPSHOTS);
    if (removed > 0) {
      console.log("[LocalStorageManager] Cleaned up " + removed + " old snapshots");
    }

    safeSetItem(this.key(BASE_KEYS.LAST_CLEANUP), String(now));
  }

  /** Get approximate storage usage in chars for AI data. */
  getStorageUsage(): { used: number; breakdown: Record<string, number> } {
    if (!isBrowser()) return { used: 0, breakdown: {} };

    const breakdown: Record<string, number> = {};
    let total = 0;

    const allKeys = Object.keys(localStorage);
    for (const key of allKeys) {
      if (key.startsWith("cc_ai_")) {
        const value = localStorage.getItem(key);
        const size = value ? key.length + value.length : 0;
        breakdown[key] = size;
        total += size;
      }
    }

    return { used: total, breakdown };
  }

  /** Clear AI data for the currently bound user only. */
  clearAll(): void {
    if (!isBrowser()) return;
    const prefix = this.userId ? `cc_ai_${this.userId}_` : "cc_ai_";
    const keysToRemove = Object.keys(localStorage).filter((k) => k.startsWith(prefix));
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  }

  /** Clear ALL AI-related localStorage data (sign-out / reset). */
  clearAllUsers(): void {
    if (!isBrowser()) return;
    const keysToRemove = Object.keys(localStorage).filter((k) => k.startsWith("cc_ai_"));
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  }
}

// ============================================
// Singleton
// ============================================

let instance: LocalStorageManager | null = null;

export function getLocalStorageManager(userId?: string | null): LocalStorageManager {
  if (!instance) {
    instance = new LocalStorageManager();
  }
  if (userId !== undefined) {
    instance.setUserId(userId);
  }
  return instance;
}

export default LocalStorageManager;

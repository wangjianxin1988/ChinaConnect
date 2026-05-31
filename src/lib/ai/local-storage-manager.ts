/**
 * Local Storage Manager for AI Conversations
 * Handles offline-first persistence with graceful quota management.
 * Used as primary store; Supabase is the backup/sync target.
 */

import type { Message, ParsedItinerary } from './types';

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
}

export interface SerializedMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: Message['citations'];
  toolCalls?: Message['toolCalls'];
  workflowProgress?: Message['workflowProgress'];
  intentResult?: Message['intentResult'];
}

// ============================================
// Storage Keys
// ============================================

const KEYS = {
  CONVERSATIONS: 'cc_ai_conversations',
  SNAPSHOTS_PREFIX: 'cc_ai_snapshots_',
  PENDING_SYNC: 'cc_ai_pending_sync',
  LAST_CLEANUP: 'cc_ai_last_cleanup',
} as const;

const MAX_CONVERSATIONS = 50;
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;
const MAX_SNAPSHOTS = 10;

// ============================================
// Helpers
// ============================================

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
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
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.warn('[LocalStorageManager] Quota exceeded, attempting cleanup...');
      return handleQuotaExceeded(key, value);
    }
    console.error('[LocalStorageManager] Failed to write:', e);
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
      .filter((k) => k.startsWith(KEYS.SNAPSHOTS_PREFIX))
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
        k.startsWith(KEYS.SNAPSHOTS_PREFIX)
      );
      for (const k of remaining) {
        localStorage.removeItem(k);
      }

      try {
        localStorage.setItem(key, value);
        return true;
      } catch {
        console.error('[LocalStorageManager] Cannot free enough space');
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
    timestamp:
      msg.timestamp instanceof Date
        ? msg.timestamp.toISOString()
        : String(msg.timestamp),
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
// LocalStorageManager (singleton)
// ============================================

class LocalStorageManager {
  // ----------------------------------------
  // Conversations Index
  // ----------------------------------------

  /** Save the conversations index (list of conversation summaries). */
  saveConversations(conversations: StoredConversation[]): boolean {
    const trimmed = conversations.slice(0, MAX_CONVERSATIONS);
    return safeSetItem(KEYS.CONVERSATIONS, JSON.stringify(trimmed));
  }

  /** Load the conversations index. */
  loadConversations(): StoredConversation[] {
    const data = safeGetItem(KEYS.CONVERSATIONS);
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
    return KEYS.SNAPSHOTS_PREFIX + conversationId;
  }

  /**
   * Save a conversation snapshot to localStorage.
   * Overwrites any existing snapshot for the same conversation.
   */
  saveSnapshot(
    conversationId: string,
    messages: Message[],
    itinerary?: ParsedItinerary,
    syncedToSupabase = false
  ): boolean {
    const snapshot: ConversationSnapshot = {
      conversationId,
      messages: messages.map(serializeMessage),
      itinerary,
      savedAt: new Date().toISOString(),
      messageCount: messages.length,
      syncedToSupabase,
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
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(KEYS.SNAPSHOTS_PREFIX)) {
        keys.push(key.slice(KEYS.SNAPSHOTS_PREFIX.length));
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
      safeSetItem(KEYS.PENDING_SYNC, JSON.stringify(pending));
    }
  }

  /** Remove from pending sync queue (after successful sync). */
  removeFromPendingSync(conversationId: string): void {
    const pending = this.getPendingSync().filter((id) => id !== conversationId);
    safeSetItem(KEYS.PENDING_SYNC, JSON.stringify(pending));
  }

  /** Get all conversation IDs pending sync. */
  getPendingSync(): string[] {
    const data = safeGetItem(KEYS.PENDING_SYNC);
    if (!data) return [];
    try {
      return JSON.parse(data) as string[];
    } catch {
      return [];
    }
  }

  // ----------------------------------------
  // Maintenance
  // ----------------------------------------

  /** Run periodic cleanup. Called once per session at most. */
  runCleanupIfNeeded(): void {
    const lastCleanup = safeGetItem(KEYS.LAST_CLEANUP);
    const now = Date.now();

    if (lastCleanup && now - Number(lastCleanup) < CLEANUP_INTERVAL_MS) {
      return;
    }

    const removed = this.clearOldSnapshots(MAX_SNAPSHOTS);
    if (removed > 0) {
      console.log('[LocalStorageManager] Cleaned up ' + removed + ' old snapshots');
    }

    safeSetItem(KEYS.LAST_CLEANUP, String(now));
  }

  /** Get approximate storage usage in chars for AI data. */
  getStorageUsage(): { used: number; breakdown: Record<string, number> } {
    if (!isBrowser()) return { used: 0, breakdown: {} };

    const breakdown: Record<string, number> = {};
    let total = 0;

    const allKeys = Object.keys(localStorage);
    for (const key of allKeys) {
      if (key.startsWith('cc_ai_')) {
        const value = localStorage.getItem(key);
        const size = value ? key.length + value.length : 0;
        breakdown[key] = size;
        total += size;
      }
    }

    return { used: total, breakdown };
  }

  /** Clear all AI-related localStorage data. */
  clearAll(): void {
    if (!isBrowser()) return;
    const keysToRemove = Object.keys(localStorage).filter((k) => k.startsWith('cc_ai_'));
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  }
}

// ============================================
// Singleton
// ============================================

let instance: LocalStorageManager | null = null;

export function getLocalStorageManager(): LocalStorageManager {
  if (!instance) {
    instance = new LocalStorageManager();
  }
  return instance;
}

export default LocalStorageManager;

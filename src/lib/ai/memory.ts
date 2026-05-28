/**
 * Memory Management for ChinaConnect AI
 * Handles short-term (session) and long-term (localStorage) memory
 */

import type {
  ConversationSummary,
  ExtractedParams,
  IntentResult,
  LongTermMemory,
  Message,
  ParsedItinerary,
  SavedItinerary,
  ShortTermMemory,
  ToolCall,
  UserPreferences,
} from "./types";

const STORAGE_KEYS = {
  ITINERARIES: "chinaconnect_saved_itineraries",
  PREFERENCES: "chinaconnect_user_preferences",
  CONVERSATIONS: "chinaconnect_conversations",
  SETTINGS: "chinaconnect_settings",
  CITY_CACHE: "chinaconnect_city_cache",
  ROUTE_CACHE: "chinaconnect_route_cache",
} as const;

// ============================================
// Short-term Memory (Session)
// ============================================

export class ShortTermMemoryStore {
  private memory: ShortTermMemory;
  private listeners: Set<(memory: ShortTermMemory) => void> = new Set();

  constructor(conversationId?: string) {
    this.memory = {
      conversationId: conversationId || this.generateId(),
      messages: [],
      toolCalls: [],
    };
  }

  private generateId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  // Message management
  addMessage(message: Message): void {
    this.memory.messages.push(message);
    this.notifyListeners();
  }

  getMessages(): Message[] {
    return [...this.memory.messages];
  }

  clearMessages(): void {
    this.memory.messages = [];
    this.notifyListeners();
  }

  // Conversation context
  setConversationId(id: string): void {
    this.memory.conversationId = id;
    this.notifyListeners();
  }

  getConversationId(): string {
    return this.memory.conversationId;
  }

  // Current state
  setCurrentItinerary(itinerary: ParsedItinerary | undefined): void {
    this.memory.currentItinerary = itinerary;
    this.notifyListeners();
  }

  getCurrentItinerary(): ParsedItinerary | undefined {
    return this.memory.currentItinerary;
  }

  setCurrentParams(params: ExtractedParams | undefined): void {
    this.memory.currentParams = params;
    this.notifyListeners();
  }

  getCurrentParams(): ExtractedParams | undefined {
    return this.memory.currentParams;
  }

  setCurrentIntent(intent: IntentResult | undefined): void {
    this.memory.currentIntent = intent;
    this.notifyListeners();
  }

  getCurrentIntent(): IntentResult | undefined {
    return this.memory.currentIntent;
  }

  // Tool calls
  addToolCall(toolCall: ToolCall): void {
    this.memory.toolCalls.push(toolCall);
    this.notifyListeners();
  }

  getToolCalls(): ToolCall[] {
    return [...this.memory.toolCalls];
  }

  clearToolCalls(): void {
    this.memory.toolCalls = [];
    this.notifyListeners();
  }

  // Full state
  getAll(): ShortTermMemory {
    return { ...this.memory, messages: [...this.memory.messages] };
  }

  reset(): void {
    this.memory = {
      conversationId: this.generateId(),
      messages: [],
      toolCalls: [],
      currentItinerary: undefined,
      currentParams: undefined,
      currentIntent: undefined,
    };
    this.notifyListeners();
  }

  // Persistence
  toJSON(): string {
    return JSON.stringify({
      ...this.memory,
      messages: this.memory.messages.map((m) => ({
        ...m,
        timestamp: m.timestamp.toISOString(),
      })),
    });
  }

  fromJSON(json: string): void {
    try {
      const parsed = JSON.parse(json);
      this.memory = {
        ...parsed,
        messages: parsed.messages.map((m: { timestamp: string } & Omit<Message, "timestamp">) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })),
      };
      this.notifyListeners();
    } catch (e) {
      console.error("Failed to load short-term memory:", e);
    }
  }

  // Listeners
  subscribe(listener: (memory: ShortTermMemory) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const state = this.getAll();
    this.listeners.forEach((listener) => listener(state));
  }
}

// ============================================
// Long-term Memory (localStorage)
// ============================================

export class LongTermMemoryStore {
  private listeners: Set<(memory: LongTermMemory) => void> = new Set();
  private isClient: boolean;

  constructor() {
    this.isClient = typeof window !== "undefined";
    if (this.isClient) {
      this.initializeDefaults();
    }
  }

  private initializeDefaults(): void {
    if (!this.isClient) return;
    // Initialize with defaults if not exists
    if (!this.getStorageItem(STORAGE_KEYS.ITINERARIES)) {
      this.setStorageItem(STORAGE_KEYS.ITINERARIES, "[]");
    }
    if (!this.getStorageItem(STORAGE_KEYS.PREFERENCES)) {
      const defaults: UserPreferences = {
        defaultLanguage: "en",
        defaultBudget: "medium",
        preferredTravelStyles: [],
        visitedCities: [],
        favoriteAttractions: [],
      };
      this.setStorageItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(defaults));
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  private isBrowser(): boolean {
    return typeof window !== "undefined" && this.isClient;
  }

  private getStorageItem(key: string): string | null {
    if (!this.isBrowser()) return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private setStorageItem(key: string, value: string): boolean {
    if (!this.isBrowser()) return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  // ============================================
  // Saved Itineraries
  // ============================================

  getItineraries(): SavedItinerary[] {
    try {
      const data = this.getStorageItem(STORAGE_KEYS.ITINERARIES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveItinerary(
    itinerary: Omit<SavedItinerary, "id" | "createdAt" | "updatedAt" | "shareCode">,
  ): SavedItinerary {
    const now = new Date().toISOString();
    const saved: SavedItinerary = {
      ...itinerary,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
      shareCode: this.generateShareCode(),
    };

    const all = this.getItineraries();
    all.unshift(saved);
    this.setStorageItem(STORAGE_KEYS.ITINERARIES, JSON.stringify(all));

    this.notifyListeners();
    return saved;
  }

  updateItinerary(id: string, updates: Partial<SavedItinerary>): SavedItinerary | null {
    const all = this.getItineraries();
    const index = all.findIndex((i) => i.id === id);

    if (index === -1) return null;

    all[index] = {
      ...all[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.setStorageItem(STORAGE_KEYS.ITINERARIES, JSON.stringify(all));
    this.notifyListeners();
    return all[index];
  }

  deleteItinerary(id: string): boolean {
    const all = this.getItineraries();
    const filtered = all.filter((i) => i.id !== id);

    if (filtered.length === all.length) return false;

    this.setStorageItem(STORAGE_KEYS.ITINERARIES, JSON.stringify(filtered));
    this.notifyListeners();
    return true;
  }

  getItineraryById(id: string): SavedItinerary | null {
    return this.getItineraries().find((i) => i.id === id) || null;
  }

  getItineraryByShareCode(code: string): SavedItinerary | null {
    return this.getItineraries().find((i) => i.shareCode === code) || null;
  }

  // ============================================
  // User Preferences
  // ============================================

  getPreferences(): UserPreferences {
    try {
      const data = this.getStorageItem(STORAGE_KEYS.PREFERENCES);
      return data ? JSON.parse(data) : this.getDefaultPreferences();
    } catch {
      return this.getDefaultPreferences();
    }
  }

  updatePreferences(updates: Partial<UserPreferences>): UserPreferences {
    const current = this.getPreferences();
    const updated = { ...current, ...updates };
    this.setStorageItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    this.notifyListeners();
    return updated;
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      defaultLanguage: "en",
      defaultBudget: "medium",
      preferredTravelStyles: [],
      visitedCities: [],
      favoriteAttractions: [],
    };
  }

  // ============================================
  // Conversation History
  // ============================================

  getConversationHistory(): ConversationSummary[] {
    try {
      const data = this.getStorageItem(STORAGE_KEYS.CONVERSATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveConversationSummary(summary: ConversationSummary): void {
    const all = this.getConversationHistory();
    const existing = all.findIndex((c) => c.id === summary.id);

    if (existing >= 0) {
      all[existing] = { ...all[existing], ...summary };
    } else {
      all.unshift(summary);
    }

    // Keep only last 50 conversations
    const trimmed = all.slice(0, 50);
    this.setStorageItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(trimmed));
    this.notifyListeners();
  }

  deleteConversationSummary(id: string): boolean {
    const all = this.getConversationHistory();
    const filtered = all.filter((c) => c.id !== id);

    if (filtered.length === all.length) return false;

    this.setStorageItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(filtered));
    this.notifyListeners();
    return true;
  }

  // ============================================
  // Utility
  // ============================================

  exportAllData(): LongTermMemory {
    return {
      savedItineraries: this.getItineraries(),
      userPreferences: this.getPreferences(),
      conversationHistory: this.getConversationHistory(),
    };
  }

  importData(data: LongTermMemory): void {
    if (data.savedItineraries) {
      this.setStorageItem(STORAGE_KEYS.ITINERARIES, JSON.stringify(data.savedItineraries));
    }
    if (data.userPreferences) {
      this.setStorageItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(data.userPreferences));
    }
    if (data.conversationHistory) {
      this.setStorageItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(data.conversationHistory));
    }
    this.notifyListeners();
  }

  clearAllData(): void {
    if (this.isBrowser()) {
      Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    }
    this.initializeDefaults();
    this.notifyListeners();
  }

  private generateId(): string {
    return `it_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private generateShareCode(): string {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  // Listeners
  subscribe(listener: (memory: LongTermMemory) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const state = this.exportAllData();
    this.listeners.forEach((listener) => listener(state));
  }
}

// ============================================
// City Knowledge Cache
// ============================================

interface CachedCityData {
  citySlug: string;
  data: Record<string, unknown>;
  cachedAt: number;
  expiresAt: number;
}

export class CityKnowledgeCache {
  private cache: Map<string, CachedCityData> = new Map();
  private readonly TTL = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_ENTRIES = 50;

  get(citySlug: string): Record<string, unknown> | null {
    const entry = this.cache.get(citySlug);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(citySlug);
      return null;
    }
    return entry.data;
  }

  set(citySlug: string, data: Record<string, unknown>): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxEntries) {
      const oldest = this.cache.keys().next().value;
      if (oldest) this.cache.delete(oldest);
    }
    this.cache.set(citySlug, {
      citySlug,
      data,
      cachedAt: Date.now(),
      expiresAt: Date.now() + this.TTL,
    });
  }

  has(citySlug: string): boolean {
    return this.get(citySlug) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  private get maxEntries(): number {
    return this.MAX_ENTRIES;
  }
}

// ============================================
// Common Route Cache
// ============================================

interface CachedRouteData {
  routeKey: string;
  from: string;
  to: string;
  type: string;
  data: unknown;
  cachedAt: number;
  expiresAt: number;
}

export class RouteCache {
  private cache: Map<string, CachedRouteData> = new Map();
  private readonly TTL = 60 * 60 * 1000; // 1 hour
  private readonly MAX_ENTRIES = 100;

  private makeKey(from: string, to: string, type: string): string {
    return `${from.toLowerCase()}_${to.toLowerCase()}_${type}`;
  }

  get(from: string, to: string, type: string): unknown | null {
    const key = this.makeKey(from, to, type);
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  set(from: string, to: string, type: string, data: unknown): void {
    const key = this.makeKey(from, to, type);
    if (this.cache.size >= this.maxEntries) {
      const oldest = this.cache.keys().next().value;
      if (oldest) this.cache.delete(oldest);
    }
    this.cache.set(key, {
      routeKey: key,
      from,
      to,
      type,
      data,
      cachedAt: Date.now(),
      expiresAt: Date.now() + this.TTL,
    });
  }

  has(from: string, to: string, type: string): boolean {
    return this.get(from, to, type) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  private get maxEntries(): number {
    return this.MAX_ENTRIES;
  }

  getPopularRoutes(): Array<{ from: string; to: string; type: string; count: number }> {
    return Array.from(this.cache.values()).map((entry) => ({
      from: entry.from,
      to: entry.to,
      type: entry.type,
      count: 1,
    }));
  }
}

// ============================================
// Singleton instances
// ============================================

let longTermInstance: LongTermMemoryStore | null = null;
let cityCacheInstance: CityKnowledgeCache | null = null;
let routeCacheInstance: RouteCache | null = null;

export function getLongTermMemory(): LongTermMemoryStore {
  if (!longTermInstance) {
    longTermInstance = new LongTermMemoryStore();
  }
  return longTermInstance;
}

export function getCityCache(): CityKnowledgeCache {
  if (!cityCacheInstance) {
    cityCacheInstance = new CityKnowledgeCache();
  }
  return cityCacheInstance;
}

export function getRouteCache(): RouteCache {
  if (!routeCacheInstance) {
    routeCacheInstance = new RouteCache();
  }
  return routeCacheInstance;
}

// ============================================
// Hook helpers (for React components)
// ============================================

export function useMemory() {
  return {
    longTerm: getLongTermMemory(),
    cityCache: getCityCache(),
    routeCache: getRouteCache(),
  };
}

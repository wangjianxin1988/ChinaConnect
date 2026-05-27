/**
 * LLM Latency Tracker
 * Tracks response latency across all LLM providers
 */

import type { LLMProviderType, LatencyRecord, LatencyStats } from "@/types/llm";

// ============================================
// Constants
// ============================================

const STORAGE_KEY = "chinaconnect_llm_latency";
const MAX_RECORDS = 1000;

// ============================================
// Latency Tracker Class
// ============================================

export class LatencyTracker {
  private records: LatencyRecord[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Record a latency entry
   */
  record(entry: Omit<LatencyRecord, "id" | "timestamp">): LatencyRecord {
    const record: LatencyRecord = {
      ...entry,
      id: `latency_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date(),
    };

    this.records.push(record);

    // Keep only the last MAX_RECORDS
    if (this.records.length > MAX_RECORDS) {
      this.records = this.records.slice(-MAX_RECORDS);
    }

    this.saveToStorage();
    this.notifyListeners();

    return record;
  }

  /**
   * Record latency from a response
   */
  recordFromResponse(
    provider: LLMProviderType,
    model: string,
    latencyMs: number,
    success: boolean,
    region?: "cn" | "global",
  ): LatencyRecord {
    return this.record({
      provider,
      model,
      latencyMs,
      success,
      region,
    });
  }

  /**
   * Get all records
   */
  getRecords(): LatencyRecord[] {
    return [...this.records];
  }

  /**
   * Get records for a specific provider
   */
  getRecordsForProvider(provider: LLMProviderType): LatencyRecord[] {
    return this.records.filter((r) => r.provider === provider);
  }

  /**
   * Get records within a time window (in minutes)
   */
  getRecordsInWindow(minutes: number): LatencyRecord[] {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.records.filter((r) => new Date(r.timestamp).getTime() > cutoff);
  }

  /**
   * Get statistics for a specific provider
   */
  getProviderStats(provider: LLMProviderType): LatencyStats | null {
    const records = this.getRecordsForProvider(provider);

    if (records.length === 0) {
      return null;
    }

    const latencies = records.map((r) => r.latencyMs).sort((a, b) => a - b);
    const successes = records.filter((r) => r.success);
    const successRate = successes.length / records.length;

    const sum = latencies.reduce((a, b) => a + b, 0);
    const avg = sum / latencies.length;

    const p50Index = Math.floor(latencies.length * 0.5);
    const p95Index = Math.floor(latencies.length * 0.95);
    const p99Index = Math.floor(latencies.length * 0.99);

    return {
      provider,
      averageLatencyMs: Math.round(avg),
      p50LatencyMs: latencies[p50Index] || 0,
      p95LatencyMs: latencies[p95Index] || 0,
      p99LatencyMs: latencies[p99Index] || 0,
      minLatencyMs: latencies[0] || 0,
      maxLatencyMs: latencies[latencies.length - 1] || 0,
      totalRequests: records.length,
      successRate: Math.round(successRate * 100) / 100,
    };
  }

  /**
   * Get statistics for all providers
   */
  getAllStats(): LatencyStats[] {
    const providers: LLMProviderType[] = ["qwen", "claude", "minimax", "gpt4o"];
    const stats: LatencyStats[] = [];

    for (const provider of providers) {
      const providerStats = this.getProviderStats(provider);
      if (providerStats) {
        stats.push(providerStats);
      }
    }

    return stats;
  }

  /**
   * Get the fastest provider on average
   */
  getFastestProvider(): LLMProviderType | null {
    const stats = this.getAllStats();

    if (stats.length === 0) {
      return null;
    }

    let fastest: LatencyStats | null = null;
    for (const stat of stats) {
      if (!fastest || stat.averageLatencyMs < fastest.averageLatencyMs) {
        fastest = stat;
      }
    }

    return fastest?.provider || null;
  }

  /**
   * Get the most reliable provider (highest success rate)
   */
  getMostReliableProvider(): LLMProviderType | null {
    const stats = this.getAllStats();

    if (stats.length === 0) {
      return null;
    }

    let mostReliable: LatencyStats | null = null;
    for (const stat of stats) {
      if (!mostReliable || stat.successRate > mostReliable.successRate) {
        mostReliable = stat;
      }
    }

    return mostReliable?.provider || null;
  }

  /**
   * Get average latency for the last N minutes
   */
  getRecentAverageLatency(minutes: number): number {
    const recent = this.getRecordsInWindow(minutes);

    if (recent.length === 0) {
      return 0;
    }

    const sum = recent.reduce((a, b) => a + b.latencyMs, 0);
    return Math.round(sum / recent.length);
  }

  /**
   * Clear all records
   */
  clear(): void {
    this.records = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Clear records older than a date
   */
  clearOlderThan(date: Date): number {
    const before = this.records.length;
    this.records = this.records.filter((r) => new Date(r.timestamp) > date);
    this.saveToStorage();
    this.notifyListeners();
    return before - this.records.length;
  }

  /**
   * Subscribe to changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch {
        // Ignore listener errors
      }
    }
  }

  /**
   * Load records from localStorage
   */
  private loadFromStorage(): void {
    if (typeof globalThis.localStorage === "undefined") {
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.records = (data.records || []).map((r: LatencyRecord) => ({
          ...r,
          timestamp: new Date(r.timestamp),
        }));
      }
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Save records to localStorage
   */
  private saveToStorage(): void {
    if (typeof globalThis.localStorage === "undefined") {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ records: this.records }));
    } catch {
      // Ignore storage errors
    }
  }
}

// ============================================
// Singleton Instance
// ============================================

let latencyTrackerInstance: LatencyTracker | null = null;

export function getLatencyTracker(): LatencyTracker {
  if (!latencyTrackerInstance) {
    latencyTrackerInstance = new LatencyTracker();
  }
  return latencyTrackerInstance;
}

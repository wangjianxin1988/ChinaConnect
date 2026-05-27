/**
 * LLM Cost Tracker
 * Tracks token usage and costs across all LLM providers
 */

import type { CostRecord, CostSummary, LLMProviderStats, LLMProviderType } from "@/types/llm";

// ============================================
// Constants
// ============================================

const STORAGE_KEY = "chinaconnect_llm_costs";

// ============================================
// Cost Tracker Class
// ============================================

export class CostTracker {
  private records: CostRecord[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Record a cost entry
   */
  record(entry: Omit<CostRecord, "id" | "timestamp">): CostRecord {
    const record: CostRecord = {
      ...entry,
      id: `cost_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date(),
    };

    this.records.push(record);
    this.saveToStorage();
    this.notifyListeners();

    return record;
  }

  /**
   * Record cost from a response
   */
  recordFromResponse(
    provider: LLMProviderType,
    model: string,
    usage: { inputTokens: number; outputTokens: number },
    cost: number,
    requestId?: string,
  ): CostRecord {
    return this.record({
      provider,
      model,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      cost,
      currency: "USD",
      requestId,
    });
  }

  /**
   * Get all records
   */
  getRecords(): CostRecord[] {
    return [...this.records];
  }

  /**
   * Get records for a specific provider
   */
  getRecordsForProvider(provider: LLMProviderType): CostRecord[] {
    return this.records.filter((r) => r.provider === provider);
  }

  /**
   * Get records within a date range
   */
  getRecordsInRange(start: Date, end: Date): CostRecord[] {
    return this.records.filter((r) => {
      const timestamp = new Date(r.timestamp);
      return timestamp >= start && timestamp <= end;
    });
  }

  /**
   * Get total cost
   */
  getTotalCost(provider?: LLMProviderType): number {
    const records = provider ? this.getRecordsForProvider(provider) : this.records;
    return records.reduce((sum, r) => sum + r.cost, 0);
  }

  /**
   * Get cost summary for a period
   */
  getCostSummary(start?: Date, end?: Date): CostSummary {
    const startDate = start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
    const endDate = end || new Date();

    const filteredRecords = this.getRecordsInRange(startDate, endDate);

    const byProvider: Partial<Record<LLMProviderType, number>> = {};
    const byDay: Record<string, number> = {};

    let totalCost = 0;

    for (const record of filteredRecords) {
      totalCost += record.cost;

      // By provider
      byProvider[record.provider] = (byProvider[record.provider] || 0) + record.cost;

      // By day
      const dayKey = new Date(record.timestamp).toISOString().split("T")[0];
      byDay[dayKey] = (byDay[dayKey] || 0) + record.cost;
    }

    return {
      totalCost,
      byProvider,
      byDay,
      currency: "USD",
      period: { start: startDate, end: endDate },
    };
  }

  /**
   * Get provider statistics
   */
  getProviderStats(provider: LLMProviderType): LLMProviderStats | null {
    const records = this.getRecordsForProvider(provider);

    if (records.length === 0) {
      return null;
    }

    const totalRequests = records.length;
    const successfulRequests = records.filter((r) => r.cost > 0).length;
    const failedRequests = totalRequests - successfulRequests;

    const totalInputTokens = records.reduce((sum, r) => sum + r.inputTokens, 0);
    const totalOutputTokens = records.reduce((sum, r) => sum + r.outputTokens, 0);
    const totalCost = records.reduce((sum, r) => sum + r.cost, 0);

    const lastRecord = records[records.length - 1];

    return {
      provider,
      totalRequests,
      successfulRequests,
      failedRequests,
      averageLatencyMs: 0, // Not tracked here
      totalInputTokens,
      totalOutputTokens,
      totalCost,
      lastUsedAt: lastRecord.timestamp,
    };
  }

  /**
   * Get statistics for all providers
   */
  getAllProviderStats(): LLMProviderStats[] {
    const providers: LLMProviderType[] = ["qwen", "claude", "minimax", "gpt4o"];
    const stats: LLMProviderStats[] = [];

    for (const provider of providers) {
      const providerStats = this.getProviderStats(provider);
      if (providerStats) {
        stats.push(providerStats);
      }
    }

    return stats;
  }

  /**
   * Export records as JSON
   */
  exportAsJSON(): string {
    return JSON.stringify(
      {
        records: this.records,
        exportedAt: new Date().toISOString(),
      },
      null,
      2,
    );
  }

  /**
   * Import records from JSON
   */
  importFromJSON(json: string): number {
    try {
      const data = JSON.parse(json);
      if (Array.isArray(data.records)) {
        const before = this.records.length;
        this.records = [...data.records, ...this.records];
        this.saveToStorage();
        this.notifyListeners();
        return this.records.length - before;
      }
      return 0;
    } catch {
      return 0;
    }
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
        this.records = (data.records || []).map((r: CostRecord) => ({
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
      // Keep only last 1000 records to avoid storage limits
      const recordsToSave = this.records.slice(-1000);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ records: recordsToSave }));
    } catch {
      // Ignore storage errors
    }
  }
}

// ============================================
// Singleton Instance
// ============================================

let costTrackerInstance: CostTracker | null = null;

export function getCostTracker(): CostTracker {
  if (!costTrackerInstance) {
    costTrackerInstance = new CostTracker();
  }
  return costTrackerInstance;
}

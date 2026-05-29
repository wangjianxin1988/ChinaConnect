/**
 * LLM Fallback Chain Implementation
 * Implements quality degradation chain: Primary → Backup → Fallback
 */

import { createClaudeClient } from "@/services/claude";
import { createDashScopeClient } from "@/services/dashscope";
import { createGPT4oClient } from "@/services/gpt4o";
import { MiniMaxClient } from "@/services/minimax";
import type {
  FallbackChainConfig,
  FallbackEvent,
  LLMMessage,
  LLMProviderType,
  LLMResponse,
  LLMStreamEvent,
} from "@/types/llm";

// ============================================
// Provider Client Interface
// ============================================

interface LLMProviderClient {
  chatStream(
    messages: LLMMessage[],
    onEvent: (event: LLMStreamEvent) => void,
    onError?: (error: Error) => void,
  ): Promise<LLMResponse>;

  chatBlocking(messages: LLMMessage[]): Promise<LLMResponse>;
}

// ============================================
// Default Configuration
// ============================================

const DEFAULT_CONFIG: FallbackChainConfig = {
  chain: ["qwen", "claude", "minimax", "gpt4o"],
  timeoutMs: 30000,
  retryAttempts: 1,
  retryDelayMs: 1000,
};

// ============================================
// Provider Factory
// ============================================

function createProviderClient(type: LLMProviderType, apiKey?: string): LLMProviderClient | null {
  switch (type) {
    case "qwen": {
      const client = createDashScopeClient();
      if (client) {
        return {
          chatStream: client.chatStream.bind(client),
          chatBlocking: client.chatBlocking.bind(client),
        };
      }
      return null;
    }
    case "claude": {
      const client = createClaudeClient();
      if (client) {
        return {
          chatStream: client.chatStream.bind(client),
          chatBlocking: client.chatBlocking.bind(client),
        };
      }
      return null;
    }
    case "gpt4o": {
      const client = createGPT4oClient();
      if (client) {
        return {
          chatStream: client.chatStream.bind(client),
          chatBlocking: client.chatBlocking.bind(client),
        };
      }
      return null;
    }
    case "minimax": {
      if (apiKey) {
        const client = new MiniMaxClient(apiKey);
        return {
          chatStream: client.chatStream.bind(client),
          chatBlocking: client.chatBlocking.bind(client),
        };
      }
      return null;
    }
    default:
      return null;
  }
}

// ============================================
// Fallback Chain Class
// ============================================

export class FallbackChain {
  private config: FallbackChainConfig;
  private events: FallbackEvent[] = [];
  private listeners: Array<(event: FallbackEvent) => void> = [];

  constructor(config: Partial<FallbackChainConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute the fallback chain with streaming
   */
  async executeStream(
    messages: LLMMessage[],
    onEvent: (event: LLMStreamEvent) => void,
    onProviderChange?: (provider: LLMProviderType, reason: string) => void,
    apiKeys?: Partial<Record<LLMProviderType, string>>,
  ): Promise<LLMResponse> {
    let currentProviderIndex = 0;

    while (currentProviderIndex < this.config.chain.length) {
      const provider = this.config.chain[currentProviderIndex];
      const client = createProviderClient(provider, apiKeys?.[provider]);

      if (!client) {
        this.recordEvent({
          provider,
          event: "failure",
          error: "Provider not configured or API key missing",
          timestamp: new Date(),
        });
        currentProviderIndex++;
        continue;
      }

      this.recordEvent({
        provider,
        event: "attempt",
        timestamp: new Date(),
      });

      onProviderChange?.(provider, `Attempting ${provider}...`);

      try {
        const timeoutPromise = this.withTimeout(this.config.timeoutMs, "Provider timeout");

        const responsePromise = client.chatStream(messages, onEvent, (error) => {
          this.recordEvent({
            provider,
            event: "failure",
            error: error.message,
            timestamp: new Date(),
          });
        });

        const raceResult = await Promise.race([responsePromise, timeoutPromise]);

        if (raceResult.finishReason === "error" && raceResult.error) {
          this.recordEvent({
            provider,
            event: "failure",
            error: raceResult.error,
            timestamp: new Date(),
          });
          currentProviderIndex++;
        }

        this.recordEvent({
          provider,
          event: "success",
          latencyMs: raceResult.latencyMs,
          timestamp: new Date(),
        });

        return raceResult;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        this.recordEvent({
          provider,
          event: "failure",
          error: errorMessage,
          timestamp: new Date(),
        });

        currentProviderIndex++;
      }
    }

    // All providers failed
    return {
      id: `fallback_failed_${Date.now()}`,
      provider: "minimax",
      model: "unknown",
      content: "",
      finishReason: "error",
      latencyMs: 0,
      cost: 0,
      timestamp: new Date(),
      error: "All providers in fallback chain failed",
    };
  }

  /**
   * Execute the fallback chain with blocking calls
   */
  async executeBlocking(
    messages: LLMMessage[],
    apiKeys?: Partial<Record<LLMProviderType, string>>,
  ): Promise<LLMResponse> {
    let currentProviderIndex = 0;

    while (currentProviderIndex < this.config.chain.length) {
      const provider = this.config.chain[currentProviderIndex];
      const client = createProviderClient(provider, apiKeys?.[provider]);

      if (!client) {
        currentProviderIndex++;
        continue;
      }

      this.recordEvent({
        provider,
        event: "attempt",
        timestamp: new Date(),
      });

      try {
        const timeoutPromise = this.withTimeout(this.config.timeoutMs, "Provider timeout");

        const responsePromise = client.chatBlocking(messages);

        const raceResult = await Promise.race([responsePromise, timeoutPromise]);

        if (raceResult.finishReason !== "error" && !raceResult.error) {
          this.recordEvent({
            provider,
            event: "success",
            latencyMs: raceResult.latencyMs,
            timestamp: new Date(),
          });
          return raceResult;
        }

        this.recordEvent({
          provider,
          event: "failure",
          error: raceResult.error,
          timestamp: new Date(),
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        this.recordEvent({
          provider,
          event: "failure",
          error: errorMessage,
          timestamp: new Date(),
        });
      }

      // Retry logic
      if (currentProviderIndex < this.config.chain.length - 1) {
        await this.delay(this.config.retryDelayMs);
      }

      currentProviderIndex++;
    }

    // All providers failed
    return {
      id: `fallback_failed_${Date.now()}`,
      provider: "minimax",
      model: "unknown",
      content: "",
      finishReason: "error",
      latencyMs: 0,
      cost: 0,
      timestamp: new Date(),
      error: "All providers in fallback chain failed",
    };
  }

  /**
   * Create a timeout promise
   */
  private withTimeout<T>(ms: number, message: string): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(message));
      }, ms);
    });
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Record a fallback event
   */
  private recordEvent(event: FallbackEvent): void {
    this.events.push(event);
    this.notifyListeners(event);
  }

  /**
   * Subscribe to fallback events
   */
  subscribe(listener: (event: FallbackEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify all listeners of an event
   */
  private notifyListeners(event: FallbackEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch {
        // Ignore listener errors
      }
    }
  }

  /**
   * Get all recorded events
   */
  getEvents(): FallbackEvent[] {
    return [...this.events];
  }

  /**
   * Get events for a specific provider
   */
  getEventsForProvider(provider: LLMProviderType): FallbackEvent[] {
    return this.events.filter((e) => e.provider === provider);
  }

  /**
   * Get the fallback chain
   */
  getChain(): LLMProviderType[] {
    return [...this.config.chain];
  }

  /**
   * Update the fallback chain
   */
  setChain(chain: LLMProviderType[]): void {
    this.config.chain = chain;
  }

  /**
   * Clear recorded events
   */
  clearEvents(): void {
    this.events = [];
  }

  /**
   * Get statistics for the fallback chain
   */
  getStats(): {
    totalAttempts: number;
    successes: number;
    failures: number;
    timeouts: number;
    byProvider: Record<LLMProviderType, { attempts: number; successes: number; failures: number }>;
  } {
    const stats = {
      totalAttempts: 0,
      successes: 0,
      failures: 0,
      timeouts: 0,
      byProvider: {} as Record<
        LLMProviderType,
        { attempts: number; successes: number; failures: number }
      >,
    };

    for (const event of this.events) {
      if (event.event === "attempt") {
        stats.totalAttempts++;
        if (!stats.byProvider[event.provider]) {
          stats.byProvider[event.provider] = { attempts: 0, successes: 0, failures: 0 };
        }
        stats.byProvider[event.provider].attempts++;
      } else if (event.event === "success") {
        stats.successes++;
        if (stats.byProvider[event.provider]) {
          stats.byProvider[event.provider].successes++;
        }
      } else if (event.event === "failure") {
        stats.failures++;
        if (stats.byProvider[event.provider]) {
          stats.byProvider[event.provider].failures++;
        }
        if (event.error?.includes("timeout")) {
          stats.timeouts++;
        }
      }
    }

    return stats;
  }
}

// ============================================
// Singleton Instance
// ============================================

let fallbackChainInstance: FallbackChain | null = null;

export function getFallbackChain(): FallbackChain {
  if (!fallbackChainInstance) {
    fallbackChainInstance = new FallbackChain();
  }
  return fallbackChainInstance;
}

export function createFallbackChain(config?: Partial<FallbackChainConfig>): FallbackChain {
  fallbackChainInstance = new FallbackChain(config);
  return fallbackChainInstance;
}

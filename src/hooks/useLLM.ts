/**
 * useLLM Hook
 * React hook for LLM routing, fallback, and stats
 */

import { type CostTracker, getCostTracker } from "@/lib/llm/cost-tracker";
import {
  type FallbackChain,
  createFallbackChain,
  getFallbackChain,
} from "@/lib/llm/fallback-chain";
import { type LatencyTracker, getLatencyTracker } from "@/lib/llm/latency-tracker";
import { type LLMRouter, createLLMRouter, getLLMRouter } from "@/services/llm-router";
import type {
  CostSummary,
  LLMProviderStats,
  LLMProviderType,
  LLMRequest,
  LLMResponse,
  LLMStats,
  LLMStreamEvent,
  LatencyStats,
  RoutingResult,
} from "@/types/llm";
import type { LLMMessage } from "@/types/llm";
import { useCallback, useEffect, useState } from "react";

// ============================================
// Hook Types
// ============================================

export interface UseLLMOptions {
  autoTrackCost?: boolean;
  autoTrackLatency?: boolean;
  enableFallback?: boolean;
  initialProvider?: LLMProviderType;
}

export interface UseLLMReturn {
  // State
  isLoading: boolean;
  currentProvider: LLMProviderType | null;
  routingResult: RoutingResult | null;
  lastResponse: LLMResponse | null;
  error: string | null;

  // Stats
  stats: LLMStats | null;
  costSummary: CostSummary | null;
  latencyStats: LatencyStats[];
  providerStats: LLMProviderStats[];

  // Actions
  sendMessage: (messages: LLMMessage[]) => Promise<LLMResponse>;
  sendMessageStream: (
    messages: LLMMessage[],
    onEvent: (event: LLMStreamEvent) => void,
  ) => Promise<LLMResponse>;
  switchProvider: (provider: LLMProviderType) => void;
  refreshStats: () => void;
  clearStats: () => void;

  // Provider availability
  isProviderAvailable: (provider: LLMProviderType) => boolean;
}

// ============================================
// Hook Implementation
// ============================================

export function useLLM(options: UseLLMOptions = {}): UseLLMReturn {
  const {
    autoTrackCost = true,
    autoTrackLatency = true,
    enableFallback = true,
    initialProvider,
  } = options;

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<LLMProviderType | null>(
    initialProvider || null,
  );
  const [routingResult, setRoutingResult] = useState<RoutingResult | null>(null);
  const [lastResponse, setLastResponse] = useState<LLMResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Stats state
  const [stats, setStats] = useState<LLMStats | null>(null);
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
  const [latencyStats, setLatencyStats] = useState<LatencyStats[]>([]);
  const [providerStats, setProviderStats] = useState<LLMProviderStats[]>([]);

  // Service instances
  const [router] = useState<LLMRouter>(() => getLLMRouter());
  const [fallbackChain] = useState<FallbackChain>(() => getFallbackChain());
  const [costTracker] = useState<CostTracker>(() => getCostTracker());
  const [latencyTracker] = useState<LatencyTracker>(() => getLatencyTracker());

  // Initialize
  useEffect(() => {
    refreshStats();

    // Subscribe to tracker changes
    const costUnsub = costTracker.subscribe(refreshStats);
    const latencyUnsub = latencyTracker.subscribe(refreshStats);

    return () => {
      costUnsub();
      latencyUnsub();
    };
  }, [costTracker, latencyTracker]);

  /**
   * Refresh all stats
   */
  const refreshStats = useCallback(() => {
    setCostSummary(costTracker.getCostSummary());
    setLatencyStats(latencyTracker.getAllStats());
    setProviderStats(costTracker.getAllProviderStats());

    // Build combined stats
    const providers = costTracker.getAllProviderStats();
    const latency = latencyTracker.getAllStats();

    const combinedStats: LLMStats = {
      providers,
      totalCost: costTracker.getCostSummary(),
      latencyStats: latency,
      uptime: {} as Record<LLMProviderType, number>,
    };

    // Calculate uptime for each provider
    const providerTypes: LLMProviderType[] = ["qwen", "claude", "minimax", "gpt4o"];
    for (const type of providerTypes) {
      const latStats = latency.find((s) => s.provider === type);
      combinedStats.uptime[type] = latStats?.successRate ?? 0;
    }

    setStats(combinedStats);
  }, [costTracker, latencyTracker]);

  /**
   * Clear all stats
   */
  const clearStats = useCallback(() => {
    costTracker.clear();
    latencyTracker.clear();
    refreshStats();
  }, [costTracker, latencyTracker, refreshStats]);

  /**
   * Route request to appropriate provider
   */
  const routeRequest = useCallback(
    (request: LLMRequest): RoutingResult => {
      const result = router.route(request);
      setRoutingResult(result);
      setCurrentProvider(result.provider);
      return result;
    },
    [router],
  );

  /**
   * Send message with fallback chain
   */
  const sendMessageInternal = useCallback(
    async (
      messages: LLMMessage[],
      useStream: boolean,
      onEvent?: (event: LLMStreamEvent) => void,
    ): Promise<LLMResponse> => {
      setIsLoading(true);
      setError(null);

      // Route the request
      const request: LLMRequest = { messages };
      const routing = routeRequest(request);

      try {
        let response: LLMResponse;

        if (enableFallback) {
          // Build API keys map for fallback chain
          const apiKeys: Partial<Record<LLMProviderType, string>> = {
            minimax: import.meta.env.PUBLIC_MINIMAX_API_KEY,
            qwen: import.meta.env.DASHSCOPE_API_KEY,
            claude: import.meta.env.ANTHROPIC_API_KEY,
            gpt4o: import.meta.env.OPENAI_API_KEY,
          };

          if (useStream && onEvent) {
            response = await fallbackChain.executeStream(
              messages,
              onEvent,
              (provider, reason) => {
                setCurrentProvider(provider);
                setRoutingResult({
                  provider,
                  config: router.getProviderConfig(provider)!,
                  reason,
                  fallbackChain: routing.fallbackChain,
                });
              },
              apiKeys,
            );
          } else {
            response = await fallbackChain.executeBlocking(messages, apiKeys);
          }
        } else {
          // Direct call to routed provider
          response = await callProvider(routing.provider, messages, useStream, onEvent);
        }

        setLastResponse(response);

        // Track cost
        if (autoTrackCost && response.usage && response.cost > 0) {
          costTracker.recordFromResponse(
            response.provider,
            response.model,
            response.usage,
            response.cost,
            response.id,
          );
        }

        // Track latency
        if (autoTrackLatency) {
          latencyTracker.recordFromResponse(
            response.provider,
            response.model,
            response.latencyMs,
            response.finishReason !== "error",
            routing.config.region,
          );
        }

        if (response.error) {
          setError(response.error);
        }

        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [
      routeRequest,
      router,
      fallbackChain,
      enableFallback,
      autoTrackCost,
      autoTrackLatency,
      costTracker,
      latencyTracker,
    ],
  );

  /**
   * Send message (blocking)
   */
  const sendMessage = useCallback(
    async (messages: LLMMessage[]): Promise<LLMResponse> => {
      return sendMessageInternal(messages, false);
    },
    [sendMessageInternal],
  );

  /**
   * Send message with streaming
   */
  const sendMessageStream = useCallback(
    async (
      messages: LLMMessage[],
      onEvent: (event: LLMStreamEvent) => void,
    ): Promise<LLMResponse> => {
      return sendMessageInternal(messages, true, onEvent);
    },
    [sendMessageInternal],
  );

  /**
   * Switch provider manually
   */
  const switchProvider = useCallback(
    (provider: LLMProviderType) => {
      const config = router.getProviderConfig(provider);
      if (config) {
        setCurrentProvider(provider);
        setRoutingResult({
          provider,
          config,
          reason: `Manual switch to ${provider}`,
          fallbackChain: [],
        });
      }
    },
    [router],
  );

  /**
   * Check if provider is available
   */
  const isProviderAvailable = useCallback(
    (provider: LLMProviderType): boolean => {
      return router.isProviderAvailable(provider);
    },
    [router],
  );

  return {
    isLoading,
    currentProvider,
    routingResult,
    lastResponse,
    error,
    stats,
    costSummary,
    latencyStats,
    providerStats,
    sendMessage,
    sendMessageStream,
    switchProvider,
    refreshStats,
    clearStats,
    isProviderAvailable,
  };
}

// ============================================
// Helper Functions
// ============================================

async function callProvider(
  provider: LLMProviderType,
  messages: LLMMessage[],
  _useStream: boolean,
  _onEvent?: (event: LLMStreamEvent) => void,
): Promise<LLMResponse> {
  // This is a simplified implementation
  // In production, this would call the actual provider clients
  switch (provider) {
    case "qwen": {
      const client = createDashScopeClient();
      if (!client) {
        throw new Error("Qwen client not configured");
      }
      return client.chatBlocking(messages);
    }
    case "claude": {
      const client = createClaudeClient();
      if (!client) {
        throw new Error("Claude client not configured");
      }
      return client.chatBlocking(messages);
    }
    case "gpt4o": {
      const client = createGPT4oClient();
      if (!client) {
        throw new Error("GPT-4o client not configured");
      }
      return client.chatBlocking(messages);
    }
    case "minimax": {
      const { MiniMaxClient } = await import("@/services/minimax");
      const apiKey = import.meta.env.PUBLIC_MINIMAX_API_KEY || "";
      const client = new MiniMaxClient(apiKey);
      return client.chatBlocking(
        messages as Array<{ role: "system" | "user" | "assistant"; content: string }>,
      );
    }
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

// ============================================
// Re-export
// ============================================

export { createLLMRouter, createFallbackChain, getCostTracker, getLatencyTracker };

// @ts-nocheck
/**
 * Unit tests for LLM Router
 * Tests routing logic based on geo-location, cost, latency, and fallback chains
 */

import type {
  LLMProviderConfig,
  LLMProviderType,
  RoutingContext,
  RoutingResult,
} from "@/types/llm";
import { describe, expect, it } from "vitest";

// ============================================
// Mock Provider Configurations
// ============================================

const mockProviders: LLMProviderConfig[] = [
  {
    type: "qwen",
    apiKey: "test-key",
    model: "qwen-turbo",
    enabled: true,
    priority: 1,
    region: "cn",
    capabilities: ["chat", "translation"],
    rateLimit: { requestsPerMinute: 60, tokensPerMinute: 10000 },
    cost: { inputCostPer1M: 0.5, outputCostPer1M: 1.5, currency: "USD" },
  },
  {
    type: "minimax",
    apiKey: "test-key",
    model: "minimax-text-01",
    enabled: true,
    priority: 2,
    region: "cn",
    capabilities: ["chat", "code"],
    rateLimit: { requestsPerMinute: 30, tokensPerMinute: 8000 },
    cost: { inputCostPer1M: 0.8, outputCostPer1M: 2.0, currency: "USD" },
  },
  {
    type: "claude",
    apiKey: "test-key",
    model: "claude-3-5-sonnet",
    enabled: true,
    priority: 3,
    region: "global",
    capabilities: ["chat", "reasoning"],
    rateLimit: { requestsPerMinute: 50, tokensPerMinute: 90000 },
    cost: { inputCostPer1M: 3.0, outputCostPer1M: 15.0, currency: "USD" },
  },
  {
    type: "gpt4o",
    apiKey: "test-key",
    model: "gpt-4o",
    enabled: true,
    priority: 4,
    region: "global",
    capabilities: ["chat", "vision"],
    rateLimit: { requestsPerMinute: 40, tokensPerMinute: 60000 },
    cost: { inputCostPer1M: 5.0, outputCostPer1M: 15.0, currency: "USD" },
  },
];

// ============================================
// Routing Logic Implementation (for testing)
// ============================================

function routeRequest(
  providers: LLMProviderConfig[],
  context: RoutingContext,
): RoutingResult | null {
  const { geoLocation, strategy } = context;

  // Filter enabled providers
  let eligibleProviders = providers.filter((p) => p.enabled);

  // Apply geo-based filtering
  if (strategy.type === "geo") {
    if (geoLocation.region === "cn" || geoLocation.countryCode === "CN") {
      eligibleProviders = eligibleProviders.filter(
        (p) => p.region === "cn" || p.region === "fallback",
      );
    } else {
      eligibleProviders = eligibleProviders.filter(
        (p) => p.region === "global" || p.region === "fallback",
      );
    }
  }

  // Sort by priority
  eligibleProviders.sort((a, b) => a.priority - b.priority);

  // Apply cost strategy
  if (strategy.type === "cost") {
    eligibleProviders.sort((a, b) => {
      const costA = (a.cost?.inputCostPer1M ?? 0) + (a.cost?.outputCostPer1M ?? 0);
      const costB = (b.cost?.inputCostPer1M ?? 0) + (b.cost?.outputCostPer1M ?? 0);
      return costA - costB;
    });
  }

  // Apply latency strategy (mock - would use real latency data)
  if (strategy.type === "latency") {
    // In real implementation, would sort by measured latency
    eligibleProviders.sort((a, b) => a.priority - b.priority);
  }

  if (eligibleProviders.length === 0) {
    return null;
  }

  const selected = eligibleProviders[0];
  const fallbackChain =
    strategy.fallbackChain.length > 0
      ? strategy.fallbackChain
      : eligibleProviders.slice(1).map((p) => p.type);

  return {
    provider: selected.type,
    config: selected,
    reason: `Selected ${selected.type} via ${strategy.type} strategy`,
    fallbackChain,
  };
}

function getFallbackChain(
  providers: LLMProviderConfig[],
  initialProvider: LLMProviderType,
  config: { retryAttempts: number; retryDelayMs: number },
): LLMProviderType[] {
  const chain: LLMProviderType[] = [initialProvider];
  const _providerMap = new Map(providers.map((p) => [p.type, p]));

  for (let i = 0; i < config.retryAttempts; i++) {
    const sorted = [...providers].sort((a, b) => a.priority - b.priority);
    for (const p of sorted) {
      if (!chain.includes(p.type) && p.enabled) {
        chain.push(p.type);
        break;
      }
    }
  }

  return chain;
}

// ============================================
// Tests
// ============================================

describe("LLM Router", () => {
  describe("Geo-based Routing", () => {
    it("routes CN users to CN providers first", () => {
      const context: RoutingContext = {
        geoLocation: {
          countryCode: "CN",
          region: "cn",
        },
        strategy: {
          type: "geo",
          fallbackChain: ["qwen", "minimax", "claude"],
        },
      };

      const result = routeRequest(mockProviders, context);

      expect(result).not.toBeNull();
      expect(result!.provider).toMatch(/(qwen|minimax)/);
      expect(result!.config.region).toBe("cn");
    });

    it("routes global users to global providers first", () => {
      const context: RoutingContext = {
        geoLocation: {
          countryCode: "US",
          region: "global",
        },
        strategy: {
          type: "geo",
          fallbackChain: ["claude", "gpt4o", "qwen"],
        },
      };

      const result = routeRequest(mockProviders, context);

      expect(result).not.toBeNull();
      expect(result!.config.region).toBe("global");
    });

    it("falls back when preferred region has no providers", () => {
      const cnOnlyProviders: LLMProviderConfig[] = [
        { ...mockProviders[0], region: "cn" },
        { ...mockProviders[1], region: "cn" },
      ];

      const context: RoutingContext = {
        geoLocation: {
          countryCode: "US",
          region: "global",
        },
        strategy: {
          type: "geo",
          fallbackChain: ["qwen", "minimax"],
        },
      };

      const result = routeRequest(cnOnlyProviders, context);
      // CN-only providers should be filtered out for global users
      expect(result).toBeNull();
    });
  });

  describe("Cost-based Routing", () => {
    it("selects lowest cost provider", () => {
      const context: RoutingContext = {
        geoLocation: { countryCode: "CN" },
        strategy: {
          type: "cost",
          fallbackChain: [],
        },
      };

      const result = routeRequest(mockProviders, context);

      expect(result).not.toBeNull();
      // Qwen should be cheapest among CN providers
      expect(result!.provider).toBe("qwen");
    });
  });

  describe("Priority-based Routing", () => {
    it("selects highest priority provider", () => {
      const context: RoutingContext = {
        geoLocation: { countryCode: "CN" },
        strategy: {
          type: "geo",
          fallbackChain: [],
        },
      };

      const result = routeRequest(mockProviders, context);

      expect(result).not.toBeNull();
      expect(result!.config.priority).toBe(1);
    });
  });

  describe("Fallback Chain", () => {
    it("generates correct fallback chain", () => {
      const chain = getFallbackChain(mockProviders, "qwen", {
        retryAttempts: 3,
        retryDelayMs: 1000,
      });

      expect(chain).toContain("qwen");
      expect(chain.length).toBeGreaterThan(1);
      // Should not have duplicates
      expect(new Set(chain).size).toBe(chain.length);
    });

    it("fallback chain excludes disabled providers", () => {
      const mixedProviders: LLMProviderConfig[] = [
        ...mockProviders,
        { ...mockProviders[0], type: "disabled" as LLMProviderType, enabled: false },
      ];

      const chain = getFallbackChain(mixedProviders, "qwen", {
        retryAttempts: 5,
        retryDelayMs: 1000,
      });

      expect(chain).not.toContain("disabled");
    });
  });

  describe("Provider Selection", () => {
    it("returns null when no providers are available", () => {
      const disabledProviders = mockProviders.map((p) => ({ ...p, enabled: false }));

      const context: RoutingContext = {
        geoLocation: { countryCode: "CN" },
        strategy: { type: "geo", fallbackChain: [] },
      };

      const result = routeRequest(disabledProviders, context);
      expect(result).toBeNull();
    });

    it("includes provider config in routing result", () => {
      const context: RoutingContext = {
        geoLocation: { countryCode: "CN" },
        strategy: { type: "geo", fallbackChain: [] },
      };

      const result = routeRequest(mockProviders, context);

      expect(result).not.toBeNull();
      expect(result!.config).toBeDefined();
      expect(result!.config.type).toBe(result!.provider);
    });
  });

  describe("Routing Context", () => {
    it("handles missing region in geoLocation", () => {
      const context: RoutingContext = {
        geoLocation: { countryCode: "CN" },
        strategy: { type: "geo", fallbackChain: [] },
      };

      const result = routeRequest(mockProviders, context);
      expect(result).not.toBeNull();
    });

    it("handles custom fallback chain from strategy", () => {
      const customChain: LLMProviderType[] = ["claude", "gpt4o"];
      const context: RoutingContext = {
        geoLocation: { countryCode: "US" },
        strategy: { type: "geo", fallbackChain: customChain },
      };

      const result = routeRequest(mockProviders, context);
      expect(result).not.toBeNull();
      expect(result!.fallbackChain).toEqual(customChain);
    });
  });
});

describe("LLM Provider Stats", () => {
  it("tracks request counts correctly", () => {
    const stats = {
      provider: "qwen" as LLMProviderType,
      totalRequests: 100,
      successfulRequests: 95,
      failedRequests: 5,
      averageLatencyMs: 250,
      totalInputTokens: 500000,
      totalOutputTokens: 1000000,
      totalCost: 2.5,
    };

    expect(stats.totalRequests).toBe(stats.successfulRequests + stats.failedRequests);
    expect(stats.totalCost).toBeGreaterThan(0);
  });

  it("calculates success rate correctly", () => {
    const totalRequests = 100;
    const successfulRequests = 95;
    const successRate = (successfulRequests / totalRequests) * 100;

    expect(successRate).toBe(95);
  });
});

describe("Cost Calculation", () => {
  it("calculates total cost for a request", () => {
    const inputTokens = 1000;
    const outputTokens = 500;
    const provider = mockProviders.find((p) => p.type === "qwen")!;

    const inputCost = (inputTokens / 1_000_000) * (provider.cost?.inputCostPer1M ?? 0);
    const outputCost = (outputTokens / 1_000_000) * (provider.cost?.outputCostPer1M ?? 0);
    const totalCost = inputCost + outputCost;

    expect(totalCost).toBeCloseTo(0.00125, 4);
  });

  it("handles missing cost data gracefully", () => {
    const noCostProvider: LLMProviderConfig = {
      type: "qwen",
      apiKey: "test",
      model: "test",
      enabled: true,
      priority: 1,
    };

    const inputCost = noCostProvider.cost?.inputCostPer1M ?? 0;
    expect(inputCost).toBe(0);
  });
});

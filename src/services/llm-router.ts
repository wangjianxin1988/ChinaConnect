/**
 * LLM Router Service
 * Routes requests to appropriate LLM providers based on geo-location and strategy
 */

import type {
  GeoLocation,
  LLMProviderConfig,
  LLMProviderType,
  LLMRequest,
  RoutingContext,
  RoutingResult,
  RoutingStrategy,
} from "@/types/llm";

// ============================================
// Default Provider Configurations
// ============================================

const DEFAULT_PROVIDERS: LLMProviderConfig[] = [
  {
    type: "qwen",
    apiKey: "",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen-max",
    enabled: true,
    priority: 1,
    region: "cn",
    capabilities: ["chat", "function_calling", "vision"],
    cost: {
      inputCostPer1M: 0.02,
      outputCostPer1M: 0.06,
      currency: "CNY",
    },
  },
  {
    type: "claude",
    apiKey: "",
    baseUrl: "https://api.anthropic.com/v1",
    model: "claude-sonnet-4-20250514",
    enabled: true,
    priority: 2,
    region: "global",
    capabilities: ["chat", "function_calling", "vision"],
    cost: {
      inputCostPer1M: 3.0,
      outputCostPer1M: 15.0,
      currency: "USD",
    },
  },
  {
    type: "minimax",
    apiKey: "",
    baseUrl: "https://api.minimax.chat/v1",
    model: "MiniMax-M2.7-highspeed",
    enabled: true,
    priority: 3,
    region: "fallback",
    capabilities: ["chat"],
    cost: {
      inputCostPer1M: 0.01,
      outputCostPer1M: 0.1,
      currency: "CNY",
    },
  },
  {
    type: "gpt4o",
    apiKey: "",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o",
    enabled: true,
    priority: 4,
    region: "global",
    capabilities: ["chat", "function_calling", "vision"],
    cost: {
      inputCostPer1M: 5.0,
      outputCostPer1M: 15.0,
      currency: "USD",
    },
  },
];

// ============================================
// Geo-Routing Rules
// ============================================

const CN_COUNTRY_CODES = new Set([
  "CN", // China
  "HK", // Hong Kong
  "MO", // Macau
  "TW", // Taiwan
]);

const ROUTING_RULES: Record<string, LLMProviderType[]> = {
  cn: ["qwen", "claude", "minimax", "gpt4o"], // China: Qwen primary, Claude backup
  global: ["claude", "gpt4o", "qwen", "minimax"], // Global: Claude primary
  fallback: ["minimax", "gpt4o", "qwen"], // Fallback: MiniMax first
};

// ============================================
// LLM Router Class
// ============================================

export class LLMRouter {
  private providers: Map<LLMProviderType, LLMProviderConfig>;
  private defaultStrategy: RoutingStrategy;

  constructor(
    providers: LLMProviderConfig[] = DEFAULT_PROVIDERS,
    strategy: RoutingStrategy = {
      type: "geo",
      prefercn: true,
      fallbackChain: ["qwen", "claude", "minimax", "gpt4o"],
    },
  ) {
    this.providers = new Map();
    for (const provider of providers) {
      this.providers.set(provider.type, provider);
    }
    this.defaultStrategy = strategy;
  }

  /**
   * Detect user's geo location from request context or environment
   */
  detectGeoLocation(request?: LLMRequest): GeoLocation {
    // Check if location is provided in request
    if (request?.userContext?.countryCode) {
      return {
        countryCode: request.userContext.countryCode,
        region: request.userContext.region || this.inferRegion(request.userContext.countryCode),
      };
    }

    // Try to detect from environment/API headers (Cloudflare, etc.)
    if (typeof globalThis.location !== "undefined") {
      // Browser environment - could use a geo-IP API
      return {
        countryCode: "US",
        region: "global",
      };
    }

    // Default fallback
    return {
      countryCode: "CN",
      region: "cn",
    };
  }

  /**
   * Infer region from country code
   */
  private inferRegion(countryCode: string): "cn" | "global" {
    return CN_COUNTRY_CODES.has(countryCode.toUpperCase()) ? "cn" : "global";
  }

  /**
   * Determine the region for routing
   */
  private determineRegion(geo: GeoLocation, preferCN?: boolean): "cn" | "global" {
    if (preferCN !== undefined) {
      return preferCN ? "cn" : "global";
    }
    return geo.region || this.inferRegion(geo.countryCode);
  }

  /**
   * Route request to appropriate provider based on geo location and strategy
   */
  route(request: LLMRequest, context?: Partial<RoutingContext>): RoutingResult {
    const strategy = context?.strategy || this.defaultStrategy;
    const geo = context?.geoLocation || this.detectGeoLocation(request);

    const region = this.determineRegion(geo, strategy.prefercn);
    const chain = this.getProviderChain(region, strategy);

    // Get the primary provider
    const primaryProvider = chain[0];
    const config = this.providers.get(primaryProvider);

    if (!config || !config.enabled) {
      // Try next in chain
      for (const providerType of chain) {
        const p = this.providers.get(providerType);
        if (p?.enabled) {
          return {
            provider: providerType,
            config: p,
            reason: `Primary provider unavailable, using ${providerType}`,
            fallbackChain: chain.filter((t) => t !== providerType),
          };
        }
      }
    }

    const reason = this.getRoutingReason(region, primaryProvider);

    return {
      provider: primaryProvider,
      config: config || this.getDefaultConfig(primaryProvider),
      reason,
      fallbackChain: chain.filter((t) => t !== primaryProvider),
    };
  }

  /**
   * Get provider chain for a region
   */
  private getProviderChain(region: "cn" | "global", strategy: RoutingStrategy): LLMProviderType[] {
    // Check if any provider is explicitly preferred
    if (strategy.type === "fallback" && strategy.fallbackChain) {
      return strategy.fallbackChain;
    }

    // Use region-based routing
    return ROUTING_RULES[region] || ROUTING_RULES.fallback;
  }

  /**
   * Generate human-readable routing reason
   */
  private getRoutingReason(region: "cn" | "global", provider: LLMProviderType): string {
    if (region === "cn") {
      return `Routing to ${provider} for China region (low latency, cost optimization)`;
    }
    return `Routing to ${provider} for global region (quality optimization)`;
  }

  /**
   * Get configuration for a specific provider
   */
  getProviderConfig(type: LLMProviderType): LLMProviderConfig | undefined {
    return this.providers.get(type);
  }

  /**
   * Update provider configuration
   */
  updateProviderConfig(type: LLMProviderType, updates: Partial<LLMProviderConfig>): void {
    const existing = this.providers.get(type);
    if (existing) {
      this.providers.set(type, { ...existing, ...updates });
    }
  }

  /**
   * Get all enabled providers sorted by priority
   */
  getEnabledProviders(): LLMProviderConfig[] {
    return Array.from(this.providers.values())
      .filter((p) => p.enabled)
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get default config for a provider type (when not configured)
   */
  private getDefaultConfig(type: LLMProviderType): LLMProviderConfig {
    const defaults = DEFAULT_PROVIDERS.find((p) => p.type === type);
    if (!defaults) {
      throw new Error(`Unknown provider type: ${type}`);
    }
    return { ...defaults };
  }

  /**
   * Check if a provider is available and enabled
   */
  isProviderAvailable(type: LLMProviderType): boolean {
    const config = this.providers.get(type);
    return config?.enabled ?? false;
  }

  /**
   * Get provider by type
   */
  getProvider(type: LLMProviderType): LLMProviderConfig | undefined {
    return this.providers.get(type);
  }

  /**
   * Get cost estimate for a request across all providers
   */
  estimateCost(
    inputTokens: number,
    outputTokens: number,
    provider?: LLMProviderType,
  ): Map<LLMProviderType, number> {
    const costs = new Map<LLMProviderType, number>();

    const providersToCheck = provider ? [provider] : Array.from(this.providers.keys());

    for (const type of providersToCheck) {
      const config = this.providers.get(type);
      if (config?.cost) {
        const inputCost = (inputTokens / 1_000_000) * config.cost.inputCostPer1M;
        const outputCost = (outputTokens / 1_000_000) * config.cost.outputCostPer1M;
        costs.set(type, inputCost + outputCost);
      }
    }

    return costs;
  }
}

// ============================================
// Singleton Instance
// ============================================

let routerInstance: LLMRouter | null = null;

export function getLLMRouter(): LLMRouter {
  if (!routerInstance) {
    routerInstance = new LLMRouter();
  }
  return routerInstance;
}

export function createLLMRouter(config?: {
  providers?: LLMProviderConfig[];
  strategy?: RoutingStrategy;
}): LLMRouter {
  routerInstance = new LLMRouter(config?.providers, config?.strategy);
  return routerInstance;
}

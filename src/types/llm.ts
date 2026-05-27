/**
 * ChinaConnect LLM Router Types
 * Type definitions for multi-provider LLM routing system
 */

// ============================================
// Provider Types
// ============================================

export type LLMProviderType = "qwen" | "claude" | "minimax" | "gpt4o";

export type ProviderStatus = "available" | "unavailable" | "rate_limited" | "error";

export interface LLMProviderConfig {
  type: LLMProviderType;
  apiKey: string;
  baseUrl?: string;
  model: string;
  enabled: boolean;
  priority: number; // Lower = higher priority
  region?: "cn" | "global" | "fallback";
  capabilities?: string[];
  rateLimit?: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  cost?: {
    inputCostPer1M: number;
    outputCostPer1M: number;
    currency: string;
  };
}

export interface LLMProviderStats {
  provider: LLMProviderType;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatencyMs: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  lastUsedAt?: Date;
  lastError?: string;
}

// ============================================
// Request/Response Types
// ============================================

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMRequest {
  messages: LLMMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  userContext?: {
    language?: "en" | "zh" | "ja" | "ko";
    countryCode?: string; // ISO 3166-1 alpha-2
    region?: "cn" | "global";
  };
  metadata?: Record<string, unknown>;
}

export interface LLMResponse {
  id: string;
  provider: LLMProviderType;
  model: string;
  content: string;
  finishReason: "stop" | "length" | "content_filter" | "error";
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
  cost: number;
  timestamp: Date;
  error?: string;
}

export interface LLMStreamEvent {
  type: "content" | "complete" | "error";
  content?: string;
  error?: string;
}

// ============================================
// Router Types
// ============================================

export interface RoutingStrategy {
  type: "geo" | "cost" | "latency" | "quality" | "fallback";
  prefercn?: boolean;
  fallbackChain: LLMProviderType[];
}

export interface GeoLocation {
  countryCode: string; // ISO 3166-1 alpha-2 (e.g., "CN", "US")
  region?: "cn" | "global";
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface RoutingContext {
  geoLocation: GeoLocation;
  strategy: RoutingStrategy;
  requestMetadata?: Record<string, unknown>;
}

export interface RoutingResult {
  provider: LLMProviderType;
  config: LLMProviderConfig;
  reason: string;
  fallbackChain: LLMProviderType[];
}

// ============================================
// Fallback Chain Types
// ============================================

export interface FallbackChainConfig {
  chain: LLMProviderType[];
  timeoutMs: number;
  retryAttempts: number;
  retryDelayMs: number;
}

export interface FallbackEvent {
  provider: LLMProviderType;
  event: "attempt" | "success" | "failure" | "timeout";
  latencyMs?: number;
  error?: string;
  timestamp: Date;
}

// ============================================
// Cost Tracking Types
// ============================================

export interface CostRecord {
  id: string;
  provider: LLMProviderType;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  currency: string;
  timestamp: Date;
  requestId?: string;
}

export interface CostSummary {
  totalCost: number;
  byProvider: Partial<Record<LLMProviderType, number>>;
  byDay: Record<string, number>;
  currency: string;
  period: { start: Date; end: Date };
}

// ============================================
// Latency Tracking Types
// ============================================

export interface LatencyRecord {
  id: string;
  provider: LLMProviderType;
  model: string;
  latencyMs: number;
  timestamp: Date;
  success: boolean;
  region?: "cn" | "global";
}

export interface LatencyStats {
  provider: LLMProviderType;
  averageLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  totalRequests: number;
  successRate: number;
}

// ============================================
// LLM Manager Types
// ============================================

export interface LLMManagerConfig {
  providers: LLMProviderConfig[];
  defaultRoutingStrategy: RoutingStrategy;
  enableLatencyTracking: boolean;
  enableCostTracking: boolean;
  enableFallbackChain: boolean;
  fallbackChainConfig?: FallbackChainConfig;
}

export interface LLMStats {
  providers: LLMProviderStats[];
  totalCost: CostSummary;
  latencyStats: LatencyStats[];
  uptime: Record<LLMProviderType, number>; // percentage
}

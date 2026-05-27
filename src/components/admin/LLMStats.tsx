/**
 * LLM Stats Panel Component
 * Displays LLM routing statistics, costs, and latency metrics
 */

import { getCostTracker } from "@/lib/llm/cost-tracker";
import { getLatencyTracker } from "@/lib/llm/latency-tracker";
import type { CostSummary, LLMProviderStats, LLMProviderType, LatencyStats } from "@/types/llm";
import { useEffect, useState } from "react";

// ============================================
// Types
// ============================================

interface LLMStatsProps {
  refreshInterval?: number; // ms, 0 to disable
  showDetailedStats?: boolean;
  className?: string;
}

// ============================================
// Provider Display Names
// ============================================

const PROVIDER_NAMES: Record<LLMProviderType, string> = {
  qwen: "Qwen (通义千问)",
  claude: "Claude (Anthropic)",
  minimax: "MiniMax",
  gpt4o: "GPT-4o (OpenAI)",
};

const PROVIDER_COLORS: Record<LLMProviderType, string> = {
  qwen: "bg-orange-500",
  claude: "bg-purple-500",
  minimax: "bg-green-500",
  gpt4o: "bg-emerald-500",
};

// ============================================
// Component
// ============================================

export function LLMStats({
  refreshInterval = 30000,
  showDetailedStats = false,
  className = "",
}: LLMStatsProps) {
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
  const [latencyStats, setLatencyStats] = useState<LatencyStats[]>([]);
  const [providerStats, setProviderStats] = useState<LLMProviderStats[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load stats
  const loadStats = useCallback(() => {
    const costTracker = getCostTracker();
    const latencyTracker = getLatencyTracker();

    setCostSummary(costTracker.getCostSummary());
    setLatencyStats(latencyTracker.getAllStats());
    setProviderStats(costTracker.getAllProviderStats());
    setLastRefresh(new Date());
  }, []);

  // Initial load and interval
  useEffect(() => {
    loadStats();

    if (refreshInterval > 0) {
      const interval = setInterval(loadStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, loadStats]);

  // Format currency
  const formatCurrency = (amount: number, currency = "USD"): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount);
  };

  // Format latency
  const formatLatency = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Get latency color
  const getLatencyColor = (ms: number): string => {
    if (ms < 1000) return "text-green-600";
    if (ms < 3000) return "text-yellow-600";
    return "text-red-600";
  };

  // Get provider latency stats
  const getProviderLatency = (provider: LLMProviderType): LatencyStats | undefined => {
    return latencyStats.find((s) => s.provider === provider);
  };

  // Get success rate color
  const getSuccessRateColor = (rate: number): string => {
    if (rate >= 0.95) return "text-green-600";
    if (rate >= 0.8) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">LLM 路由统计</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            更新: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Total Cost Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">总成本 (USD)</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(costSummary?.totalCost || 0)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">总请求数</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {providerStats.reduce((sum, s) => sum + s.totalRequests, 0)}
            </p>
          </div>
        </div>

        {/* Provider Cards */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">提供商状态</h4>

          {(["qwen", "claude", "minimax", "gpt4o"] as LLMProviderType[]).map((provider) => {
            const stats = providerStats.find((s) => s.provider === provider);
            const latency = getProviderLatency(provider);
            const hasData = stats || latency;

            return (
              <div
                key={provider}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${hasData ? PROVIDER_COLORS[provider] : "bg-gray-400"}`}
                    />
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {PROVIDER_NAMES[provider]}
                    </span>
                  </div>
                  {latency && (
                    <span
                      className={`text-sm font-medium ${getLatencyColor(latency.averageLatencyMs)}`}
                    >
                      {formatLatency(latency.averageLatencyMs)}
                    </span>
                  )}
                </div>

                {showDetailedStats && hasData && (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">请求</p>
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        {stats?.totalRequests || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">成本</p>
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        {formatCurrency(stats?.totalCost || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">成功率</p>
                      <p
                        className={`font-medium ${getSuccessRateColor(latency?.successRate || 0)}`}
                      >
                        {latency ? `${(latency.successRate * 100).toFixed(1)}%` : "N/A"}
                      </p>
                    </div>
                  </div>
                )}

                {!hasData && <p className="text-xs text-gray-400 dark:text-gray-500">暂无数据</p>}
              </div>
            );
          })}
        </div>

        {/* Latency Comparison */}
        {latencyStats.length > 1 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">延迟对比 (P95)</h4>
            <div className="flex items-end gap-1 h-16">
              {latencyStats
                .sort((a, b) => a.p95LatencyMs - b.p95LatencyMs)
                .map((stat) => {
                  const maxLatency = Math.max(...latencyStats.map((s) => s.p95LatencyMs));
                  const height = maxLatency > 0 ? (stat.p95LatencyMs / maxLatency) * 100 : 0;

                  return (
                    <div key={stat.provider} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-t ${PROVIDER_COLORS[stat.provider]} opacity-80`}
                        style={{ height: `${Math.max(height, 4)}%` }}
                        title={`P95: ${formatLatency(stat.p95LatencyMs)}`}
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate w-full text-center">
                        {stat.provider.toUpperCase()}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Cost by Provider */}
        {costSummary && Object.keys(costSummary.byProvider).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">成本分布</h4>
            <div className="space-y-1">
              {Object.entries(costSummary.byProvider).map(([provider, cost]) => {
                const providerType = provider as LLMProviderType;
                const maxCost = Math.max(...Object.values(costSummary.byProvider).map(Number));
                const percentage = maxCost > 0 ? ((cost as number) / maxCost) * 100 : 0;

                return (
                  <div key={provider} className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-16">
                      {PROVIDER_NAMES[providerType]?.split(" ")[0] || provider}
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${PROVIDER_COLORS[providerType]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-20 text-right">
                      {formatCurrency(cost as number)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={loadStats}
          className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          刷新统计
        </button>
      </div>
    </div>
  );
}

// ============================================
// Compact Version
// ============================================

export function LLMStatsCompact({ className = "" }: { className?: string }) {
  const [stats, setStats] = useState<{
    totalCost: number;
    totalRequests: number;
    avgLatency: number;
  } | null>(null);

  useEffect(() => {
    const loadStats = () => {
      const costTracker = getCostTracker();
      const latencyTracker = getLatencyTracker();

      const providerStats = costTracker.getAllProviderStats();
      const latencyStats = latencyTracker.getAllStats();

      setStats({
        totalCost: costTracker.getTotalCost(),
        totalRequests: providerStats.reduce((sum, s) => sum + s.totalRequests, 0),
        avgLatency:
          latencyStats.length > 0
            ? latencyStats.reduce((sum, s) => sum + s.averageLatencyMs, 0) / latencyStats.length
            : 0,
      });
    };

    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  return (
    <div className={`flex items-center gap-4 text-sm ${className}`}>
      <div className="flex items-center gap-1">
        <span className="text-gray-500 dark:text-gray-400">成本:</span>
        <span className="font-medium text-gray-900 dark:text-white">
          ${stats.totalCost.toFixed(4)}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-gray-500 dark:text-gray-400">请求:</span>
        <span className="font-medium text-gray-900 dark:text-white">{stats.totalRequests}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-gray-500 dark:text-gray-400">延迟:</span>
        <span className="font-medium text-gray-900 dark:text-white">
          {stats.avgLatency > 0 ? `${Math.round(stats.avgLatency)}ms` : "N/A"}
        </span>
      </div>
    </div>
  );
}

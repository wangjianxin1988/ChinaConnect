/**
 * UsageStats Component
 * Displays monthly AI request usage with progress bar,
 * remaining count, and 7-day history chart using localStorage.
 */

import React from "react";
import { accountT, localizedHref, toAccountLang, type AccountLang } from "./account-strings";
import { getCurrentTier, TIER_LIMITS, TIER_NAMES, type SubscriptionTier } from "@/lib/subscription";
import {
  getUsageCount,
  getMaxRequests,
  getRemainingRequests,
  getUsagePercentage,
  fetchUsageFromServer,
} from "@/lib/usage-tracker";

interface DailyUsage {
  date: string; // YYYY-MM-DD
  count: number;
}

const HISTORY_KEY = "cc_usage_history";
const MONTHLY_HISTORY_KEY = "cc_monthly_usage_history";

/**
 * Load 7-day history from localStorage
 */
function loadHistory(): DailyUsage[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

/**
 * Load 7-day usage history from the server (authoritative).
 * Falls back to the local cache when offline / signed out.
 */
async function fetchDailyUsage(days = 7): Promise<DailyUsage[]> {
  try {
    const { supabase } = await import("@/supabase/config");
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return loadHistory();
    const { data, error } = await supabase.rpc("get_user_ai_usage_daily", {
      p_user_id: userData.user.id,
      p_days: days,
    });
    if (error) {
      console.warn("get_user_ai_usage_daily failed", error);
      return loadHistory();
    }
    const rows = Array.isArray(data) ? data : [];
    const list: DailyUsage[] = rows.map((r) => ({
      date: String(r.usage_date).slice(0, 10),
      count: Number(r.request_count) || 0,
    }));
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
    return list;
  } catch {
    return loadHistory();
  }
}


interface UsageStatsProps {
  language?: AccountLang | string;
}

const TIER_COLOR_MAP: Record<SubscriptionTier, string> = {
  free: "#6b7280",
  explorer: "#3b82f6",
  traveler: "#8b5cf6",
  business: "#f59e0b",
};

export const UsageStats: React.FC<UsageStatsProps> = ({ language = "en" }) => {
  const lang = toAccountLang(language);
  const [tier, setTier] = React.useState<SubscriptionTier>("free");
  const [used, setUsed] = React.useState(0);
  const [max, setMax] = React.useState(0);
  const [remaining, setRemaining] = React.useState(0);
  const [percentage, setPercentage] = React.useState(0);
  const [history, setHistory] = React.useState<DailyUsage[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const currentTier = getCurrentTier();
    setTier(currentTier);
    setUsed(getUsageCount());
    setMax(getMaxRequests());
    setRemaining(getRemainingRequests());
    setPercentage(getUsagePercentage());
    setHistory(loadHistory());

    // Pull the authoritative usage + tier + 7-day history from the server
    // once mounted so upgrades/grants are reflected immediately.
    let cancelled = false;
    fetchDailyUsage(7).then((rows) => {
      if (cancelled || !rows || rows.length === 0) return;
      setHistory(rows);
    });
    fetchUsageFromServer().then((usage) => {
      if (cancelled || !usage) return;
      setTier(usage.tier);
      setUsed(usage.count);
      setMax(usage.max);
      setRemaining(usage.max === -1 ? -1 : Math.max(0, usage.max - usage.count));
      setPercentage(usage.max === -1 ? -1 : Math.min(100, Math.round((usage.count / usage.max) * 100)));
    });

    // Listen for usage updates
    const refresh = () => {
      setTier(getCurrentTier());
      setUsed(getUsageCount());
      setRemaining(getRemainingRequests());
      setPercentage(getUsagePercentage());
      setHistory(loadHistory());
    };
    window.addEventListener("ai-usage-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      cancelled = true;
      window.removeEventListener("ai-usage-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (!mounted) return null;

  const isUnlimited = max === -1;
  const tierColor = TIER_COLOR_MAP[tier];
  const tierName = TIER_NAMES[tier][lang];
  const recentHistory = history.slice(-7);
  const maxChartValue = Math.max(...recentHistory.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {accountT(lang, "usageTitle")}
        </h2>
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: tierColor }}
        >
          {tierName}
        </span>
      </div>

      {/* Monthly Usage Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {accountT(lang, "monthRequests")}
          </h3>
          <span className="text-2xl font-bold" style={{ color: tierColor }}>
            {isUnlimited ? "∞" : `${used}`}
          </span>
        </div>

        {/* Progress Bar */}
        {!isUnlimited && (
          <>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 mb-3 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.min(100, percentage)}%`,
                  background:
                    percentage > 80
                      ? "linear-gradient(90deg, #ef4444, #dc2626)"
                      : percentage > 50
                        ? "linear-gradient(90deg, #f59e0b, #d97706)"
                        : `linear-gradient(90deg, ${tierColor}cc, ${tierColor})`,
                }}
              />
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                {accountT(lang, "usedCount", { n: used })}
              </span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {accountT(lang, "remainingCount", { n: remaining })}
                <span className="text-gray-400 dark:text-gray-500"> / {max}</span>
              </span>
            </div>
          </>
        )}

        {isUnlimited && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                  {accountT(lang, "unlimitedTitle")}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {accountT(lang, "unlimitedDesc")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Usage limit warning */}
        {!isUnlimited && percentage > 80 && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {accountT(lang, "limitWarning")}
            </p>
          </div>
        )}
      </div>

      {/* 7-Day History Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          {accountT(lang, "last7Days")}
        </h3>

        {recentHistory.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
            {accountT(lang, "noData")}
          </p>
        ) : (
          <div className="flex items-end gap-2 h-40">
            {recentHistory.map((day, i) => {
              const heightPct = maxChartValue > 0 ? (day.count / maxChartValue) * 100 : 0;
              const dayLabel = new Date(day.date).toLocaleDateString(lang, { weekday: "short" });
              const isToday = day.date === new Date().toISOString().slice(0, 10);

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 group">
                  {/* Count label on hover */}
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.count}
                  </span>

                  {/* Bar */}
                  <div className="w-full flex items-end justify-center" style={{ height: "120px" }}>
                    <div
                      className="w-full max-w-[36px] rounded-t-md transition-all duration-500 ease-out cursor-pointer group-hover:opacity-80"
                      style={{
                        height: `${Math.max(8, heightPct)}%`,
                        background: isToday
                          ? `linear-gradient(180deg, ${tierColor}, ${tierColor}99)`
                          : `linear-gradient(180deg, ${tierColor}66, ${tierColor}33)`,
                      }}
                      title={`${day.date}: ${day.count} ${accountT(lang, "requestsUnit")}`}
                    />
                  </div>

                  {/* Day label */}
                  <span
                    className={`text-[10px] font-medium ${
                      isToday
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary row */}
        <div className="flex justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="text-center flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">{accountT(lang, "total7d")}</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {recentHistory.reduce((s, d) => s + d.count, 0)}
            </p>
          </div>
          <div className="text-center flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">{accountT(lang, "dailyAvg")}</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {recentHistory.length > 0
                ? (recentHistory.reduce((s, d) => s + d.count, 0) / recentHistory.length).toFixed(1)
                : "0"}
            </p>
          </div>
          <div className="text-center flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">{accountT(lang, "peak")}</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {Math.max(...recentHistory.map((d) => d.count), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
          💡 {accountT(lang, "usageTips")}
        </h4>
        <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1.5">
          <li>• {accountT(lang, "tipPlanQuestions")}</li>
          <li>• {accountT(lang, "tipReset")}</li>
          {!isUnlimited && (
            <li>
              • {accountT(lang, "tipUpgradeBefore")}{" "}
              <a
                href={localizedHref(language, "/pricing")}
                className="underline font-medium hover:text-blue-800"
              >
                {accountT(lang, "tipUpgradeLink")}
              </a>{" "}
              {accountT(lang, "tipUpgradeAfter")}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default UsageStats;

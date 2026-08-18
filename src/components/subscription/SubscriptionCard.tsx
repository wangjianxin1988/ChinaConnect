/**
 * SubscriptionCard Component
 * Displays current subscription tier, remaining requests, and upgrade button
 */

import React from "react";
import {
  accountT,
  toAccountLang,
  type AccountLang,
  localizedHref,
} from "@/components/account/account-strings";
import { getCurrentTier, TIER_NAMES, TIER_LIMITS, type SubscriptionTier } from "@/lib/subscription";
import {
  getRemainingRequests,
  getUsageCount,
  getMaxRequests,
  getUsagePercentage,
} from "@/lib/usage-tracker";

interface SubscriptionCardProps {
  language?: AccountLang | string;
  compact?: boolean;
}

const TIER_COLORS: Record<
  SubscriptionTier,
  { bg: string; text: string; border: string; badge: string }
> = {
  free: {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    badge: "bg-gray-100 text-gray-600",
  },
  explorer: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-600",
  },
  traveler: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-600",
  },
  business: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-600",
  },
};

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  language = "en",
  compact = false,
}) => {
  const lang = toAccountLang(language);
  const tier = getCurrentTier();
  const [remaining, setRemaining] = React.useState(getRemainingRequests());
  const [used, setUsed] = React.useState(getUsageCount());
  const [max, setMax] = React.useState(getMaxRequests());
  const [percentage, setPercentage] = React.useState(getUsagePercentage());
  const colors = TIER_COLORS[tier];
  const tierName = TIER_NAMES[tier][toAccountLang(language)];

  const isUnlimited = max === -1;

  // Re-render when localStorage changes (usage increment)
  React.useEffect(() => {
    const refresh = () => {
      setRemaining(getRemainingRequests());
      setUsed(getUsageCount());
      setMax(getMaxRequests());
      setPercentage(getUsagePercentage());
    };

    // Listen for custom event dispatched by incrementUsage
    window.addEventListener("ai-usage-updated", refresh);
    // Also listen for storage events (cross-tab)
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("ai-usage-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (compact) {
    return (
      <div className={`rounded-lg ${colors.bg} border ${colors.border} p-3`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.badge}`}>
            {tierName}
          </span>
          <a
            href={localizedHref(lang, "/pricing")}
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            {accountT(lang, "upgradeShort")}
          </a>
        </div>
        <div className="text-xs text-gray-600">
          {isUnlimited ? (
            <span className="text-green-600 font-medium">{accountT(lang, "unlimitedAi")}</span>
          ) : (
            <div>
              <div className="flex justify-between mb-1">
                <span>{accountT(lang, "aiRequests")}</span>
                <span className="font-medium">
                  {remaining}/{max}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    percentage > 80
                      ? "bg-red-500"
                      : percentage > 50
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl ${colors.bg} border ${colors.border} p-5`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors.badge}`}>
            {accountT(lang, "currentPlanLabel")}
          </span>
          <h3 className={`text-lg font-bold mt-2 ${colors.text}`}>{tierName}</h3>
        </div>
        <div className="text-3xl">
          {tier === "free" && "🆓"}
          {tier === "explorer" && "🧭"}
          {tier === "traveler" && "✈️"}
          {tier === "business" && "💼"}
        </div>
      </div>

      {/* Usage Stats */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-gray-600">{accountT(lang, "monthlyAi")}</span>
          <span className={`font-semibold ${colors.text}`}>
            {isUnlimited ? accountT(lang, "unlimited") : `${used}/${max}`}
          </span>
        </div>
        {!isUnlimited && (
          <>
            <div className="w-full bg-white/60 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all ${
                  percentage > 80
                    ? "bg-red-500"
                    : percentage > 50
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }`}
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {remaining > 0
                ? accountT(lang, "remainingCount", { n: remaining })
                : accountT(lang, "limitReached")}
            </p>
          </>
        )}
      </div>

      {/* Features */}
      <div className="space-y-2 mb-4">
        {TIER_LIMITS[tier].saveItineraries && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg
              className="w-4 h-4 text-green-500"
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
            {accountT(lang, "saveItineraries")}
          </div>
        )}
        {TIER_LIMITS[tier].exportPDF && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg
              className="w-4 h-4 text-green-500"
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
            {accountT(lang, "pdfExport")}
          </div>
        )}
        {TIER_LIMITS[tier].premiumCustomization && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg
              className="w-4 h-4 text-green-500"
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
            {accountT(lang, "premiumCustomization")}
          </div>
        )}
        {TIER_LIMITS[tier].businessTemplates && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg
              className="w-4 h-4 text-green-500"
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
            {accountT(lang, "businessTemplates")}
          </div>
        )}
      </div>

      {/* Upgrade Button */}
      {tier !== "business" && (
        <a
          href={localizedHref(lang, "/pricing")}
          className="block w-full text-center py-2.5 px-4 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors"
        >
          {accountT(lang, "upgradePlan")}
        </a>
      )}
    </div>
  );
};

export default SubscriptionCard;

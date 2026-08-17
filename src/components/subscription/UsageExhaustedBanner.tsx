/**
 * UsageExhaustedBanner Component
 * Shows when user runs out of free AI requests
 * Displays upgrade options with feature highlights
 */

import React from "react";
import { accountT, toAccountLang, type AccountLang } from "@/components/account/account-strings";
import {
  getCurrentTier,
  TIER_NAMES,
  TIER_PRICING,
  TIER_FEATURES,
  type SubscriptionTier,
} from "@/lib/subscription";

interface UsageExhaustedBannerProps {
  language?: AccountLang | string;
  onDismiss?: () => void;
  className?: string;
}

export const UsageExhaustedBanner: React.FC<UsageExhaustedBannerProps> = ({
  language = "en",
  onDismiss,
  className = "",
}) => {
  const currentTier = getCurrentTier();
  const lang = toAccountLang(language);

  // Determine suggested upgrade tier
  const tierOrder: SubscriptionTier[] = ["free", "explorer", "traveler", "business"];
  const currentIndex = tierOrder.indexOf(currentTier);
  const suggestedTier = currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1] : null;

  if (!suggestedTier) return null;

  const suggestions = TIER_FEATURES[suggestedTier]?.[lang] || [];
  const pricing = TIER_PRICING[suggestedTier];
  const suggestedName = TIER_NAMES[suggestedTier][lang];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 ${className}`}
    >
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-200/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

      <div className="relative p-5">
        {/* Dismiss button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-xl">⚡</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">{accountT(lang, "exhaustedTitle")}</h3>
            <p className="text-xs text-gray-600 mt-0.5">
              {accountT(lang, "upgradeToContinue", { tier: suggestedName })}
            </p>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="flex flex-wrap gap-2 mb-4">
          {suggestions.map((s, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/70 border border-amber-200 rounded-full text-xs text-gray-700"
            >
              <svg
                className="w-3 h-3 text-amber-500"
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
              {s}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <a
            href="/pricing"
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium text-sm text-center hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm shadow-amber-200"
          >
            {accountT(lang, "upgradeCta", { tier: suggestedName, price: pricing.monthly })}
          </a>
        </div>

        {/* Fine print */}
        <p className="text-[10px] text-gray-400 text-center mt-2">
          {accountT(lang, "cancelInstant")}
        </p>
      </div>
    </div>
  );
};

export default UsageExhaustedBanner;

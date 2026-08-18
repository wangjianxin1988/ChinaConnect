/**
 * UpgradePrompt Modal Component
 * Shows when a free user tries to use a paid feature
 * Enhanced with time-limited offer, feature comparison, and better design
 */

import React from "react";
import {
  accountT,
  toAccountLang,
  type AccountLang,
  type AccountKey,
  localizedHref,
} from "@/components/account/account-strings";
import type { SubscriptionTier } from "@/lib/subscription";
import { TIER_NAMES, TIER_PRICING, TIER_LIMITS, TIER_FEATURES } from "@/lib/subscription";

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: SubscriptionTier;
  requiredTier: SubscriptionTier;
  featureName: string;
  language?: AccountLang | string;
}

const FEATURE_NAME_KEYS: Record<string, AccountKey> = {
  saveItineraries: "featSaveItineraries",
  exportPDF: "featPdfExport",
  conversationHistory: "featConversationHistory",
  aiRequests: "featAiRequests",
  premiumCustomization: "featPremiumCustomization",
  businessTemplates: "featBusinessTemplates",
};

const TIER_ICONS: Record<SubscriptionTier, string> = {
  free: "🆓",
  explorer: "🧭",
  traveler: "✈️",
  business: "💼",
};

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  isOpen,
  onClose,
  currentTier,
  requiredTier,
  featureName,
  language = "en",
}) => {
  if (!isOpen) return null;

  const lang = toAccountLang(language);
  const featureLabelKey = FEATURE_NAME_KEYS[featureName];
  const currentName = TIER_NAMES[currentTier]?.[lang] || currentTier;
  const requiredName = TIER_NAMES[requiredTier]?.[lang] || requiredTier;
  const requiredPricing = TIER_PRICING[requiredTier];
  const requiredFeatures = TIER_FEATURES[requiredTier]?.[lang] || [];

  // Calculate time-limited offer (simulated: offer expires in ~3 days)
  const offerHours = 72;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-[480px] max-w-[95vw] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 px-6 pt-6 pb-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Decorative */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

          <div className="relative text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl mb-3">
              <span className="text-3xl">{TIER_ICONS[requiredTier]}</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">
              {accountT(lang, "upgradeTo", { name: requiredName })}
            </h2>
            <p className="text-sm text-white/70">
              {accountT(lang, "unlockFeature", {
                feature: accountT(lang, featureLabelKey || "featAiRequests"),
              })}
            </p>
          </div>
        </div>

        <div className="px-6 py-5">
          {/* Time-limited offer */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl px-4 py-3 mb-5">
            <span className="text-lg">🔥</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-orange-800">{accountT(lang, "limitedOffer")}</p>
              <p className="text-[11px] text-orange-600">
                {accountT(lang, "offerFirstMonth", { h: offerHours })}
              </p>
            </div>
            <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
              -20%
            </span>
          </div>

          {/* Tier comparison */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 text-center p-3 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-xs text-gray-400 block mb-1">{accountT(lang, "current")}</span>
              <span className="text-2xl">{TIER_ICONS[currentTier]}</span>
              <span className="font-semibold text-gray-600 text-sm block mt-1">{currentName}</span>
            </div>
            <div className="flex flex-col items-center">
              <svg
                className="w-6 h-6 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
            <div className="flex-1 text-center p-3 bg-blue-50 rounded-xl border-2 border-blue-300">
              <span className="text-xs text-blue-500 block mb-1">
                {accountT(lang, "upgradeToLabel")}
              </span>
              <span className="text-2xl">{TIER_ICONS[requiredTier]}</span>
              <span className="font-bold text-blue-700 text-sm block mt-1">{requiredName}</span>
            </div>
          </div>

          {/* Feature list */}
          <div className="mb-5">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              {accountT(lang, "whatYouGet")}
            </h4>
            <div className="space-y-2">
              {requiredFeatures.slice(0, 5).map((feat, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-2xl font-bold text-gray-900">${requiredPricing.monthly}</span>
              <span className="text-sm text-gray-500">/{accountT(lang, "monthUnit")}</span>
            </div>
            <p className="text-xs text-gray-400 text-center mt-1">
              {accountT(lang, "annualPrice", {
                annual: requiredPricing.annual,
                p: Math.round((1 - requiredPricing.annual / (requiredPricing.monthly * 12)) * 100),
              })}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              {accountT(lang, "maybeLater")}
            </button>
            <a
              href={localizedHref(lang, "/pricing")}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-bold text-center shadow-lg shadow-blue-200"
            >
              {accountT(lang, "upgradeNow")}
            </a>
          </div>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              {accountT(lang, "securePayment")}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {accountT(lang, "cancelAnytime")}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              {accountT(lang, "instantAccess")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;

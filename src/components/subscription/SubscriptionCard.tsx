/**
 * SubscriptionCard Component
 * Displays current subscription tier, remaining requests, and upgrade button
 */

import React from 'react';
import { getCurrentTier, TIER_NAMES, TIER_LIMITS, type SubscriptionTier } from '@/lib/subscription';
import { getRemainingRequests, getUsageCount, getMaxRequests, getUsagePercentage } from '@/lib/usage-tracker';

interface SubscriptionCardProps {
  language?: 'en' | 'zh';
  compact?: boolean;
}

const TIER_COLORS: Record<SubscriptionTier, { bg: string; text: string; border: string; badge: string }> = {
  free: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-600' },
  explorer: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-600' },
  traveler: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-600' },
  business: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-600' },
};

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ language = 'en', compact = false }) => {
  const tier = getCurrentTier();
  const [remaining, setRemaining] = React.useState(getRemainingRequests());
  const [used, setUsed] = React.useState(getUsageCount());
  const [max, setMax] = React.useState(getMaxRequests());
  const [percentage, setPercentage] = React.useState(getUsagePercentage());
  const colors = TIER_COLORS[tier];
  const tierName = TIER_NAMES[tier][language];

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
    window.addEventListener('ai-usage-updated', refresh);
    // Also listen for storage events (cross-tab)
    window.addEventListener('storage', refresh);

    return () => {
      window.removeEventListener('ai-usage-updated', refresh);
      window.removeEventListener('storage', refresh);
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
            href="/pricing"
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            {language === 'zh' ? '升级' : 'Upgrade'}
          </a>
        </div>
        <div className="text-xs text-gray-600">
          {isUnlimited ? (
            <span className="text-green-600 font-medium">
              {language === 'zh' ? '✦ 无限AI请求' : '✦ Unlimited AI requests'}
            </span>
          ) : (
            <div>
              <div className="flex justify-between mb-1">
                <span>{language === 'zh' ? 'AI请求' : 'AI Requests'}</span>
                <span className="font-medium">{remaining}/{max}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    percentage > 80 ? 'bg-red-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
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
            {language === 'zh' ? '当前套餐' : 'Current Plan'}
          </span>
          <h3 className={`text-lg font-bold mt-2 ${colors.text}`}>{tierName}</h3>
        </div>
        <div className="text-3xl">
          {tier === 'free' && '🆓'}
          {tier === 'explorer' && '🧭'}
          {tier === 'traveler' && '✈️'}
          {tier === 'business' && '💼'}
        </div>
      </div>

      {/* Usage Stats */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-gray-600">
            {language === 'zh' ? '本月AI请求' : 'AI Requests This Month'}
          </span>
          <span className={`font-semibold ${colors.text}`}>
            {isUnlimited
              ? (language === 'zh' ? '无限' : 'Unlimited')
              : `${used}/${max}`}
          </span>
        </div>
        {!isUnlimited && (
          <>
            <div className="w-full bg-white/60 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all ${
                  percentage > 80 ? 'bg-red-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {remaining > 0
                ? language === 'zh'
                  ? `剩余 ${remaining} 次`
                  : `${remaining} remaining`
                : language === 'zh'
                  ? '已达上限'
                  : 'Limit reached'}
            </p>
          </>
        )}
      </div>

      {/* Features */}
      <div className="space-y-2 mb-4">
        {TIER_LIMITS[tier].saveItineraries && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {language === 'zh' ? '保存行程' : 'Save itineraries'}
          </div>
        )}
        {TIER_LIMITS[tier].exportPDF && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {language === 'zh' ? 'PDF导出' : 'PDF export'}
          </div>
        )}
        {TIER_LIMITS[tier].premiumCustomization && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {language === 'zh' ? '高级自定义' : 'Premium customization'}
          </div>
        )}
        {TIER_LIMITS[tier].businessTemplates && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {language === 'zh' ? '商务模板' : 'Business templates'}
          </div>
        )}
      </div>

      {/* Upgrade Button */}
      {tier !== 'business' && (
        <a
          href="/pricing"
          className="block w-full text-center py-2.5 px-4 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors"
        >
          {language === 'zh' ? '升级套餐' : 'Upgrade Plan'}
        </a>
      )}
    </div>
  );
};

export default SubscriptionCard;

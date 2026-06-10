/**
 * MembershipStatusBar Component
 * Compact inline status bar showing current tier, usage, and quick upgrade button
 * Designed to fit naturally in the AI chat header
 */

import React from 'react';
import { getCurrentTier, TIER_NAMES, type SubscriptionTier } from '@/lib/subscription';
import { getRemainingRequests, getUsageCount, getMaxRequests, getUsagePercentage } from '@/lib/usage-tracker';

interface MembershipStatusBarProps {
  language?: 'en' | 'zh';
}

const TIER_STYLES: Record<SubscriptionTier, { bg: string; text: string; dot: string; badge: string }> = {
  free: {
    bg: 'bg-gray-50 border-gray-200',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
    badge: 'bg-gray-100 text-gray-600',
  },
  explorer: {
    bg: 'bg-blue-50/80 border-blue-200',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700',
  },
  traveler: {
    bg: 'bg-purple-50/80 border-purple-200',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
    badge: 'bg-purple-100 text-purple-700',
  },
  business: {
    bg: 'bg-amber-50/80 border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700',
  },
};

const TIER_ICONS: Record<SubscriptionTier, string> = {
  free: '🆓',
  explorer: '🧭',
  traveler: '✈️',
  business: '💼',
};

export const MembershipStatusBar: React.FC<MembershipStatusBarProps> = ({ language = 'en' }) => {
  const tier = getCurrentTier();
  const [remaining, setRemaining] = React.useState(getRemainingRequests());
  const [used, setUsed] = React.useState(getUsageCount());
  const [max, setMax] = React.useState(getMaxRequests());
  const [percentage, setPercentage] = React.useState(getUsagePercentage());

  const styles = TIER_STYLES[tier];
  const tierName = TIER_NAMES[tier][language];
  const isUnlimited = max === -1;
  const isZh = language === 'zh';

  React.useEffect(() => {
    const refresh = () => {
      setRemaining(getRemainingRequests());
      setUsed(getUsageCount());
      setMax(getMaxRequests());
      setPercentage(getUsagePercentage());
    };
    window.addEventListener('ai-usage-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('ai-usage-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const isLow = !isUnlimited && percentage >= 70;
  const isCritical = !isUnlimited && percentage >= 90;

  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${styles.bg} transition-all`}>
      {/* Tier Badge */}
      <div className="flex items-center gap-1.5">
        <span className="text-base">{TIER_ICONS[tier]}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles.badge}`}>
          {tierName}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-200" />

      {/* Usage */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {isUnlimited ? (
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            {isZh ? '无限请求' : 'Unlimited'}
          </span>
        ) : (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex-1 min-w-[60px]">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    isCritical ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>
            </div>
            <span className={`text-xs font-medium whitespace-nowrap ${
              isCritical ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-gray-500'
            }`}>
              {remaining}/{max}
            </span>
          </div>
        )}
      </div>

      {/* Upgrade Button (hide for business tier) */}
      {tier !== 'business' && (
        <a
          href="/pricing"
          className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
        >
          {isZh ? '升级' : 'Upgrade'}
        </a>
      )}
    </div>
  );
};

export default MembershipStatusBar;

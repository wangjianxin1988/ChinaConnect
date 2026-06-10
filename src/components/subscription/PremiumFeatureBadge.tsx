/**
 * PremiumFeatureBadge Component
 * Small badge to mark features that require paid subscription
 * Shows lock icon and required tier
 */

import React from 'react';
import { TIER_NAMES, type SubscriptionTier } from '@/lib/subscription';

interface PremiumFeatureBadgeProps {
  requiredTier: SubscriptionTier;
  language?: 'en' | 'zh';
  size?: 'sm' | 'xs';
  onClick?: () => void;
}

const TIER_COLORS: Record<SubscriptionTier, string> = {
  free: 'bg-gray-100 text-gray-500 border-gray-200',
  explorer: 'bg-blue-50 text-blue-600 border-blue-200',
  traveler: 'bg-purple-50 text-purple-600 border-purple-200',
  business: 'bg-amber-50 text-amber-600 border-amber-200',
};

export const PremiumFeatureBadge: React.FC<PremiumFeatureBadgeProps> = ({
  requiredTier,
  language = 'en',
  size = 'xs',
  onClick,
}) => {
  if (requiredTier === 'free') return null;

  const tierName = TIER_NAMES[requiredTier][language];
  const colorClasses = TIER_COLORS[requiredTier];
  const isZh = language === 'zh';
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-[10px] px-1.5 py-0.5';

  const Wrapper = onClick ? 'button' : 'span';

  return (
    <Wrapper
      {...(onClick ? { onClick } : {})}
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${colorClasses} ${sizeClasses} ${
        onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
      }`}
    >
      <svg className={size === 'sm' ? 'w-3 h-3' : 'w-2.5 h-2.5'} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
      {isZh ? `${tierName}` : tierName}
    </Wrapper>
  );
};

export default PremiumFeatureBadge;

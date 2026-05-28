/**
 * Subscription Tier Definitions
 * Defines limits and pricing for each subscription tier
 */

export type SubscriptionTier = 'free' | 'explorer' | 'traveler' | 'business';

export interface SubscriptionLimits {
  aiRequestsPerMonth: number; // -1 means unlimited
  saveItineraries: boolean;
  exportPDF: boolean;
  premiumCustomization: boolean;
  businessTemplates: boolean;
}

export const TIER_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    aiRequestsPerMonth: 3,
    saveItineraries: false,
    exportPDF: false,
    premiumCustomization: false,
    businessTemplates: false,
  },
  explorer: {
    aiRequestsPerMonth: 15,
    saveItineraries: true,
    exportPDF: false,
    premiumCustomization: false,
    businessTemplates: false,
  },
  traveler: {
    aiRequestsPerMonth: -1, // unlimited
    saveItineraries: true,
    exportPDF: true,
    premiumCustomization: true,
    businessTemplates: false,
  },
  business: {
    aiRequestsPerMonth: -1, // unlimited
    saveItineraries: true,
    exportPDF: true,
    premiumCustomization: true,
    businessTemplates: true,
  },
};

export const TIER_PRICING: Record<SubscriptionTier, { monthly: number; annual: number }> = {
  free: { monthly: 0, annual: 0 },
  explorer: { monthly: 4.99, annual: 47.99 },
  traveler: { monthly: 9.99, annual: 95.99 },
  business: { monthly: 19.99, annual: 191.99 },
};

export const TIER_NAMES: Record<SubscriptionTier, { en: string; zh: string }> = {
  free: { en: 'Free', zh: '免费版' },
  explorer: { en: 'Explorer', zh: '探索版' },
  traveler: { en: 'Traveler', zh: '旅行版' },
  business: { en: 'Business', zh: '商务版' },
};

export const TIER_DESCRIPTIONS: Record<SubscriptionTier, { en: string; zh: string }> = {
  free: {
    en: 'Get started with basic AI travel planning',
    zh: '开始体验基础AI旅行规划',
  },
  explorer: {
    en: 'More requests and save your itineraries',
    zh: '更多请求次数并保存行程',
  },
  traveler: {
    en: 'Unlimited AI with premium features',
    zh: '无限AI请求及高级功能',
  },
  business: {
    en: 'Full access for travel professionals',
    zh: '旅行专业人士的完整功能',
  },
};

export const TIER_FEATURES: Record<SubscriptionTier, { en: string[]; zh: string[] }> = {
  free: {
    en: ['3 AI requests per month', 'Basic travel planning', 'View itineraries'],
    zh: ['每月3次AI请求', '基础旅行规划', '查看行程'],
  },
  explorer: {
    en: ['15 AI requests per month', 'Save itineraries', 'Conversation history', 'Priority support'],
    zh: ['每月15次AI请求', '保存行程', '对话历史', '优先支持'],
  },
  traveler: {
    en: [
      'Unlimited AI requests',
      'Save & export itineraries',
      'PDF export',
      'Premium customization',
      'Advanced travel tools',
    ],
    zh: ['无限AI请求', '保存和导出行程', 'PDF导出', '高级自定义', '高级旅行工具'],
  },
  business: {
    en: [
      'Unlimited AI requests',
      'All Traveler features',
      'Business templates',
      'Team collaboration',
      'API access',
      'Dedicated support',
    ],
    zh: ['无限AI请求', '所有旅行版功能', '商务模板', '团队协作', 'API访问', '专属支持'],
  },
};

/**
 * Get the current subscription tier from localStorage
 */
export function getCurrentTier(): SubscriptionTier {
  if (typeof window === 'undefined') return 'free';
  const tier = localStorage.getItem('subscription_tier') as SubscriptionTier;
  return tier && tier in TIER_LIMITS ? tier : 'free';
}

/**
 * Set the current subscription tier in localStorage
 */
export function setCurrentTier(tier: SubscriptionTier): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('subscription_tier', tier);
}

/**
 * Get limits for the current tier
 */
export function getCurrentLimits(): SubscriptionLimits {
  return TIER_LIMITS[getCurrentTier()];
}

/**
 * PlanComparison Component
 * Compares the current plan with available upgrades,
 * showing feature differences for each tier.
 */

import React from 'react';
import {
  getCurrentTier,
  TIER_LIMITS,
  TIER_NAMES,
  TIER_PRICING,
  TIER_DESCRIPTIONS,
  TIER_FEATURES,
  type SubscriptionTier,
} from '@/lib/subscription';

interface PlanComparisonProps {
  language?: 'en' | 'zh';
}

const TIER_ORDER: SubscriptionTier[] = [
  'free',
  'explorer',
  'traveler',
  'business',
];

const TIER_GRADIENTS: Record<SubscriptionTier, string> = {
  free: 'from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750',
  explorer: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
  traveler:
    'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
  business:
    'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
};

const TIER_ICON_BG: Record<SubscriptionTier, string> = {
  free: 'bg-gray-200 dark:bg-gray-700',
  explorer: 'bg-blue-100 dark:bg-blue-800',
  traveler: 'bg-purple-100 dark:bg-purple-800',
  business: 'bg-amber-100 dark:bg-amber-800',
};

const TIER_ICON: Record<SubscriptionTier, string> = {
  free: '🆓',
  explorer: '🧭',
  traveler: '✈️',
  business: '💼',
};

const TIER_BTN_COLORS: Record<SubscriptionTier, string> = {
  free: 'bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600',
  explorer: 'bg-blue-600 hover:bg-blue-700',
  traveler: 'bg-purple-600 hover:bg-purple-700',
  business: 'bg-amber-600 hover:bg-amber-700',
};

// All features for the comparison matrix
interface FeatureRow {
  key: string;
  label: { en: string; zh: string };
  tiers: Record<SubscriptionTier, string | boolean>;
}

const FEATURE_MATRIX: FeatureRow[] = [
  {
    key: 'ai_requests',
    label: { en: 'AI Requests / Month', zh: '每月AI请求次数' },
    tiers: { free: '5', explorer: '20', traveler: '40', business: '∞' },
  },
  {
    key: 'save_itineraries',
    label: { en: 'Save Itineraries', zh: '保存行程' },
    tiers: { free: false, explorer: true, traveler: true, business: true },
  },
  {
    key: 'conversation_history',
    label: { en: 'Conversation History', zh: '对话历史' },
    tiers: { free: false, explorer: true, traveler: true, business: true },
  },
  {
    key: 'pdf_export',
    label: { en: 'PDF Export', zh: 'PDF导出' },
    tiers: { free: false, explorer: false, traveler: true, business: true },
  },
  {
    key: 'premium_custom',
    label: { en: 'Premium Customization', zh: '高级自定义' },
    tiers: { free: false, explorer: false, traveler: true, business: true },
  },
  {
    key: 'biz_templates',
    label: { en: 'Business Templates', zh: '商务模板' },
    tiers: { free: false, explorer: false, traveler: false, business: true },
  },
  {
    key: 'team_collab',
    label: { en: 'Team Collaboration', zh: '团队协作' },
    tiers: { free: false, explorer: false, traveler: false, business: true },
  },
  {
    key: 'api_access',
    label: { en: 'API Access', zh: 'API访问' },
    tiers: { free: false, explorer: false, traveler: false, business: true },
  },
  {
    key: 'priority_support',
    label: { en: 'Priority Support', zh: '优先支持' },
    tiers: { free: false, explorer: true, traveler: true, business: true },
  },
  {
    key: 'dedicated_support',
    label: { en: 'Dedicated Support', zh: '专属支持' },
    tiers: { free: false, explorer: false, traveler: false, business: true },
  },
];

function renderCellValue(value: string | boolean): React.ReactNode {
  if (typeof value === 'boolean') {
    return value ? (
      <svg
        className="w-5 h-5 text-green-500 mx-auto"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M5 13l4 4L19 7"
        />
      </svg>
    ) : (
      <svg
        className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    );
  }
  return (
    <span className="text-sm font-semibold text-gray-900 dark:text-white">
      {value}
    </span>
  );
}

export const PlanComparison: React.FC<PlanComparisonProps> = ({
  language = 'en',
}) => {
  const isZh = language === 'zh';
  const [currentTier, setCurrentTierState] =
    React.useState<SubscriptionTier>('free');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setCurrentTierState(getCurrentTier());
  }, []);

  if (!mounted) return null;

  const currentTierIndex = TIER_ORDER.indexOf(currentTier);
  const availableUpgrades = TIER_ORDER.filter(
    (_, i) => i > currentTierIndex
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {isZh ? '套餐对比' : 'Plan Comparison'}
        </h2>
        <a
          href="/pricing"
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium hover:underline"
        >
          {isZh ? '查看完整定价' : 'View Full Pricing'} →
        </a>
      </div>

      {/* Current Plan Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-5">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${TIER_ICON_BG[currentTier]}`}
          >
            {TIER_ICON[currentTier]}
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              {isZh ? '当前套餐' : 'Current Plan'}
            </p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {TIER_NAMES[currentTier][language]}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {TIER_DESCRIPTIONS[currentTier][language]}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${TIER_PRICING[currentTier].monthly.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isZh ? '/月' : '/month'}
            </p>
          </div>
        </div>
      </div>

      {/* Available Upgrades */}
      {availableUpgrades.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {isZh ? '可升级套餐' : 'Available Upgrades'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableUpgrades.map((tier) => (
              <div
                key={tier}
                className={`bg-gradient-to-br ${TIER_GRADIENTS[tier]} rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${TIER_ICON_BG[tier]}`}
                  >
                    {TIER_ICON[tier]}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {TIER_NAMES[tier][language]}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ${TIER_PRICING[tier].monthly.toFixed(2)}
                      {isZh ? '/月' : '/mo'}
                    </p>
                  </div>
                </div>

                {/* Key features */}
                <ul className="space-y-1.5 mb-4 flex-1">
                  {TIER_FEATURES[tier][language].slice(0, 4).map((f, i) => (
                    <li
                      key={i}
                      className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2"
                    >
                      <svg
                        className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5"
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
                      {f}
                    </li>
                  ))}
                </ul>

                {/* What you gain vs current */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mb-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                    {isZh ? '相比当前套餐增加：' : 'Upgrade gains:'}
                  </p>
                  {FEATURE_MATRIX.filter((f) => {
                    const currentVal = f.tiers[currentTier];
                    const upgradeVal = f.tiers[tier];
                    return currentVal !== upgradeVal;
                  })
                    .slice(0, 3)
                    .map((f) => (
                      <div
                        key={f.key}
                        className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mb-1"
                      >
                        <span>+ {f.label[language]}</span>
                      </div>
                    ))}
                </div>

                <a
                  href="/pricing"
                  className={`block w-full text-center py-2.5 px-4 rounded-lg text-white text-sm font-medium transition-colors ${TIER_BTN_COLORS[tier]}`}
                >
                  {isZh ? '升级到此套餐' : 'Upgrade to {name}'.replace('{name}', TIER_NAMES[tier][language])}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {availableUpgrades.length === 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center">
          <div className="text-3xl mb-2">👑</div>
          <h3 className="text-lg font-bold text-amber-700 dark:text-amber-300">
            {isZh ? '您已拥有最高套餐！' : "You're on the highest plan!"}
          </h3>
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
            {isZh
              ? '您已享受所有功能。需要团队方案请联系客服。'
              : 'Enjoy all features. Contact support for team plans.'}
          </p>
        </div>
      )}

      {/* Full Feature Comparison Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {isZh ? '功能对比详情' : 'Detailed Feature Comparison'}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-750">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[180px]">
                  {isZh ? '功能' : 'Feature'}
                </th>
                {TIER_ORDER.map((tier) => (
                  <th
                    key={tier}
                    className={`text-center px-4 py-3 text-xs font-medium uppercase tracking-wider min-w-[100px] ${
                      tier === currentTier
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-base">{TIER_ICON[tier]}</span>
                      <span>{TIER_NAMES[tier][language]}</span>
                      {tier === currentTier && (
                        <span className="inline-block px-1.5 py-0.5 rounded-full text-[9px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold normal-case">
                          {isZh ? '当前' : 'Current'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {/* Pricing row */}
              <tr className="bg-gray-50/50 dark:bg-gray-750/50">
                <td className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300">
                  {isZh ? '月费' : 'Monthly Price'}
                </td>
                {TIER_ORDER.map((tier) => (
                  <td
                    key={tier}
                    className={`text-center px-4 py-3 ${
                      tier === currentTier
                        ? 'bg-blue-50/50 dark:bg-blue-900/10'
                        : ''
                    }`}
                  >
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      ${TIER_PRICING[tier].monthly.toFixed(2)}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Feature rows */}
              {FEATURE_MATRIX.map((feature) => (
                <tr
                  key={feature.key}
                  className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <td className="px-6 py-3 text-gray-700 dark:text-gray-300">
                    {feature.label[language]}
                  </td>
                  {TIER_ORDER.map((tier) => (
                    <td
                      key={tier}
                      className={`text-center px-4 py-3 ${
                        tier === currentTier
                          ? 'bg-blue-50/50 dark:bg-blue-900/10'
                          : ''
                      }`}
                    >
                      {renderCellValue(feature.tiers[tier])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlanComparison;

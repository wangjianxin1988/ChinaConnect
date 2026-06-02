/**
 * UpgradePrompt Modal Component
 * Shows when a free user tries to use a paid feature
 */

import React from 'react';
import type { SubscriptionTier } from '@/lib/subscription';
import { TIER_NAMES } from '@/lib/subscription';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: SubscriptionTier;
  requiredTier: SubscriptionTier;
  featureName: string;
  language?: 'en' | 'zh';
}

const FEATURE_NAMES: Record<string, { en: string; zh: string }> = {
  saveItineraries: { en: 'Save Itineraries', zh: '保存行程' },
  exportPDF: { en: 'PDF Export', zh: 'PDF导出' },
  conversationHistory: { en: 'Conversation History', zh: '对话历史' },
  aiRequests: { en: 'AI Requests', zh: 'AI请求次数' },
};

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  isOpen,
  onClose,
  currentTier,
  requiredTier,
  featureName,
  language = 'en',
}) => {
  if (!isOpen) return null;

  const isZh = language === 'zh';
  const feature = FEATURE_NAMES[featureName] || { en: featureName, zh: featureName };
  const currentName = TIER_NAMES[currentTier]?.[language] || currentTier;
  const requiredName = TIER_NAMES[requiredTier]?.[language] || requiredTier;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-[420px] max-w-[90vw] shadow-2xl mx-4"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
          {isZh ? '升级以解锁功能' : 'Upgrade to Unlock'}
        </h3>

        {/* Message */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 mb-3">
            {isZh ? (
              <>
                <strong>{feature.zh}</strong> 需要 <strong>{requiredName}</strong> 或更高套餐。
                <br />
                您当前使用的是 <strong>{currentName}</strong>。
              </>
            ) : (
              <>
                <strong>{feature.en}</strong> requires <strong>{requiredName}</strong> or higher.
                <br />
                You are currently on the <strong>{currentName}</strong> plan.
              </>
            )}
          </p>
        </div>

        {/* Tier comparison */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <span className="text-xs text-gray-500 block mb-1">
                {isZh ? '当前套餐' : 'Current'}
              </span>
              <span className="font-semibold text-gray-700 text-sm">{currentName}</span>
            </div>
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <div className="text-center">
              <span className="text-xs text-gray-500 block mb-1">
                {isZh ? '需要' : 'Required'}
              </span>
              <span className="font-semibold text-blue-600 text-sm">{requiredName}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            {isZh ? '稍后再说' : 'Maybe Later'}
          </button>
          <a
            href="/pricing"
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium text-center"
          >
            {isZh ? '立即升级' : 'Upgrade Now'}
          </a>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;

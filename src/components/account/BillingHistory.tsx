/**
 * BillingHistory Component
 * Displays subscription history, payment records, and invoice download links.
 * Uses localStorage for demo data.
 */

import React from 'react';
import {
  getCurrentTier,
  TIER_NAMES,
  TIER_PRICING,
  type SubscriptionTier,
} from '@/lib/subscription';

interface BillingRecord {
  id: string;
  date: string;
  plan: SubscriptionTier;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  invoiceNumber: string;
  billingPeriod: string;
  paymentMethod: string;
}

const BILLING_KEY = 'cc_billing_history';

/**
 * Generate demo billing data for the current tier
 */
function loadBillingData(): BillingRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(BILLING_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}

  const tier = getCurrentTier();
  if (tier === 'free') return [];

  const pricing = TIER_PRICING[tier];
  const now = new Date();
  const records: BillingRecord[] = [];

  for (let i = 0; i < 3; i++) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const periodStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const periodEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    records.push({
      id: `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-CC`,
      date: date.toISOString().slice(0, 10),
      plan: tier,
      amount: pricing.monthly,
      status: i === 0 ? 'paid' : 'paid',
      invoiceNumber: `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-CC`,
      billingPeriod: `${periodStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${periodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      paymentMethod: '•••• 4242',
    });
  }

  localStorage.setItem(BILLING_KEY, JSON.stringify(records));
  return records;
}

interface BillingHistoryProps {
  language?: 'en' | 'zh';
}

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  refunded:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const STATUS_LABELS: Record<string, { en: string; zh: string }> = {
  paid: { en: 'Paid', zh: '已付款' },
  pending: { en: 'Pending', zh: '待付款' },
  failed: { en: 'Failed', zh: '失败' },
  refunded: { en: 'Refunded', zh: '已退款' },
};

export const BillingHistory: React.FC<BillingHistoryProps> = ({
  language = 'en',
}) => {
  const isZh = language === 'zh';
  const [records, setRecords] = React.useState<BillingRecord[]>([]);
  const [currentTier, setCurrentTierState] =
    React.useState<SubscriptionTier>('free');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setCurrentTierState(getCurrentTier());
    setRecords(loadBillingData());
  }, []);

  if (!mounted) return null;

  const isFree = currentTier === 'free';
  const tierName = TIER_NAMES[currentTier][language];
  const pricing = TIER_PRICING[currentTier];

  const handleDownloadInvoice = (invoiceNumber: string) => {
    // Generate a simple PDF-like text receipt
    const record = records.find((r) => r.invoiceNumber === invoiceNumber);
    if (!record) return;

    const content = [
      '═══════════════════════════════════════',
      '         ChinaConnect Invoice',
      '═══════════════════════════════════════',
      '',
      `Invoice Number: ${record.invoiceNumber}`,
      `Date: ${record.date}`,
      `Billing Period: ${record.billingPeriod}`,
      '',
      `Plan: ${TIER_NAMES[record.plan].en}`,
      `Amount: $${record.amount.toFixed(2)} USD`,
      `Status: ${STATUS_LABELS[record.status].en}`,
      `Payment Method: ${record.paymentMethod}`,
      '',
      '───────────────────────────────────────',
      'Thank you for your subscription!',
      'support@chinaconnect.app',
      '═══════════════════════════════════════',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoiceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        {isZh ? '账单历史' : 'Billing History'}
      </h2>

      {/* Current Subscription Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              {isZh ? '当前订阅' : 'Current Subscription'}
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {tierName}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              ${pricing.monthly.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isZh ? '/月' : '/month'}
            </p>
          </div>
        </div>
        {!isFree && (
          <div className="flex items-center justify-between text-sm pt-4 border-t border-blue-200 dark:border-blue-700">
            <span className="text-gray-600 dark:text-gray-400">
              {isZh ? '下次扣款日' : 'Next billing date'}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {new Date(
                new Date().setMonth(new Date().getMonth() + 1, 1)
              ).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        )}
        {isFree && (
          <div className="pt-4 border-t border-blue-200 dark:border-blue-700">
            <a
              href="/pricing"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              {isZh ? '升级到付费套餐' : 'Upgrade to a paid plan'} →
            </a>
          </div>
        )}
      </div>

      {/* Payment Records */}
      {records.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {isZh ? '付款记录' : 'Payment Records'}
            </h3>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-750">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {isZh ? '日期' : 'Date'}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {isZh ? '套餐' : 'Plan'}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {isZh ? '账单周期' : 'Billing Period'}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {isZh ? '金额' : 'Amount'}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {isZh ? '状态' : 'Status'}
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {isZh ? '发票' : 'Invoice'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      {new Date(record.date).toLocaleDateString(
                        language === 'zh' ? 'zh-CN' : 'en-US',
                        { year: 'numeric', month: 'short', day: 'numeric' }
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {TIER_NAMES[record.plan][language]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                      {record.billingPeriod}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      ${record.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[record.status]}`}
                      >
                        {STATUS_LABELS[record.status][language]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() =>
                          handleDownloadInvoice(record.invoiceNumber)
                        }
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-medium hover:underline flex items-center gap-1 ml-auto"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        {record.invoiceNumber}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
            {records.map((record) => (
              <div key={record.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {TIER_NAMES[record.plan][language]}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[record.status]}`}
                  >
                    {STATUS_LABELS[record.status][language]}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    {new Date(record.date).toLocaleDateString(
                      language === 'zh' ? 'zh-CN' : 'en-US',
                      { year: 'numeric', month: 'short', day: 'numeric' }
                    )}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${record.amount.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() =>
                    handleDownloadInvoice(record.invoiceNumber)
                  }
                  className="text-blue-600 dark:text-blue-400 text-xs font-medium hover:underline flex items-center gap-1"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  {isZh ? '下载发票' : 'Download Invoice'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-10 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            {isZh ? '暂无账单记录' : 'No Billing Records'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            {isZh
              ? '您当前使用的是免费套餐。升级到付费套餐后，账单记录将显示在这里。'
              : "You're on the free plan. Billing records will appear here after you upgrade to a paid plan."}
          </p>
          <a
            href="/pricing"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isZh ? '查看套餐' : 'View Plans'}
          </a>
        </div>
      )}
    </div>
  );
};

export default BillingHistory;

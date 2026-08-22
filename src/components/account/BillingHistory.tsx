/**
 * BillingHistory Component
 * Displays real subscription orders from Supabase, the next charge date
 * (started_at + 1 month/1 year from the membership record) and generates
 * real invoice PDFs (order number / amount / user email) via jsPDF.
 */

import React from "react";
import {
  accountT,
  localizedHref,
  toAccountLang,
  type AccountLang,
  type AccountKey,
} from "./account-strings";
import {
  getCurrentTier,
  TIER_NAMES,
  type SubscriptionTier,
} from "@/lib/subscription";
import { getCurrentUser, getUserOrders } from "@/lib/auth/supabase-auth";
import { supabase } from "@/supabase/config";

interface BillingRecord {
  id: string;
  orderNumber: string;
  date: string;
  plan: SubscriptionTier;
  planName: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed" | "refunded";
  invoiceNumber: string;
  billingPeriod: string;
  paymentMethod: string;
  billingCycle?: string | null;
}

interface MembershipInfo {
  tier: SubscriptionTier;
  tierName: string;
  nextChargeAt: string | null;
  billingCycle: string | null;
}

function mapDbTierToLocal(dbSlug: string): SubscriptionTier {
  const mapping: Record<string, SubscriptionTier> = {
    free: "free",
    explorer: "explorer",
    traveler: "traveler",
    business: "business",
    pro: "traveler",
    enterprise: "business",
  };
  return mapping[dbSlug] || "free";
}

function mapOrderStatus(status: string): BillingRecord["status"] {
  if (status === "paid" || status === "completed") return "paid";
  if (status === "pending" || status === "processing") return "pending";
  if (status === "failed" || status === "cancelled") return "failed";
  if (status === "refunded" || status === "partially_refunded") return "refunded";
  return "paid";
}

function formatBillingPeriod(dateStr: string, cycle: string | undefined, lang: string): string {
  const d = new Date(dateStr);
  if (!cycle || cycle === "lifetime") {
    return new Date(d).toLocaleDateString(lang, { year: "numeric", month: "short", day: "numeric" });
  }
  const end = new Date(d);
  if (cycle === "yearly") end.setFullYear(end.getFullYear() + 1);
  else end.setMonth(end.getMonth() + 1);
  return `${new Date(d).toLocaleDateString(lang, { month: "short", day: "numeric" })} - ${end.toLocaleDateString(lang, { month: "short", day: "numeric", year: "numeric" })}`;
}

async function loadRealBilling(): Promise<{ records: BillingRecord[]; membership: MembershipInfo | null }> {
  const user = await getCurrentUser();
  if (!user) return { records: [], membership: null };

  let membership: MembershipInfo | null = null;
  try {
    const { data, error } = await supabase.rpc("get_user_membership", { p_user_id: user.id });
    if (!error) {
      const row = Array.isArray(data) ? data[0] : data;
      if (row) {
        const tier = mapDbTierToLocal(row.tier_slug || "free");
        membership = {
          tier,
          tierName: row.tier_name || TIER_NAMES[tier].en,
          nextChargeAt: row.next_charge_at || null,
          billingCycle: row.billing_cycle || null,
        };
      }
    }
  } catch {
    // fall through — membership UI still works with local tier
  }

  const { orders } = await getUserOrders(user.id, 20);
  if (!orders || orders.length === 0) return { records: [], membership };

  const records: BillingRecord[] = orders
    .filter((o) => o.status === "paid" || o.status === "completed" || o.status === "pending" || o.status === "failed" || o.status === "refunded")
    .map((o) => {
      const tierInfo = (o as unknown as { membership_tiers?: { slug?: string; name?: string } }).membership_tiers;
      const planSlug = tierInfo?.slug || "business";
      const plan = mapDbTierToLocal(planSlug);
      const cycle = o.billing_cycle || undefined;
      return {
        id: o.id,
        orderNumber: o.order_number || o.id.slice(0, 8).toUpperCase(),
        date: o.paid_at || o.created_at || new Date().toISOString(),
        plan,
        planName: tierInfo?.name || TIER_NAMES[plan].en,
        amount: Number(o.final_amount ?? o.amount ?? 0),
        currency: o.currency || "CNY",
        status: mapOrderStatus(o.status || ""),
        invoiceNumber: "INV-" + (o.order_number || o.id.slice(0, 8)).toUpperCase(),
        billingPeriod: formatBillingPeriod(o.paid_at || o.created_at, cycle, toAccountLang("en")),
        paymentMethod: o.payment_method || o.payment_provider || "Online",
        billingCycle: cycle || null,
      };
    });

  return { records, membership };
}

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  refunded: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const STATUS_KEYS: Record<BillingRecord["status"], AccountKey> = {
  paid: "statusPaid",
  pending: "statusPending",
  failed: "statusFailed",
  refunded: "statusRefunded",
};

function statusLabel(lang: AccountLang, status: BillingRecord["status"]): string {
  return accountT(lang, STATUS_KEYS[status]);
}

export const BillingHistory: React.FC<{ language?: AccountLang | string }> = ({ language = "en" }) => {
  const lang = toAccountLang(language);
  const [records, setRecords] = React.useState<BillingRecord[]>([]);
  const [membership, setMembership] = React.useState<MembershipInfo | null>(null);
  const [currentTier, setCurrentTierState] = React.useState<SubscriptionTier>("free");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setCurrentTierState(getCurrentTier());
    let cancelled = false;
    loadRealBilling().then(({ records: recs, membership: mem }) => {
      if (cancelled) return;
      setRecords(recs);
      if (mem) setMembership(mem);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!mounted) return null;

  const effectiveTier = membership?.tier || currentTier;
  const isFree = effectiveTier === "free";
  const tierName = membership?.tierName || TIER_NAMES[effectiveTier][lang];

  const handleDownloadInvoice = async (invoiceNumber: string) => {
    const record = records.find((r) => r.invoiceNumber === invoiceNumber);
    if (!record) return;
    const user = await getCurrentUser();
    const email = user?.email || "";

    try {
      // Record the issued invoice (best-effort; the PDF is generated client-side).
      // Server-side RPC validates the order belongs to the current user and
      // derives amount/currency from the order row — clients cannot forge invoices.
      await supabase.rpc("record_invoice", {
        p_order_id: record.id,
        p_invoice_number: invoiceNumber,
      });
    } catch {
      // ignore DB errors — download still works
    }

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, W, 90, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("ChinaConnect", 40, 42);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Invoice", W - 40, 42, { align: "right" });
    doc.text(invoiceNumber, W - 40, 58, { align: "right" });

    // Billing details
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.text("Billed To", 40, 130);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Customer", 40, 146);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(email, 40, 162);
    doc.text(new Date(record.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), 40, 178);

    // Line items
    const startY = 220;
    doc.setFillColor(241, 245, 249);
    doc.rect(40, startY, W - 80, 26, "F");
    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("DESCRIPTION", 52, startY + 17);
    doc.text("PERIOD", 240, startY + 17);
    doc.text("AMOUNT", W - 52, startY + 17, { align: "right" });

    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(record.planName + " Membership", 52, startY + 52);
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(record.billingPeriod, 240, startY + 52);
    doc.text(
      `${record.currency === "CNY" ? "¥" : "$"}${record.amount.toFixed(2)}`,
      W - 52,
      startY + 52,
      { align: "right" },
    );

    // Total
    const totalY = startY + 88;
    doc.setDrawColor(226, 232, 240);
    doc.line(40, totalY, W - 40, totalY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("Total Paid", 40, totalY + 22);
    doc.text(
      `${record.currency === "CNY" ? "¥" : "$"}${record.amount.toFixed(2)} ${record.currency}`,
      W - 40,
      totalY + 22,
      { align: "right" },
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Order ${record.orderNumber} · Status: ${statusLabel("en", record.status)}`, 40, totalY + 40);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("Thank you for choosing ChinaConnect!", 40, 740);
    doc.text("support@chinaconnect.org", 40, 754);

    doc.save(`${invoiceNumber}.pdf`);
  };

  const nextChargeLabel =
    membership && membership.nextChargeAt
      ? new Date(membership.nextChargeAt).toLocaleDateString(lang, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : membership && !isFree && membership.billingCycle === "lifetime"
        ? accountT(lang, "lifetimePlan")
        : null;

  return (
    <div className="space-y-6">
      {/* Current Subscription Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {accountT(lang, "currentSub")}
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{tierName}</h3>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {isFree ? "—" : records[0] ? `${records[0].currency === "CNY" ? "¥" : "$"}${records[0].amount.toFixed(2)}` : "—"}
            </p>
            {!isFree && records[0] && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {records[0].billingPeriod}
              </p>
            )}
          </div>
        </div>
        {!isFree && nextChargeLabel && (
          <div className="flex items-center justify-between text-sm pt-4 border-t border-blue-200 dark:border-blue-700 mt-4">
            <span className="text-gray-600 dark:text-gray-400">{accountT(lang, "nextBilling")}</span>
            <span className="font-medium text-gray-900 dark:text-white">{nextChargeLabel}</span>
          </div>
        )}
        {isFree && (
          <div className="pt-4 border-t border-blue-200 dark:border-blue-700 mt-4">
            <a
              href={localizedHref(language, "/pricing")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              {accountT(lang, "upgradePlan")} →
            </a>
          </div>
        )}
      </div>

      {/* Payment Records */}
      {records.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {accountT(lang, "paymentRecords")}
            </h3>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-750">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {accountT(lang, "colDate")}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {accountT(lang, "colPlan")}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {accountT(lang, "colPeriod")}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {accountT(lang, "colAmount")}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {accountT(lang, "colStatus")}
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {accountT(lang, "colInvoice")}
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
                      {new Date(record.date).toLocaleDateString(lang, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {record.planName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                      {record.billingPeriod}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {record.currency === "CNY" ? "¥" : "$"}{record.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[record.status]}`}
                      >
                        {statusLabel(lang, record.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(record.invoiceNumber)}
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
                    {record.planName}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[record.status]}`}
                  >
                    {statusLabel(lang, record.status)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    {new Date(record.date).toLocaleDateString(lang, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {record.currency === "CNY" ? "¥" : "$"}{record.amount.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => handleDownloadInvoice(record.invoiceNumber)}
                  className="text-blue-600 dark:text-blue-400 text-xs font-medium hover:underline flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  {accountT(lang, "downloadInvoice")}
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
            {accountT(lang, "noRecords")}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            {accountT(lang, isFree ? "noRecordsDesc" : "noRecordsPaidDesc")}
          </p>
          <a
            href={localizedHref(language, "/pricing")}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {accountT(lang, "viewPlans")}
          </a>
        </div>
      )}
    </div>
  );
};

export default BillingHistory;

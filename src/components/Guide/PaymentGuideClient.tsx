import { ATM_LOCATIONS, PAYMENT_FAQS, PAYMENT_METHODS, SHOPPING_TIPS } from "@/data/guide/payment";
import React, { useState } from "react";
import { type Language, translations } from "@/i18n/translations";
import { jaText, Bi } from "./guide-i18n";

interface PaymentGuideClientProps {
  lang?: Language;
}

export function PaymentGuideClient({ lang = "en" }: PaymentGuideClientProps = {}) {
  const t = translations[lang] || translations.en;
  const tg = (t.paymentGuide || translations.en.paymentGuide || {}) as Record<string, string>;
  const [activeTab, setActiveTab] = useState("methods");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const tabs = [
    { id: "alipay", label: tg.tabAlipay || "Alipay", icon: "??" },
    { id: "wechat", label: tg.tabWechat || "WeChat Pay", icon: "??" },
    { id: "cash", label: tg.tabCash || "Cash & Cards", icon: "??" },
    { id: "tax", label: tg.tabTax || "Tax Refund", icon: "??" },
    { id: "atm", label: tg.tabAtm || "ATMs", icon: "??" },
    { id: "faq", label: tg.tabFaq || "FAQ", icon: "?" }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Payment Methods Tab */}
      {activeTab === "methods" && (
        <div className="space-y-4">
          {PAYMENT_METHODS.map((method) => (
            <div key={method.method} className="bg-card rounded-xl border overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-transparent p-4 border-b flex items-center gap-4">
                <span className="text-4xl">{method.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{lang === "ja" ? jaText(method.method, lang) : method.method}</h3>
                  <p className="text-sm text-muted-foreground">{jaText(method.descriptionCn, lang)}</p>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {lang !== "ja" && <p className="text-sm text-foreground">{method.description}</p>}

                {/* How to Setup */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <span>⚙️</span><Bi en="How to Set Up" zh="如何设置" lang={lang} /></h4>
                  <ol className="space-y-2">
                    {lang !== "ja" && method.howToSetup.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold">{i + 1}.</span>
                        <span className="text-sm">{jaText(step, lang)}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-3 pt-3 border-t space-y-1">
                    {method.howToSetupCn.map((step, i) => (
                      <p key={i} className="text-sm text-muted-foreground">
                        {jaText(step, lang)}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Usage */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <span>💰</span><Bi en="How to Use" zh="如何使用" lang={lang} /></h4>
                  <ul className="space-y-2">
                    {lang !== "ja" && method.usage.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-green-500">✓</span>
                        <span>{jaText(step, lang)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-3 border-t space-y-1">
                    {method.usageCn.map((step, i) => (
                      <p key={i} className="text-sm text-muted-foreground">
                        {jaText(step, lang)}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Pros & Cons */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <span>✅</span> {lang === "ja" ? "メリット" : "Pros"}
                    </h4>
                    <ul className="space-y-1">
                      {method.pros.map((pro, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-green-500">+</span>
                          <span>{jaText(pro, lang)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <span>⚠️</span> {lang === "ja" ? "デメリット" : "Cons"}
                    </h4>
                    <ul className="space-y-1">
                      {method.cons.map((con, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-red-500">-</span>
                          <span>{jaText(con, lang)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-amber-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span>💡</span> {lang === "ja" ? "プロのヒント" : "Pro Tips"}
                  </h4>
                  <ul className="space-y-2">
                    {method.tips.map((tip, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-amber-600">•</span>
                        <span>{jaText(tip, lang)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}

          {/* Important Reminder */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold">{tg.securityWarning || "Security Warning"}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {lang === "ja" ? "支払いパスワード、認証コード、個人情報を他人と共有しないでください。銀行員や店員がパスワードを尋ねることは絶対にありません。不審な活動があればすぐに報告してください。" : "Never share your payment passwords, verification codes, or personal information with strangers. Bank staff and merchants will never ask for your passwords. Report suspicious activity immediately."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shopping Tips Tab */}
      {activeTab === "shopping" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {SHOPPING_TIPS.map((tip, idx) => (
              <div key={idx} className="bg-card rounded-xl border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{tip.icon}</span>
                  <h3 className="font-semibold">{jaText(tip.category, lang)}</h3>
                </div>
                <p className="text-sm text-foreground">{jaText(tip.tip, lang)}</p>
                <p className="text-sm text-muted-foreground mt-2">{jaText(tip.tipCn, lang)}</p>
                {tip.warning && (
                  <div className="mt-3 p-2 bg-amber-50 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium text-amber-700">{lang === "ja" ? "警告：" : "Warning:"}</span> {jaText(tip.warning, lang)}
                    </p>
                    <p className="text-sm text-muted-foreground">{jaText(tip.warningCn, lang)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tax Refund Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold flex items-center gap-2">
              <span>💰</span> {lang === "ja" ? "VAT税還付（付加価値税還付）" : "VAT Tax Refund"}
            </h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>{tg.taxTip2 || "Minimum purchase: 500 CNY at participating stores"}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>{tg.taxTip3 || "Refund rate: 3-11% depending on item category"}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>{tg.taxTip1 || "Process at airport departure hall before security"}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>{tg.taxTip4 || "Keep invoice with tax refund mark"}</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* ATM Locations Tab */}
      {activeTab === "atms" && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-xl">{tg.atmHeading || "Best ATMs for International Cards"}</h2>
              <p className="text-sm text-muted-foreground">
                {lang === "ja" ? "サービスが良い銀行ATMを探しましょう" : "Look for these bank ATMs for best service"}
              </p>
            </div>
            <div className="divide-y">
              {ATM_LOCATIONS.map((atm, idx) => (
                <div key={idx} className="p-4 flex items-center gap-4">
                  <span className="text-3xl">{atm.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold">{jaText(atm.bank, lang)}</h3>
                    <p className="text-sm text-muted-foreground">{jaText(atm.notes, lang)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ATM Tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="font-semibold flex items-center gap-2">
              <span>💡</span> ATM Tips
            </h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-amber-600">•</span>
                <span>{tg.atmTip1 || "ATMs at airports and banks have best exchange rates"}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600">•</span>
                <span>{tg.atmTip2 || "Check with your bank about international withdrawal fees"}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600">•</span>
                <span>{tg.atmTip3 || "Some ATMs limit foreign card withdrawals (max 2000 CNY)"}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600">•</span>
                <span>{tg.atmTip4 || "Use card machines inside banks for better security"}</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* FAQs Tab */}
      {activeTab === "faqs" && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-xl">{tg.faqsHeading || "Frequently Asked Questions"}</h2>
            </div>
            <div className="divide-y">
              {PAYMENT_FAQS.map((faq, idx) => (
                <div key={idx}>
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-medium text-left pr-4">{jaText(faq.question, lang)}</span>
                    <span className="text-muted-foreground">{expandedFaq === idx ? "▲" : "▼"}</span>
                  </button>
                  {expandedFaq === idx && (
                    <div className="px-4 pb-4">
                      <p className="text-foreground">{jaText(faq.answer, lang)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentGuideClient;

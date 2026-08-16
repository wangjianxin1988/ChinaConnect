import {
  AIRPORT_INFO,
  DEPARTURE_CHECKLIST,
  DEPARTURE_FAQS,
  DEPARTURE_STEPS,
  DUTY_FREE_SHOPPING,
  MEMORY_COLLECTION,
  TAX_REFUND_INFO,
} from "@/data/guide/departure";
import React, { useState } from "react";
import { type Language, translations } from "@/i18n/translations";
import { jaText, Bi, guideText, localized } from "./guide-i18n";;

export function DepartureGuideClient({ lang = "en" }: { lang?: Language } = {}) { const t = translations[lang] || translations.en; const tg = (t.departureGuide || translations.en.departureGuide || {}) as Record<string, string>;
  const [activeTab, setActiveTab] = useState("steps");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const tabs = [
    { id: "steps", label: tg.tabSteps || "Departure Steps", icon: "✈️" },
    { id: "tax", label: tg.tabTax || "Tax Refund", icon: "💰" },
    { id: "airport", label: tg.tabAirport || "Airport Info", icon: "🏢" },
    { id: "checklist", label: tg.tabChecklist || "Checklist", icon: "📋" },
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

      {/* Departure Steps Tab */}
      {activeTab === "steps" && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {DEPARTURE_STEPS.map((step) => (
              <div key={step.step} className="bg-card rounded-xl border overflow-hidden">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-transparent border-b">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{localized(step.title, step.titleCn, lang)}</h3>
                  </div>
                  <span className="text-3xl">{step.icon}</span>
                </div>
                <div className="p-4">
                  {lang !== "ja" && <p className="text-foreground mb-2">{guideText(step.description, lang)}</p>}
                  <p className="text-sm text-muted-foreground mb-4">{jaText(step.descriptionCn, lang)}</p>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {localized(step.timing, step.timingCn, lang)}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-blue-500">{i + 1}.</span>
                          <span>{localized(detail, step.detailsCn[i] || "", lang)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Important Reminders */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="font-semibold flex items-center gap-2">
              <span>⏰</span> {localized("Important Reminders", "重要な注意事項", lang)}
            </h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-amber-600">•</span>
                <span>{localized("International flights: arrive at airport 3 hours before departure", "国際線：出発の3時間前に空港到着", lang)}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600">•</span>
                <span>
                  {localized("Check passport validity - must be valid for 6+ months beyond travel dates", "パスポート有効期限を確認 - 渡航期間終了後6ヶ月以上の残存が必要", lang)}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600">•</span>
                <span>{localized("Verify visa exit dates - overstay fines are approximately 500 CNY/day", "ビザの出国期限を確認 - 超過滞在の罰金は1日あたり約500元", lang)}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600">•</span>
                <span>{localized("Keep boarding pass and receipts for expense tracking", "経費管理のため搭乗券と領収書を保管", lang)}</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Tax Refund Tab */}
      {activeTab === "tax" && (
        <div className="space-y-4">
          {TAX_REFUND_INFO.map((refund) => (
            <div key={refund.category} className="bg-card rounded-xl border overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 border-b flex items-center gap-4">
                <span className="text-3xl">{refund.icon}</span>
                <div>
                  <h3 className="font-semibold text-lg">{guideText(refund.category, lang)}</h3>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <p className="text-sm text-foreground">{localized(refund.description, refund.descriptionCn, lang)}</p>

                {refund.process.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3"><Bi en="Process" zh="流程" lang={lang} /></h4>
                    <ol className="space-y-2">
                      {refund.process.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-green-500 font-bold">{i + 1}.</span>
                          <span>{guideText(step, lang)}</span>
                        </li>
                      ))}
                    </ol>
                    <div className="mt-3 pt-3 border-t space-y-1">
                      {refund.processCn.map((step, i) => (
                        <p key={i} className="text-sm text-muted-foreground">
                          {jaText(step, lang)}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {refund.tips.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2"><Bi en="Tips" zh="提示" lang={lang} /></h4>
                    <ul className="space-y-2">
                      {refund.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-green-500">✓</span>
                          <span>{guideText(tip, lang)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 pt-3 border-t space-y-1">
                      {refund.tipsCn.map((tip, i) => (
                        <p key={i} className="text-sm text-muted-foreground">
                          {jaText(tip, lang)}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Tax Refund Calculator */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold flex items-center gap-2">
              <span>💰</span> {localized("Tax Refund Rates", "税還付率", lang)}
            </h3>
            <div className="mt-3 grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-3">
                <h4 className="font-medium">{localized("General Goods", "一般商品", lang)}</h4>
                <p className="text-2xl font-bold text-primary">3-6%</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <h4 className="font-medium">{localized("Luxury Items", "高級品", lang)}</h4>
                <p className="text-2xl font-bold text-primary">6-11%</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <h4 className="font-medium">{localized("Minimum Purchase", "最低購入額", lang)}</h4>
                <p className="text-2xl font-bold text-primary">500 CNY</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              {localized("Refund rate depends on item category. Luxury goods, cosmetics, and electronics typically have higher rates.", "還付率は商品カテゴリーによって異なります。高級品、化粧品、電化製品は一般的に還付率が高くなります。", lang)}
            </p>
          </div>
        </div>
      )}

      {/* Airport Info Tab */}
      {activeTab === "airport" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {AIRPORT_INFO.map((airport) => (
              <div key={airport.code} className="bg-card rounded-xl border overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{jaText(airport.city, lang)}</h3>
                      <p className="text-sm text-muted-foreground">{jaText(airport.airport, lang)}</p>
                    </div>
                    <span className="text-3xl font-bold text-primary">{airport.code}</span>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      {localized("Distance from city center:", "市内中心部からの距離：", lang)}
                    </span>
                    <p className="font-medium">{jaText(airport.distance, lang)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2"><Bi en="Transport Options" zh="交通方式" lang={lang} /></h4>
                    <ul className="space-y-2">
                      {airport.transport.map((t, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span>{jaText(t, lang)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <h4 className="font-medium mb-2"><Bi en="Tips" zh="小贴士" lang={lang} /></h4>
                    <ul className="space-y-1">
                      {airport.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          {jaText(tip, lang)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Duty Free Shopping */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b">
              <h3 className="font-semibold text-lg">{localized("Duty-Free Shopping Tips", "免税店ショッピングのヒント", lang)}</h3>
            </div>
            <div className="p-4 grid md:grid-cols-2 gap-4">
              {DUTY_FREE_SHOPPING.map((item, idx) => (
                <div key={idx} className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{item.icon}</span>
                    <h4 className="font-medium">{jaText(item.category, lang)}</h4>
                  </div>
                  <p className="text-sm text-foreground">{localized(item.tip, item.tipCn, lang)}</p>
                  <p className="text-sm text-muted-foreground mt-1">{jaText(item.tipCn, lang)}</p>
                  <p className="text-sm text-muted-foreground mt-2 italic">{localized(item.note, item.noteCn, lang)}</p>
                  <p className="text-xs text-muted-foreground italic">{jaText(item.noteCn, lang)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Checklist Tab */}
      {activeTab === "checklist" && (
        <div className="space-y-6">
          {/* Documents */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span>🛂</span><Bi en="Documents" zh="文件" lang={lang} /></h3>
            </div>
            <div className="divide-y">
              {DEPARTURE_CHECKLIST.documents.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center gap-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium">{jaText(item.item, lang)}</h4>
                    <p className="text-sm text-muted-foreground">{jaText(item.note, lang)}</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Packing */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-green-50 px-6 py-4 border-b">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span>🧳</span><Bi en="Packing" zh="打包" lang={lang} /></h3>
            </div>
            <div className="divide-y">
              {DEPARTURE_CHECKLIST.packing.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center gap-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium">{jaText(item.item, lang)}</h4>
                    <p className="text-sm text-muted-foreground">{jaText(item.note, lang)}</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Payments */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-amber-50 px-6 py-4 border-b">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span>💵</span><Bi en="Payments" zh="支付" lang={lang} /></h3>
            </div>
            <div className="divide-y">
              {DEPARTURE_CHECKLIST.payments.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center gap-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium">{jaText(item.item, lang)}</h4>
                    <p className="text-sm text-muted-foreground">{jaText(item.note, lang)}</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Departure */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-purple-50 px-6 py-4 border-b">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span>🚗</span><Bi en="Departure" zh="出发" lang={lang} /></h3>
            </div>
            <div className="divide-y">
              {DEPARTURE_CHECKLIST.departure.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center gap-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium">{guideText(item.item, lang)}</h4>
                    <p className="text-sm text-muted-foreground">{guideText(item.note, lang)}</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Memory Collection */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-4">
            <h3 className="font-semibold flex items-center gap-2">
              <span>📸</span> {guideText(MEMORY_COLLECTION.title, lang)} / {jaText(MEMORY_COLLECTION.titleCn, lang)}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{jaText(MEMORY_COLLECTION.descriptionCn, lang)}</p>
            <div className="mt-3 grid md:grid-cols-2 gap-3">
              {MEMORY_COLLECTION.items.map((item, idx) => (
                <div key={idx} className="bg-white/50 rounded-lg p-3 flex items-center gap-2">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h4 className="font-medium text-sm">{guideText(item.title, lang)}</h4>
                    <p className="text-xs text-muted-foreground">{guideText(item.note, lang)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b">
              <h3 className="font-semibold text-lg">Frequently Asked Questions</h3>
            </div>
            <div className="divide-y">
              {DEPARTURE_FAQS.map((faq, idx) => (
                <div key={idx}>
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-medium text-left pr-4">{guideText(faq.question, lang)}</span>
                    <span className="text-muted-foreground">{expandedFaq === idx ? "▲" : "▼"}</span>
                  </button>
                  {expandedFaq === idx && (
                    <div className="px-4 pb-4">
                      <p className="text-foreground">{guideText(faq.answer, lang)}</p>
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

export default DepartureGuideClient;
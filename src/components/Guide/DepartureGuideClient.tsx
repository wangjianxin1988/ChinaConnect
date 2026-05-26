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

export function DepartureGuideClient() {
  const [activeTab, setActiveTab] = useState("steps");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const tabs = [
    { id: "steps", label: "Departure Steps", icon: "✈️" },
    { id: "tax", label: "Tax Refund", icon: "💰" },
    { id: "airport", label: "Airport Info", icon: "🏢" },
    { id: "checklist", label: "Checklist", icon: "📋" },
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
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.titleCn}</p>
                  </div>
                  <span className="text-3xl">{step.icon}</span>
                </div>
                <div className="p-4">
                  <p className="text-foreground mb-2">{step.description}</p>
                  <p className="text-sm text-muted-foreground mb-4">{step.descriptionCn}</p>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {step.timing}
                      </span>
                      <span className="text-xs text-muted-foreground">{step.timingCn}</span>
                    </div>
                    <ul className="space-y-2">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-blue-500">{i + 1}.</span>
                          <span>{detail}</span>
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
              <span>⏰</span> Important Reminders
            </h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-amber-600">•</span>
                <span>International flights: arrive at airport 3 hours before departure</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600">•</span>
                <span>
                  Check passport validity - must be valid for 6+ months beyond travel dates
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600">•</span>
                <span>Verify visa exit dates - overstay fines are approximately 500 CNY/day</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600">•</span>
                <span>Keep boarding pass and receipts for expense tracking</span>
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
                  <h3 className="font-semibold text-lg">{refund.category}</h3>
                  <p className="text-sm text-muted-foreground">{refund.descriptionCn}</p>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <p className="text-sm text-foreground">{refund.description}</p>

                {refund.process.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Process / 流程</h4>
                    <ol className="space-y-2">
                      {refund.process.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-green-500 font-bold">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                    <div className="mt-3 pt-3 border-t space-y-1">
                      {refund.processCn.map((step, i) => (
                        <p key={i} className="text-sm text-muted-foreground">
                          {step}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {refund.tips.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Tips / 提示</h4>
                    <ul className="space-y-2">
                      {refund.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-green-500">✓</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 pt-3 border-t space-y-1">
                      {refund.tipsCn.map((tip, i) => (
                        <p key={i} className="text-sm text-muted-foreground">
                          {tip}
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
              <span>💰</span> Tax Refund Rates
            </h3>
            <div className="mt-3 grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-3">
                <h4 className="font-medium">General Goods</h4>
                <p className="text-2xl font-bold text-primary">3-6%</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <h4 className="font-medium">Luxury Items</h4>
                <p className="text-2xl font-bold text-primary">6-11%</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <h4 className="font-medium">Minimum Purchase</h4>
                <p className="text-2xl font-bold text-primary">500 CNY</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Refund rate depends on item category. Luxury goods, cosmetics, and electronics
              typically have higher rates.
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
                      <h3 className="font-semibold text-lg">{airport.city}</h3>
                      <p className="text-sm text-muted-foreground">{airport.airport}</p>
                    </div>
                    <span className="text-3xl font-bold text-primary">{airport.code}</span>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Distance from city center:
                    </span>
                    <p className="font-medium">{airport.distance}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Transport Options / 交通方式</h4>
                    <ul className="space-y-2">
                      {airport.transport.map((t, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <h4 className="font-medium mb-2">Tips / 小贴士</h4>
                    <ul className="space-y-1">
                      {airport.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          {tip}
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
              <h3 className="font-semibold text-lg">Duty-Free Shopping Tips</h3>
            </div>
            <div className="p-4 grid md:grid-cols-2 gap-4">
              {DUTY_FREE_SHOPPING.map((item, idx) => (
                <div key={idx} className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{item.icon}</span>
                    <h4 className="font-medium">{item.category}</h4>
                  </div>
                  <p className="text-sm text-foreground">{item.tip}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.tipCn}</p>
                  <p className="text-sm text-muted-foreground mt-2 italic">{item.note}</p>
                  <p className="text-xs text-muted-foreground italic">{item.noteCn}</p>
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
                <span>🛂</span> Documents / 文件
              </h3>
            </div>
            <div className="divide-y">
              {DEPARTURE_CHECKLIST.documents.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center gap-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.item}</h4>
                    <p className="text-sm text-muted-foreground">{item.note}</p>
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
                <span>🧳</span> Packing / 打包
              </h3>
            </div>
            <div className="divide-y">
              {DEPARTURE_CHECKLIST.packing.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center gap-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.item}</h4>
                    <p className="text-sm text-muted-foreground">{item.note}</p>
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
                <span>💵</span> Payments / 支付
              </h3>
            </div>
            <div className="divide-y">
              {DEPARTURE_CHECKLIST.payments.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center gap-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.item}</h4>
                    <p className="text-sm text-muted-foreground">{item.note}</p>
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
                <span>🚗</span> Departure / 出发
              </h3>
            </div>
            <div className="divide-y">
              {DEPARTURE_CHECKLIST.departure.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center gap-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.item}</h4>
                    <p className="text-sm text-muted-foreground">{item.note}</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Memory Collection */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-4">
            <h3 className="font-semibold flex items-center gap-2">
              <span>📸</span> {MEMORY_COLLECTION.title} / {MEMORY_COLLECTION.titleCn}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{MEMORY_COLLECTION.descriptionCn}</p>
            <div className="mt-3 grid md:grid-cols-2 gap-3">
              {MEMORY_COLLECTION.items.map((item, idx) => (
                <div key={idx} className="bg-white/50 rounded-lg p-3 flex items-center gap-2">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.note}</p>
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
                    <span className="font-medium text-left pr-4">{faq.question}</span>
                    <span className="text-muted-foreground">{expandedFaq === idx ? "▲" : "▼"}</span>
                  </button>
                  {expandedFaq === idx && (
                    <div className="px-4 pb-4">
                      <p className="text-foreground">{faq.answer}</p>
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

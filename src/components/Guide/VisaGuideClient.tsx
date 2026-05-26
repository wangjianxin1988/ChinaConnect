import {
  ESSENTIAL_APPS_LIST,
  ESSENTIAL_DOCUMENTS,
  FLIGHT_BOOKING_TIPS,
  PRE_DEPARTURE_CHECKLIST,
  TRAVEL_INSURANCE_RECOMMENDATIONS,
  VISA_FAQS,
  VISA_PROCESS_STEPS,
  VISA_REQUIREMENTS,
  VISA_TIPS,
  VPN_RECOMMENDATIONS,
} from "@/data/guide/visa";
import React, { useState } from "react";

export function VisaGuideClient() {
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const tabs = [
    { id: "overview", label: "Overview", icon: "📋" },
    { id: "checklist", label: "Pre-departure", icon: "✅" },
    { id: "apps", label: "Apps & VPN", icon: "📱" },
    { id: "insurance", label: "Insurance", icon: "🛡️" },
    { id: "process", label: "Process", icon: "📝" },
    { id: "documents", label: "Documents", icon: "📄" },
    { id: "tips", label: "Tips & FAQs", icon: "💡" },
  ];

  const toggleCheckItem = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Visa Requirements by Country */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-xl">Visa Requirements by Country</h2>
              <p className="text-sm text-muted-foreground">
                Select your country to see specific requirements
              </p>
            </div>
            <div className="divide-y">
              {VISA_REQUIREMENTS.map((req, idx) => (
                <div key={idx} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{req.country}</h3>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {req.visaType}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <p className="font-medium">{req.duration}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Processing:</span>
                      <p className="font-medium">{req.processingTime}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fee:</span>
                      <p className="font-medium">{req.fee}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-sm text-muted-foreground">Requirements:</span>
                    <ul className="mt-1 grid md:grid-cols-2 gap-1">
                      {req.notes.map((note, i) => (
                        <li key={i} className="text-sm flex items-center gap-1">
                          <span className="text-green-500">✓</span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {VISA_TIPS.map((tip, idx) => (
              <div key={idx} className="bg-card rounded-xl border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{tip.icon}</span>
                  <h3 className="font-semibold">{tip.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{tip.tip}</p>
                <p className="text-sm text-muted-foreground mt-1">{tip.tipCn}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Process Tab */}
      {activeTab === "process" && (
        <div className="space-y-4">
          {VISA_PROCESS_STEPS.map((step) => (
            <div key={step.step} className="bg-card rounded-xl border overflow-hidden">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-transparent border-b">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.titleCn}</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-foreground mb-4">{step.description}</p>
                <p className="text-sm text-muted-foreground mb-4">{step.descriptionCn}</p>
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <span>📋</span> Key Actions
                  </h4>
                  <ul className="space-y-2">
                    {step.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-500 mt-0.5">{i + 1}.</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t space-y-1">
                    {step.tipsCn.map((tip, i) => (
                      <p key={i} className="text-sm text-muted-foreground">
                        {tip}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          {/* Before Travel */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-green-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-xl flex items-center gap-2">
                <span>✈️</span> Documents to Carry
              </h2>
            </div>
            <div className="divide-y">
              {ESSENTIAL_DOCUMENTS.beforeTravel.map((doc, idx) => (
                <div key={idx} className="p-4 flex items-center gap-4">
                  <span className="text-3xl">{doc.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold">{doc.item}</h3>
                    <p className="text-sm text-muted-foreground">{doc.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Copies */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-xl flex items-center gap-2">
                <span>📁</span> Backup Copies to Keep
              </h2>
            </div>
            <div className="divide-y">
              {ESSENTIAL_DOCUMENTS.copies.map((doc, idx) => (
                <div key={idx} className="p-4 flex items-center gap-4">
                  <span className="text-3xl">{doc.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold">{doc.item}</h3>
                    <p className="text-sm text-muted-foreground">{doc.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Important Reminder */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold">Important Reminder</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Keep digital copies in cloud storage (Google Drive, iCloud) and share with family.
                  Physical copies should be kept separate from originals.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips & FAQs Tab */}
      {activeTab === "tips" && (
        <div className="space-y-6">
          {/* Quick Tips Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {VISA_TIPS.map((tip, idx) => (
              <div key={idx} className="bg-card rounded-xl border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{tip.icon}</span>
                  <h3 className="font-semibold">{tip.title}</h3>
                </div>
                <p className="text-sm text-foreground">{tip.tip}</p>
                <p className="text-sm text-muted-foreground mt-2">{tip.tipCn}</p>
              </div>
            ))}
          </div>

          {/* FAQs */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-xl">Frequently Asked Questions</h2>
            </div>
            <div className="divide-y">
              {VISA_FAQS.map((faq, idx) => (
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

          {/* Emergency Note */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🚨</span>
              <div>
                <h3 className="font-semibold">Visa Overstay Warning</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Overstaying your visa can result in fines, detention, and future travel bans. If
                  you need more time, apply for extension at the Public Security Bureau (PSB) before
                  your visa expires. Current overstay fines are approximately 500 CNY per day.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Tab - Pre-departure Checklist */}
      {activeTab === "checklist" && (
        <div className="space-y-6">
          {/* Weeks Before */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-xl flex items-center gap-2">
                <span>📅</span> Weeks Before Travel (4-6 weeks)
              </h2>
              <p className="text-sm text-muted-foreground">
                Complete these 4-6 weeks before departure
              </p>
            </div>
            <div className="divide-y">
              {PRE_DEPARTURE_CHECKLIST.weeksBefore.map((item, idx) => {
                const id = `weeks-${idx}`;
                return (
                  <div key={idx} className="p-4 flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={checkedItems.has(id)}
                      onChange={() => toggleCheckItem(id)}
                      className="w-5 h-5 rounded text-primary"
                    />
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.item}</h3>
                      <p className="text-sm text-muted-foreground">{item.note}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Days Before */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-green-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-xl flex items-center gap-2">
                <span>⏰</span> Days Before Travel (2-3 days)
              </h2>
              <p className="text-sm text-muted-foreground">Final preparations</p>
            </div>
            <div className="divide-y">
              {PRE_DEPARTURE_CHECKLIST.daysBefore.map((item, idx) => {
                const id = `days-${idx}`;
                return (
                  <div key={idx} className="p-4 flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={checkedItems.has(id)}
                      onChange={() => toggleCheckItem(id)}
                      className="w-5 h-5 rounded text-primary"
                    />
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.item}</h3>
                      <p className="text-sm text-muted-foreground">{item.note}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* What to Bring - Electronics */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-purple-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-xl flex items-center gap-2">
                <span>🔌</span> What to Bring - Electronics
              </h2>
            </div>
            <div className="divide-y">
              {PRE_DEPARTURE_CHECKLIST.whatToBring.electronics.map((item, idx) => {
                const id = `elec-${idx}`;
                return (
                  <div key={idx} className="p-4 flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={checkedItems.has(id)}
                      onChange={() => toggleCheckItem(id)}
                      className="w-5 h-5 rounded text-primary"
                    />
                    <span className="text-2xl">{item.icon}</span>
                    <h3 className="font-medium">{item.item}</h3>
                  </div>
                );
              })}
            </div>
          </div>

          {/* What to Bring - Essentials */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-amber-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-xl flex items-center gap-2">
                <span>🎒</span> What to Bring - Essentials
              </h2>
            </div>
            <div className="divide-y">
              {PRE_DEPARTURE_CHECKLIST.whatToBring.essentials.map((item, idx) => {
                const id = `ess-${idx}`;
                return (
                  <div key={idx} className="p-4 flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={checkedItems.has(id)}
                      onChange={() => toggleCheckItem(id)}
                      className="w-5 h-5 rounded text-primary"
                    />
                    <span className="text-2xl">{item.icon}</span>
                    <h3 className="font-medium">{item.item}</h3>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              Progress: {checkedItems.size}/
              {PRE_DEPARTURE_CHECKLIST.weeksBefore.length +
                PRE_DEPARTURE_CHECKLIST.daysBefore.length +
                PRE_DEPARTURE_CHECKLIST.whatToBring.electronics.length +
                PRE_DEPARTURE_CHECKLIST.whatToBring.essentials.length}{" "}
              items checked
            </p>
            <div className="w-full bg-blue-100 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{
                  width: `${(checkedItems.size / (PRE_DEPARTURE_CHECKLIST.weeksBefore.length + PRE_DEPARTURE_CHECKLIST.daysBefore.length + PRE_DEPARTURE_CHECKLIST.whatToBring.electronics.length + PRE_DEPARTURE_CHECKLIST.whatToBring.essentials.length)) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Flight Booking Tips */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-xl">Flight Booking Tips</h2>
            </div>
            <div className="divide-y">
              {FLIGHT_BOOKING_TIPS.map((tip, idx) => (
                <div key={idx} className="p-4 flex items-center gap-4">
                  <span className="text-2xl">{tip.icon}</span>
                  <span className="text-sm">{tip.tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Apps & VPN Tab */}
      {activeTab === "apps" && (
        <div className="space-y-6">
          {/* VPN Warning */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-800">
                  Critical: Download VPN BEFORE arriving in China
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  Most VPN websites and apps are blocked in China. Install and test your VPN at home
                  before departure.
                </p>
              </div>
            </div>
          </div>

          {/* VPN Recommendations */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-purple-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-xl flex items-center gap-2">
                <span>🔐</span> Recommended VPNs
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-3 font-medium">VPN</th>
                    <th className="text-left p-3 font-medium">Reliability</th>
                    <th className="text-left p-3 font-medium">Speed</th>
                    <th className="text-left p-3 font-medium">Cost</th>
                    <th className="text-left p-3 font-medium">Setup</th>
                    <th className="text-left p-3 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {VPN_RECOMMENDATIONS.map((vpn, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-medium">{vpn.name}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            vpn.reliability === "High"
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {vpn.reliability}
                        </span>
                      </td>
                      <td className="p-3">{vpn.speed}</td>
                      <td className="p-3 font-medium text-primary">{vpn.cost}</td>
                      <td className="p-3">{vpn.setup}</td>
                      <td className="p-3 text-muted-foreground">{vpn.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Essential Apps */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-xl flex items-center gap-2">
                <span>📱</span> Essential Apps
              </h2>
              <p className="text-sm text-muted-foreground">
                Download before arrival - Google Play is blocked in China
              </p>
            </div>
            <div className="divide-y">
              {ESSENTIAL_APPS_LIST.map((app, idx) => (
                <div key={idx} className="p-4 flex items-center gap-4">
                  {app.essential && (
                    <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded font-medium">
                      Essential
                    </span>
                  )}
                  <h3 className="font-medium w-32">{app.app}</h3>
                  <p className="text-sm text-muted-foreground flex-1">{app.purpose}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Insurance Tab */}
      {activeTab === "insurance" && (
        <div className="space-y-6">
          {/* Insurance Warning */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-800">Travel Insurance is Essential</h3>
                <p className="text-sm text-red-700 mt-1">
                  Medical treatment in China can be expensive, especially for foreigners. A good
                  travel insurance policy with medical coverage is non-negotiable for safe travel.
                </p>
              </div>
            </div>
          </div>

          {/* Coverage Recommendations */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-green-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-xl flex items-center gap-2">
                <span>🛡️</span> Recommended Coverage
              </h2>
            </div>
            <div className="divide-y">
              {TRAVEL_INSURANCE_RECOMMENDATIONS.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center gap-4">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      item.importance === "Critical"
                        ? "bg-red-100 text-red-800"
                        : item.importance === "High"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {item.importance}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.coverage}</h3>
                    <p className="text-sm text-muted-foreground">{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insurance Tips */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-xl">Insurance Tips</h2>
            </div>
            <div className="divide-y">
              <div className="p-4">
                <h4 className="font-medium">Before Buying</h4>
                <ul className="mt-2 space-y-1 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">1.</span> Check if your home country has
                    reciprocal healthcare agreements
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">2.</span> Verify the policy covers China
                    specifically
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">3.</span> Check COVID-19 coverage (many policies
                    exclude it)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">4.</span> Confirm direct payment to hospitals vs
                    reimbursement
                  </li>
                </ul>
              </div>
              <div className="p-4">
                <h4 className="font-medium">Recommended Providers</h4>
                <ul className="mt-2 space-y-1 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span> World Nomads - good coverage for
                    adventure activities
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span> Safety Wing - affordable long-term
                    coverage
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span> Allianz - comprehensive global
                    coverage
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span> Travel Insured - excellent claim
                    process
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VisaGuideClient;

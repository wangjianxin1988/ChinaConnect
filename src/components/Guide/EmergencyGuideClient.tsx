import {
  EMBASSY_INFO,
  EMERGENCY_CONTACTS,
  EMERGENCY_FAQS,
  EMERGENCY_HELPERS,
  EMERGENCY_TYPES,
} from "@/data/guide/emergency";
import React, { useState } from "react";
import { type Language, translations } from "@/i18n/translations";
import { jaText, Bi, guideText, localized } from "./guide-i18n";;

const SEVERITY_JA: Record<string, string> = { critical: "重大", high: "高", medium: "中", low: "低" };

export function EmergencyGuideClient({ lang = "en" }: { lang?: Language } = {}) { const t = translations[lang] || translations.en; const tg = (t.emergencyGuide || translations.en.emergencyGuide || {}) as Record<string, string>;
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedEmergency, setSelectedEmergency] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const tabs = [
    { id: "overview", label: tg.tabOverview || "Emergency Types", icon: "🚨" },
    { id: "contacts", label: tg.tabContacts || "Emergency Contacts", icon: "📞" },
    { id: "embassy", label: tg.tabEmbassy || "Embassy Info", icon: "🏛️" },
    { id: "phrases", label: tg.tabPhrases || "Useful Phrases", icon: "💬" },
  ];

  const currentEmergency = EMERGENCY_TYPES.find((e) => e.type === selectedEmergency);

  return (
    <div className="space-y-6">
      {/* Emergency Banner */}
      <div className="bg-red-600 text-white rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🚨</span>
          <div>
            <h3 className="font-bold text-lg">{tg.bannerTitle || "Emergency Numbers in China"}</h3>
            <p className="text-red-100 text-sm">
              {tg.bannerSubtitle || "Save these numbers - Police: 110, Ambulance: 120, Fire: 119"}
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">110</div>
            <div className="text-xs">{tg.labelPolice || "Police"}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">120</div>
            <div className="text-xs">{tg.labelAmbulance || "Ambulance"}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">119</div>
            <div className="text-xs">{tg.labelFire || "Fire"}</div>
          </div>
        </div>
      </div>

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

      {/* Emergency Types Tab */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 space-y-3">
              {EMERGENCY_TYPES.map((emergency) => (
                <button
                  key={emergency.type}
                  onClick={() =>
                    setSelectedEmergency(
                      emergency.type === selectedEmergency ? null : emergency.type,
                    )
                  }
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedEmergency === emergency.type
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{emergency.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{guideText(emergency.type, lang)}</div>
                      <div className="text-sm text-muted-foreground">{jaText(emergency.descriptionCn, lang)}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        emergency.severity === "critical"
                          ? "bg-red-100 text-red-800"
                          : emergency.severity === "high"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {lang === "ja" ? SEVERITY_JA[emergency.severity] || emergency.severity : localized(emergency.severity, emergency.severity, lang)}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="lg:col-span-2">
              {currentEmergency ? (
                <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
                  <div
                    className={`p-6 border-b ${
                      currentEmergency.severity === "critical"
                        ? "bg-red-50"
                        : currentEmergency.severity === "high"
                          ? "bg-amber-50"
                          : "bg-blue-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-5xl">{currentEmergency.icon}</span>
                      <div>
                        <h2 className="text-2xl font-bold">{jaText(currentEmergency.type, lang)}</h2>
                        <p className="text-muted-foreground">{jaText(currentEmergency.descriptionCn, lang)}</p>
                        <span
                          className={`inline-block mt-2 px-3 py-1 rounded text-sm font-medium ${
                            currentEmergency.severity === "critical"
                              ? "bg-red-100 text-red-800"
                              : currentEmergency.severity === "high"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {lang === "ja" ? (SEVERITY_JA[currentEmergency.severity] || currentEmergency.severity) + "（重大度）" : localized(currentEmergency.severity + " severity", currentEmergency.severity, lang)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    {lang !== "ja" && <p className="text-foreground">{guideText(currentEmergency.description, lang)}</p>}

                    {/* Immediate Actions */}
                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <span>🚨</span><Bi en="Immediate Actions" zh="立即行动" lang={lang} /></h3>
                      <ol className="space-y-2">
                        {currentEmergency.immediateActions.map((action, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-red-500 font-bold">{i + 1}.</span>
                          </li>
                        ))}
                      </ol>
                      <div className="mt-3 pt-3 border-t space-y-1">
                        {currentEmergency.immediateActionsCn.map((action, i) => (
                          <p key={i} className="text-sm text-muted-foreground">
                            {jaText(action, lang)}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Prevention */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <span>🛡️</span><Bi en="Prevention" zh="预防措施" lang={lang} /></h3>
                      <ul className="space-y-2">
                        {currentEmergency.prevention.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-green-500">✓</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 pt-3 border-t space-y-1">
                        {currentEmergency.preventionCn.map((tip, i) => (
                          <p key={i} className="text-sm text-muted-foreground">
                            {jaText(tip, lang)}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Useful Phrases */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold mb-3"><Bi en="Useful Phrases" zh="有用短语" lang={lang} /></h3>
                      <div className="grid md:grid-cols-2 gap-2">
                        {currentEmergency.usefulPhrases.map((phrase, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span className="text-blue-500">•</span>
                            {lang !== "ja" && <span>{guideText(phrase, lang)}</span>}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t space-y-1">
                        {currentEmergency.usefulPhrasesCn.map((phrase, i) => (
                          <p key={i} className="text-sm text-muted-foreground">
                            {jaText(phrase, lang)}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-xl border p-12 text-center">
                  <span className="text-6xl mb-4 block">🚨</span>
                  <h3 className="text-xl font-semibold mb-2">{localized("Select an Emergency Type", "緊急事態の種類を選択", lang)}</h3>
                  <p className="text-muted-foreground">
                    {localized("Click on an emergency type to see detailed guidance", "緊急事態の種類をクリックすると詳細なガイダンスが表示されます", lang)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Emergency Contacts Tab */}
      {activeTab === "contacts" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {EMERGENCY_CONTACTS.map((contact, idx) => (
              <div key={idx} className="bg-card rounded-xl border p-6 text-center">
                <span className="text-4xl">{contact.icon}</span>
                <h3 className="font-semibold text-lg mt-2">{guideText(contact.service, lang)}</h3>
                <div className="text-3xl font-bold text-primary my-3">{contact.number}</div>
                <p className="text-sm text-muted-foreground">{jaText(contact.descriptionCn, lang)}</p>
                <span className="inline-block mt-2 px-3 py-1 rounded bg-green-100 text-green-800 text-xs">
                  {localized(contact.availability, contact.availabilityCn, lang)}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Reference Card */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b">
              <h3 className="font-semibold text-lg">Quick Reference</h3>
            </div>
            <div className="divide-y">
              {EMERGENCY_HELPERS.quickReference.map((ref, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-primary">{ref.action}</span>
                    <span className="text-muted-foreground">{guideText(ref.note, lang)}</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">{ref.number}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Insurance Checklist */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold flex items-center gap-2">
              <span>📋</span> Travel Insurance Checklist
            </h3>
            <ul className="mt-2 space-y-2">
              {EMERGENCY_HELPERS.insuranceChecklist.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-blue-500">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Embassy Info Tab */}
      {activeTab === "embassy" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {EMBASSY_INFO.map((embassy, idx) => (
              <div key={idx} className="bg-card rounded-xl border overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b flex items-center gap-3">
                  <span className="text-3xl">{embassy.flag}</span>
                  <div>
                    <h3 className="font-semibold">{embassy.country}</h3>
                    <p className="text-sm text-muted-foreground">{embassy.embassyName}</p>
                  </div>
                </div>
                <div className="p-4 space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Address:</span>
                    <p>{jaText(embassy.addressCn, lang)}</p>
                    <p className="text-muted-foreground">{guideText(embassy.address, lang)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <p className="font-medium">{embassy.phone}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Emergency:</span>
                      <p className="font-medium text-red-600">{guideText(embassy.emergency, lang)}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Website:</span>
                    <a
                      href={embassy.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {embassy.website}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Important Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="font-semibold flex items-center gap-2">
              <span>📝</span> {localized("Important Note", "重要な注意", lang)}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {localized("Save your embassy&apos;s emergency number before travel. Most embassies have 24/7 emergency lines for citizens abroad. In serious emergencies (lost passport, detention, hospitalization), contact your embassy immediately.", "旅行前に大使館の緊急連絡先を保存しておきましょう。多くの大使館は在外国民向けの24時間緊急回線を設置しています。重大な緊急時（パスポート紛失、拘留、入院）はすぐに大使館へ連絡してください。", lang)}
            </p>
          </div>
        </div>
      )}

      {/* Useful Phrases Tab */}
      {activeTab === "phrases" && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-red-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-xl">{localized("Essential Emergency Phrases", "緊急時に役立つフレーズ", lang)}</h2>
            </div>
            <div className="divide-y">
              {EMERGENCY_HELPERS.essentialPhrases.map((phrase, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between">
                  <span className="text-foreground font-medium">{guideText(phrase.english, lang)}</span>
                  <span className="text-primary text-lg">{phrase.chinese}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b">
              <h3 className="font-semibold text-lg">{localized("Frequently Asked Questions", "よくある質問", lang)}</h3>
            </div>
            <div className="divide-y">
              {EMERGENCY_FAQS.map((faq, idx) => (
                <div key={idx}>
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-medium text-left pr-4">{localized(faq.question, faq.question, lang)}</span>
                    <span className="text-muted-foreground">{expandedFaq === idx ? "▲" : "▼"}</span>
                  </button>
                  {expandedFaq === idx && (
                    <div className="px-4 pb-4">
                      <p className="text-foreground">{localized(faq.answer, faq.answer, lang)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Prevention Tips */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h3 className="font-semibold flex items-center gap-2">
              <span>🛡️</span> {localized("General Prevention Tips", "一般的な予防のヒント", lang)}
            </h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                <span>{localized("Keep digital copies of all important documents in cloud storage", "重要な書類はすべてクラウドにデジタルコピーを保存", lang)}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                <span>{localized("Share your travel itinerary with family/friends back home", "旅行日程を家族や友人と共有", lang)}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                <span>Register with your embassy&apos;s travel notification program</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                <span>Keep emergency cash in multiple locations (wallet, bag, hotel safe)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                <span>Save important numbers in your phone including your embassy</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmergencyGuideClient;
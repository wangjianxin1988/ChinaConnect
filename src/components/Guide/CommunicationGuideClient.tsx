import {
  APN_SETTINGS,
  COMMUNICATION_HELPERS,
  COMMUNICATION_SETUP_STEPS,
  ESSENTIAL_APPS,
  SIM_OPTIONS,
  VPN_OPTIONS,
} from "@/data/guide/communication";
import React, { useState } from "react";
import { type Language, translations } from "@/i18n/translations";
import { ct } from "@/i18n/components-strings";
import { jaText, Bi, guideText, localized } from "./guide-i18n";;
const RELIABILITY_JA: Record<string, string> = { high: "高信頼性", medium: "中程度", low: "低" };
const SPEED_JA: Record<string, string> = { fast: "高速", medium: "中程度", slow: "低速" };
const DIFFICULTY_JA: Record<string, string> = { easy: "簡単", medium: "中程度", hard: "難しい" };

const CARRIER_JA: Record<string, string> = {
  "China Mobile": "中国移動",
  "China Unicom": "中国聯通",
  "China Telecom": "中国電信",
};

const SIM_TYPE_JA: Record<string, string> = {
  "Local SIM Card": "現地SIMカード",
  "eSIM": "eSIM",
  "International Roaming": "国際ローミング",
  "WiFi Egg/Pocket WiFi": "WiFiルーター（ポケットWiFi）",
};

export function CommunicationGuideClient({ lang = "en" }: { lang?: Language } = {}) { const t = translations[lang] || translations.en; const tg = (t.communicationGuide || translations.en.communicationGuide || {}) as Record<string, string>;
  const [activeTab, setActiveTab] = useState("sim");
  const [selectedSIM, setSelectedSIM] = useState<string | null>(null);

  const tabs = [
    { id: "sim", label: tg.tabSim || "SIM/eSIM Options", icon: "📱" },
    { id: "vpn", label: tg.tabVpn || "VPN Setup", icon: "🔐" },
    { id: "apps", label: tg.tabApps || "Essential Apps", icon: "📲" },
    { id: "setup", label: tg.tabSetup || "Setup Guide", icon: "⚙️" },
  ];

  const currentSIM = SIM_OPTIONS.find((s) => s.type === selectedSIM);

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

      {/* SIM/eSIM Tab */}
      {activeTab === "sim" && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 space-y-3">
              <h3 className="font-semibold">{localized("Select Option", "オプションを選択", lang)}</h3>
              {SIM_OPTIONS.map((sim) => (
                <button
                  key={sim.type}
                  onClick={() => setSelectedSIM(sim.type === selectedSIM ? null : sim.type)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedSIM === sim.type
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{sim.icon}</span>
                    <div>
                      <div className="font-medium">{lang === "ja" ? (SIM_TYPE_JA[sim.type] || sim.type) : localized(sim.type, sim.type, lang)}</div>
                      <div className="text-sm text-muted-foreground">{jaText(sim.costCn, lang)}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="lg:col-span-2">
              {currentSIM ? (
                <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b">
                    <div className="flex items-center gap-4">
                      <span className="text-5xl">{currentSIM.icon}</span>
                      <div>
                        <h2 className="text-2xl font-bold">{lang === "ja" ? (SIM_TYPE_JA[currentSIM.type] || currentSIM.type) : localized(currentSIM.type, currentSIM.type, lang)}</h2>
                        {lang !== "ja" && <p className="text-muted-foreground">{guideText(currentSIM.cost, lang)}</p>}
                        <p className="text-sm text-muted-foreground">{jaText(currentSIM.costCn, lang)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {lang !== "ja" && <p className="text-foreground">{guideText(currentSIM.description, lang)}</p>}
                    <p className="text-sm text-muted-foreground">{jaText(currentSIM.descriptionCn, lang)}</p>

                    {/* Providers */}
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2"><Bi en="Providers" zh="运营商" lang={lang} /></h4>
                      <div className="flex flex-wrap gap-2">
                        {lang !== "ja" && currentSIM.providers.map((p, i) => (
                          <span
                            key={i}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {guideText(p, lang)}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentSIM.providersCn.map((p, i) => (
                          <span key={i} className="text-sm text-muted-foreground">
                            {guideText(p, lang)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Setup Steps */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-3"><Bi en="Setup Steps" zh="设置步骤" lang={lang} /></h4>
                      <ol className="space-y-2">
                        {lang !== "ja" && currentSIM.setupSteps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-green-500 font-bold">{i + 1}.</span>
                            <span>{guideText(step, lang)}</span>
                          </li>
                        ))}
                      </ol>
                      <div className="mt-3 pt-3 border-t space-y-1">
                        {currentSIM.setupStepsCn.map((step, i) => (
                          <p key={i} className="text-sm text-muted-foreground">
                            {jaText(step, lang)}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Where to Buy */}
                    <div className="bg-amber-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2"><Bi en="Where to Buy" zh="购买地点" lang={lang} /></h4>
                      <ul className="space-y-1">
                        {currentSIM.whereToBuy.map((loc, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-amber-500">📍</span>
                            <span>{guideText(loc, lang)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pros & Cons */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-lg p-3">
                        <h4 className="font-medium mb-2">{localized("✅ Pros", "✅ メリット", lang)}</h4>
                        <ul className="space-y-1">
                          {currentSIM.pros.map((pro, i) => (
                            <li key={i} className="text-sm">
                              {guideText(pro, lang)}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3">
                        <h4 className="font-medium mb-2">{localized("⚠️ Cons", "⚠️ デメリット", lang)}</h4>
                        <ul className="space-y-1">
                          {currentSIM.cons.map((con, i) => (
                            <li key={i} className="text-sm">
                              {guideText(con, lang)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-xl border p-12 text-center">
                  <span className="text-6xl mb-4 block">📱</span>
                  <h3 className="text-xl font-semibold mb-2">{localized("Select a SIM Option", "SIMオプションを選択", lang)}</h3>
                  <p className="text-muted-foreground">
                    {localized("Click on an option to see detailed information", "オプションをクリックすると詳細情報が表示されます", lang)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* APN Settings */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b">
              <h3 className="font-semibold text-lg">{localized("APN Settings by Carrier", "通信事業者別APN設定", lang)}</h3>
            </div>
            <div className="divide-y">
              {APN_SETTINGS.map((apn, idx) => (
                <div key={idx} className="p-4">
                  <h4 className="font-medium">{lang === "ja" ? CARRIER_JA[apn.carrier] || apn.carrier : guideText(apn.carrier, lang)}</h4>
                  <div className="grid md:grid-cols-4 gap-4 mt-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">APN:</span>
                      <p className="font-mono">{apn.apn}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">MMSC:</span>
                      <p className="font-mono text-xs">{apn.mmsc}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{localized("Proxy:", "プロキシ：", lang)}</span>
                      <p className="font-mono">{apn.proxy || "-"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{localized("Notes:", "メモ：", lang)}</span>
                      <p className="text-muted-foreground">{localized(apn.notes, apn.notes, lang)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VPN Tab */}
      {activeTab === "vpn" && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h3 className="font-semibold flex items-center gap-2">
              <span>⚠️</span> {localized("Important VPN Warning", "重要なVPN警告", lang)}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {localized("Download and set up your VPN BEFORE arriving in China. Most VPN websites are blocked domestically, and app stores may not have your preferred VPN. Install and test before departure.", "中国に到着する前にVPNをダウンロードして設定してください。国内では多くのVPNサイトがブロックされており、アプリストアに希望のVPNがない場合もあります。出発前にインストールしてテストしておきましょう。", lang)}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {VPN_OPTIONS.map((vpn) => (
              <div key={vpn.name} className="bg-card rounded-xl border overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 border-b flex items-center gap-4">
                  <span className="text-3xl">{vpn.icon}</span>
                  <div>
                    <h3 className="font-semibold">{guideText(vpn.name, lang)}</h3>
                    <p className="text-sm text-muted-foreground">{guideText(vpn.cost, lang)}</p>
                  </div>
                  <div className="ml-auto flex flex-col items-end gap-1">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        vpn.reliability === "high"
                          ? "bg-green-100 text-green-800"
                          : vpn.reliability === "medium"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {lang === "ja" ? RELIABILITY_JA[vpn.reliability] || vpn.reliability : localized(vpn.reliability + " reliability", vpn.reliability, lang)}
                    </span>
                    <span className="text-xs text-muted-foreground">{lang === "ja" ? SPEED_JA[vpn.speed] || vpn.speed : localized(vpn.speed + " speed", vpn.speed, lang)}</span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-medium text-sm">{localized("Features:", "機能：", lang)}</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {vpn.features.map((f, i) => (
                        <span key={i} className="text-xs bg-slate-100 px-2 py-1 rounded">
                          {guideText(f, lang)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {lang === "ja" ? "セットアップ難易度：" + (DIFFICULTY_JA[vpn.setupDifficulty] || vpn.setupDifficulty) : localized("Setup difficulty: ", "セットアップ難易度：", lang) + localized(vpn.setupDifficulty, vpn.setupDifficulty, lang)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Essential Apps Tab */}
      {activeTab === "apps" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="font-semibold flex items-center gap-2">
              <span>📱</span> {localized("Download Before Arrival", "到着前にダウンロード", lang)}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {localized("Google Play is blocked in China. Download these apps before arrival or use alternative app stores like Apple App Store, Huawei AppGallery, or directly from app websites.", "中国ではGoogle Playがブロックされています。到着前にこれらのアプリをダウンロードするか、Apple App Store、Huawei AppGalleryなどの代替ストア、またはアプリ公式サイトからダウンロードしてください。", lang)}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ESSENTIAL_APPS.map((app, idx) => (
              <div
                key={idx}
                className={`bg-card rounded-xl border p-4 ${app.essential ? "border-primary" : ""}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{app.icon}</span>
                  <div>
                    <h3 className="font-semibold">{app.app}</h3>
                    {app.essential && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                        {ct(lang, "badge_essential", "Essential")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mb-1">
                  {localized(app.category, app.categoryCn, lang)}
                </div>
                <p className="text-sm">{guideText(app.purpose, lang)}</p>
                <p className="text-xs text-muted-foreground mt-1">{jaText(app.purposeCn, lang)}</p>
                <div className="text-xs text-muted-foreground mt-2">{localized("Download: ", "ダウンロード：", lang)}{guideText(app.download, lang)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Setup Guide Tab */}
      {activeTab === "setup" && (
        <div className="space-y-4">
          {COMMUNICATION_SETUP_STEPS.map((step) => (
            <div key={step.step} className="bg-card rounded-xl border overflow-hidden">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-transparent border-b">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{localized(step.title, step.titleCn, lang)}</h3>
                  <p className="text-sm text-muted-foreground">{jaText(step.titleCn, lang)}</p>
                </div>
                <span className="text-3xl ml-auto">{step.icon}</span>
              </div>
              <div className="p-4">
                <p className="text-foreground mb-4">{localized(step.description, step.descriptionCn, lang)}</p>
                <p className="text-sm text-muted-foreground mb-4">{jaText(step.descriptionCn, lang)}</p>
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">{localized("Action Items:", "アクション項目：", lang)}</h4>
                  <ul className="space-y-2">
                    {step.actionItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-500">✓</span>
                        <span>{guideText(item, lang)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-3 border-t space-y-1">
                    {step.actionItemsCn.map((item, i) => (
                      <p key={i} className="text-sm text-muted-foreground">
                        {jaText(item, lang)}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Useful Phrases */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b">
              <h3 className="font-semibold text-lg">{localized("Useful Phrases", "便利なフレーズ", lang)}</h3>
            </div>
            <div className="divide-y">
              {COMMUNICATION_HELPERS.usefulPhrases.map((phrase, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between">
                  <span className="text-foreground">{guideText(phrase.english, lang)}</span>
                  <div className="text-right">
                    <span className="text-primary font-medium">{phrase.chinese}</span>
                    <p className="text-xs text-muted-foreground">{phrase.pronunciation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommunicationGuideClient;
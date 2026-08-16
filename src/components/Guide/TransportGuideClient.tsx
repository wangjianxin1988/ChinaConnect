import {
  ARRIVAL_STEPS,
  CITY_DISTANCE_TABLE,
  INTERCITY_TRANSPORT,
  LOCAL_TRANSPORT_MODES,
  TAXI_GUIDE,
  TRAIN_BOOKING_GUIDE,
  TRANSPORT_HELPERS,
} from "@/data/guide/transport";
import React, { useState } from "react";
import { type Language, translations } from "@/i18n/translations";
import { jaText, guideText, localized } from "./guide-i18n";;

interface TransportGuideClientProps {
  lang?: Language;
}

export function TransportGuideClient({ lang = "en" }: TransportGuideClientProps = {}) {
  const t = translations[lang] || translations.en;
  const tg = (t.transportGuide || translations.en.transportGuide || {}) as Record<string, string>;
  const [activeTab, setActiveTab] = useState("arrival");
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const tabs = [
    { id: "arrival", label: tg.tabArrival || "Arrival", icon: "✈️" },
    { id: "local", label: tg.tabLocal || "City Transport", icon: "🚇" },
    { id: "taxi", label: tg.tabTaxi || "Taxi/Didi", icon: "🚕" },
    { id: "intercity", label: tg.tabIntercity || "Inter-city", icon: "🚄" },
    { id: "trains", label: tg.tabTrains || "Train Booking", icon: "🚂" },
    { id: "distances", label: tg.tabDistances || "Distances", icon: "📏" },
    { id: "phrases", label: tg.tabPhrases || "Phrases", icon: "💬" }
  ];

  const currentMode =
    LOCAL_TRANSPORT_MODES.find((m) => m.mode === selectedMode) ||
    INTERCITY_TRANSPORT.find((m) => m.mode === selectedMode);

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

      {/* Arrival Tab */}
      {activeTab === "arrival" && (
        <div className="space-y-4">
          {ARRIVAL_STEPS.map((step) => (
            <div key={step.step} className="bg-card rounded-xl border overflow-hidden">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-transparent border-b">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{localized(step.title, step.titleCn, lang)}</h3>
                </div>
                <span className="text-3xl ml-auto">{step.icon}</span>
              </div>
              <div className="p-4">
                <p className="text-foreground mb-4">{localized(step.description, step.descriptionCn, lang)}</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {lang !== "ja" && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <span>📋</span> Steps
                    </h4>
                    <ul className="space-y-2">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-blue-500">{i + 1}.</span>
                          <span>{guideText(detail, lang)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  )}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <span>📋</span> {localized("Steps", "手順", lang)}
                    </h4>
                    <ul className="space-y-2">
                      {step.detailsCn.map((detail, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          {jaText(detail, lang)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Quick Reference */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="font-semibold flex items-center gap-2">
              <span>💡</span> {localized("Pro Tips", "プロのヒント", lang)}
            </h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-amber-600">•</span>
                <span>{tg.arrivalTip || "Keep arrival card safe - you'll need it for emigration"}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600">•</span>
                <span>{tg.didiTip || "Use Didi app for airport pickup - cheaper than taxi queue"}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600">•</span>
                <span>{tg.airportWifi || "Airport WiFi usually available - connect before buying SIM"}</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Local Transport Tab */}
      {activeTab === "local" && (
        <div className="space-y-4">
          {/* Transport Options */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 space-y-3">
              <h3 className="font-semibold">{tg.selectModeHeading || "Select Transport Mode"}</h3>
              {LOCAL_TRANSPORT_MODES.map((mode) => (
                <button
                  key={mode.mode}
                  onClick={() => setSelectedMode(mode.mode === selectedMode ? null : mode.mode)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedMode === mode.mode
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{mode.icon}</span>
                    <div>
                      <div className="font-medium">{mode.mode}</div>
                      <div className="text-sm text-muted-foreground">{mode.estimatedCost}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="lg:col-span-2">
              {currentMode && LOCAL_TRANSPORT_MODES.includes(currentMode as any) ? (
                <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b">
                    <div className="flex items-center gap-4">
                      <span className="text-5xl">{currentMode.icon}</span>
                      <div>
                        <h2 className="text-2xl font-bold">{currentMode.mode}</h2>
                        <p className="text-muted-foreground">{currentMode.estimatedCost}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    <p className="text-foreground">{currentMode.description}</p>
                    <p className="text-sm text-muted-foreground">{jaText(currentMode.descriptionCn, lang)}</p>

                    {/* How to Use */}
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <span>📖</span> {localized("How to Use", "使い方", lang)}
                      </h3>
                      <ol className="space-y-2">
                        {currentMode.howToUse.map((step, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">{i + 1}.</span>
                            <span>{guideText(step, lang)}</span>
                          </li>
                        ))}
                      </ol>
                      <div className="mt-4 pt-4 border-t space-y-1">
                        {currentMode.howToUseCn.map((step, i) => (
                          <p key={i} className="text-sm text-muted-foreground">
                            {jaText(step, lang)}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <span>💡</span> {localized("Pro Tips", "プロのヒント", lang)}
                      </h3>
                      <ul className="space-y-2">
                        {currentMode.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-green-500">✓</span>
                            <span>{guideText(tip, lang)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 pt-4 border-t space-y-1">
                        {currentMode.tipsCn.map((tip, i) => (
                          <p key={i} className="text-sm text-muted-foreground">
                            {jaText(tip, lang)}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-xl border p-12 text-center">
                  <span className="text-6xl mb-4 block">🚇</span>
                  <h3 className="text-xl font-semibold mb-2">{tg.selectMode || "Select a Transport Mode"}</h3>
                  <p className="text-muted-foreground">
                    {localized("Click on a transport option to see detailed guide", "交通手段をクリックすると詳細ガイドが表示されます", lang)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inter-city Tab */}
      {activeTab === "intercity" && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {INTERCITY_TRANSPORT.map((mode) => (
              <div key={mode.mode} className="bg-card rounded-xl border overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-purple-50/50 p-4 border-b flex items-center gap-4">
                  <span className="text-4xl">{mode.icon}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{mode.mode}</h3>
                    <p className="text-sm text-muted-foreground">{mode.estimatedCost}</p>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <p className="text-sm text-foreground">{mode.description}</p>
                  <p className="text-sm text-muted-foreground">{jaText(mode.descriptionCn, lang)}</p>

                  <div className="bg-slate-50 rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-2">{tg.howToUse || "How to Use:"}</h4>
                    <ul className="space-y-1">
                      {mode.howToUse.map((step, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-purple-500">{i + 1}.</span>
                          <span>{guideText(step, lang)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-2">{tg.proTips || "Pro Tips:"}</h4>
                    <ul className="space-y-1">
                      {mode.tips.map((tip, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-green-500">✓</span>
                          <span>{guideText(tip, lang)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Booking Platforms */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b">
              <h3 className="font-semibold text-lg">{tg.bookingPlatforms || "Booking Platforms"}</h3>
            </div>
            <div className="divide-y">
              <div className="p-4">
                <h4 className="font-medium">12306</h4>
                <p className="text-sm text-muted-foreground">
                  {localized("Official train booking (English version available)", "公式の列車予約（英語版あり）", lang)}
                </p>
              </div>
              <div className="p-4">
                <h4 className="font-medium">{tg.tripCta || "Trip.com / Ctrip"}</h4>
                <p className="text-sm text-muted-foreground">
                  {localized("All transport types with English interface", "英語インターフェースで全交通手段を予約可能", lang)}
                </p>
              </div>
              <div className="p-4">
                <h4 className="font-medium">Didi</h4>
                <p className="text-sm text-muted-foreground">
                  {localized("Ride-hailing for local transport and airport trips", "市内交通と空港送迎のライドシェア", lang)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Useful Phrases Tab */}
      {activeTab === "phrases" && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-xl">{tg.usefulPhrases || "Useful Transport Phrases"}</h2>
            </div>
            <div className="divide-y">
              {TRANSPORT_HELPERS.usefulPhrases.map((phrase, idx) => (
                <div key={idx} className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">{phrase.english}</span>
                    <span className="text-primary font-medium">{phrase.chinese}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Important Numbers */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h3 className="font-semibold flex items-center gap-2">
              <span>🚨</span> {localized("Emergency Transport Numbers", "緊急時の交通連絡先", lang)}
            </h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="font-medium">{localized("Police:", "警察：", lang)}</span>
                <span>110</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-medium">{localized("Ambulance:", "救急車：", lang)}</span>
                <span>120</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-medium">{localized("Fire:", "消防：", lang)}</span>
                <span>119</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Taxi/Didi Tab */}
      {activeTab === "taxi" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            {TAXI_GUIDE.types.map((type) => (
              <div key={type.type} className="bg-card rounded-xl border overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 border-b flex items-center gap-4">
                  <span className="text-4xl">{type.icon}</span>
                  <div>
                    <h3 className="font-semibold">{type.type}</h3>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-2">Price:</h4>
                    <p className="text-sm font-medium text-primary">{type.price}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Tips:</h4>
                    <ul className="space-y-1">
                      {type.tips.map((tip, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span>{guideText(tip, lang)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-xl">{tg.taxiPhrasesHeading || "Taxi Useful Phrases"}</h2>
            </div>
            <div className="divide-y">
              {TAXI_GUIDE.usefulPhrases.map((phrase, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between">
                  <span className="text-foreground">{phrase.english}</span>
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

      {/* Train Booking Tab */}
      {activeTab === "trains" && (
        <div className="space-y-6">
          {/* Booking Platforms */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-xl">Booking Platforms</h2>
            </div>
            <div className="divide-y">
              {TRAIN_BOOKING_GUIDE.platforms.map((platform) => (
                <div key={platform.name} className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{platform.icon}</span>
                    <div>
                      <h3 className="font-semibold">{platform.name}</h3>
                      <p className="text-xs text-muted-foreground">{platform.url}</p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground">{platform.description}</p>
                  <div className="grid md:grid-cols-2 gap-2 mt-2">
                    <p className="text-sm">
                      <span className="text-green-500">+</span> {platform.pros}
                    </p>
                    <p className="text-sm">
                      <span className="text-red-500">-</span> {platform.cons}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seat Classes */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-purple-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-xl">{tg.seatClassesHeading || "Seat Classes"}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-3">Class</th>
                    <th className="text-left p-3">Price</th>
                    <th className="text-left p-3">Features</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {TRAIN_BOOKING_GUIDE.seatClasses.map((seat) => (
                    <tr key={seat.class}>
                      <td className="p-3 font-medium">{seat.class}</td>
                      <td className="p-3">{seat.price}</td>
                      <td className="p-3">{seat.features.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-green-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-xl">{tg.trainBookingTipsHeading || "Train Booking Tips"}</h2>
            </div>
            <div className="divide-y">
              {TRAIN_BOOKING_GUIDE.tips.map((tip, idx) => (
                <div key={idx} className="p-4 flex items-center gap-4">
                  <span className="text-2xl">{tip.icon}</span>
                  <span className="text-sm">{tip.tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Distances Tab */}
      {activeTab === "distances" && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-xl">{tg.cityDistanceHeading || "City Distance & Travel Time"}</h2>
              <p className="text-sm text-muted-foreground">
                Compare train vs plane for popular routes
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-3">From</th>
                    <th className="text-left p-3">To</th>
                    <th className="text-left p-3">{tg.byTrainLabel || "By Train"}</th>
                    <th className="text-left p-3">{tg.byPlaneLabel || "By Plane"}</th>
                    <th className="text-left p-3">Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {CITY_DISTANCE_TABLE.map((row, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-medium">{row.from}</td>
                      <td className="p-3 font-medium">{row.to}</td>
                      <td className="p-3 text-blue-600">{row.byTrain}</td>
                      <td className="p-3 text-muted-foreground">{row.byPlane}</td>
                      <td className="p-3 text-sm">{row.recommendation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransportGuideClient;
import {
  APN_SETTINGS,
  COMMUNICATION_HELPERS,
  COMMUNICATION_SETUP_STEPS,
  ESSENTIAL_APPS,
  SIM_OPTIONS,
  VPN_OPTIONS,
} from "@/data/guide/communication";
import React, { useState } from "react";

export function CommunicationGuideClient() {
  const [activeTab, setActiveTab] = useState("sim");
  const [selectedSIM, setSelectedSIM] = useState<string | null>(null);

  const tabs = [
    { id: "sim", label: "SIM/eSIM Options", icon: "📱" },
    { id: "vpn", label: "VPN Setup", icon: "🔐" },
    { id: "apps", label: "Essential Apps", icon: "📲" },
    { id: "setup", label: "Setup Guide", icon: "⚙️" },
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
              <h3 className="font-semibold">Select Option</h3>
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
                      <div className="font-medium">{sim.type}</div>
                      <div className="text-sm text-muted-foreground">{sim.costCn}</div>
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
                        <h2 className="text-2xl font-bold">{currentSIM.type}</h2>
                        <p className="text-muted-foreground">{currentSIM.cost}</p>
                        <p className="text-sm text-muted-foreground">{currentSIM.costCn}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-foreground">{currentSIM.description}</p>
                    <p className="text-sm text-muted-foreground">{currentSIM.descriptionCn}</p>

                    {/* Providers */}
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Providers / 运营商</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentSIM.providers.map((p, i) => (
                          <span
                            key={i}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentSIM.providersCn.map((p, i) => (
                          <span key={i} className="text-sm text-muted-foreground">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Setup Steps */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Setup Steps / 设置步骤</h4>
                      <ol className="space-y-2">
                        {currentSIM.setupSteps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-green-500 font-bold">{i + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                      <div className="mt-3 pt-3 border-t space-y-1">
                        {currentSIM.setupStepsCn.map((step, i) => (
                          <p key={i} className="text-sm text-muted-foreground">
                            {step}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Where to Buy */}
                    <div className="bg-amber-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Where to Buy / 购买地点</h4>
                      <ul className="space-y-1">
                        {currentSIM.whereToBuy.map((loc, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-amber-500">📍</span>
                            <span>{loc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pros & Cons */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-lg p-3">
                        <h4 className="font-medium mb-2">✅ Pros</h4>
                        <ul className="space-y-1">
                          {currentSIM.pros.map((pro, i) => (
                            <li key={i} className="text-sm">
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3">
                        <h4 className="font-medium mb-2">⚠️ Cons</h4>
                        <ul className="space-y-1">
                          {currentSIM.cons.map((con, i) => (
                            <li key={i} className="text-sm">
                              {con}
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
                  <h3 className="text-xl font-semibold mb-2">Select a SIM Option</h3>
                  <p className="text-muted-foreground">
                    Click on an option to see detailed information
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* APN Settings */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b">
              <h3 className="font-semibold text-lg">APN Settings by Carrier</h3>
            </div>
            <div className="divide-y">
              {APN_SETTINGS.map((apn, idx) => (
                <div key={idx} className="p-4">
                  <h4 className="font-medium">{apn.carrier}</h4>
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
                      <span className="text-muted-foreground">Proxy:</span>
                      <p className="font-mono">{apn.proxy || "-"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Notes:</span>
                      <p className="text-muted-foreground">{apn.notes}</p>
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
              <span>⚠️</span> Important VPN Warning
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Download and set up your VPN BEFORE arriving in China. Most VPN websites are blocked
              domestically, and app stores may not have your preferred VPN. Install and test before
              departure.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {VPN_OPTIONS.map((vpn) => (
              <div key={vpn.name} className="bg-card rounded-xl border overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 border-b flex items-center gap-4">
                  <span className="text-3xl">{vpn.icon}</span>
                  <div>
                    <h3 className="font-semibold">{vpn.name}</h3>
                    <p className="text-sm text-muted-foreground">{vpn.cost}</p>
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
                      {vpn.reliability} reliability
                    </span>
                    <span className="text-xs text-muted-foreground">{vpn.speed} speed</span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-medium text-sm">Features:</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {vpn.features.map((f, i) => (
                        <span key={i} className="text-xs bg-slate-100 px-2 py-1 rounded">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Setup difficulty: {vpn.setupDifficulty}
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
              <span>📱</span> Download Before Arrival
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Google Play is blocked in China. Download these apps before arrival or use alternative
              app stores like Apple App Store, Huawei AppGallery, or directly from app websites.
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
                        Essential
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mb-1">
                  {app.category} / {app.categoryCn}
                </div>
                <p className="text-sm">{app.purpose}</p>
                <p className="text-xs text-muted-foreground mt-1">{app.purposeCn}</p>
                <div className="text-xs text-muted-foreground mt-2">Download: {app.download}</div>
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
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.titleCn}</p>
                </div>
                <span className="text-3xl ml-auto">{step.icon}</span>
              </div>
              <div className="p-4">
                <p className="text-foreground mb-4">{step.description}</p>
                <p className="text-sm text-muted-foreground mb-4">{step.descriptionCn}</p>
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Action Items:</h4>
                  <ul className="space-y-2">
                    {step.actionItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-500">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-3 border-t space-y-1">
                    {step.actionItemsCn.map((item, i) => (
                      <p key={i} className="text-sm text-muted-foreground">
                        {item}
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
              <h3 className="font-semibold text-lg">Useful Phrases</h3>
            </div>
            <div className="divide-y">
              {COMMUNICATION_HELPERS.usefulPhrases.map((phrase, idx) => (
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
    </div>
  );
}

export default CommunicationGuideClient;

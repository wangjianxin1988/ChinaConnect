import { SCAM_TYPES, SEVERITY_COLORS, SEVERITY_LABELS } from "@/data/scam-prevention";
import React, { useState } from "react";
import { type Language, translations } from "@/i18n/translations";
import { jaText, Bi, localized, guideText } from "./guide-i18n";;

const JA_SEV: Record<string, string> = { high: "高リスク", medium: "中リスク", low: "低リスク" };

export function ScamPreventionClient({ lang = "en" }: { lang?: Language } = {}) { const t = translations[lang] || translations.en; const tg = (t.scamPrevention || translations.en.scamPrevention || {}) as Record<string, string>;
  const [selectedScam, setSelectedScam] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    signs: true,
    prevention: true,
    whatToDo: true,
  });

  const filteredScams =
    filterSeverity === "all" ? SCAM_TYPES : SCAM_TYPES.filter((s) => s.severity === filterSeverity);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const currentScam = SCAM_TYPES.find((s) => s.id === selectedScam);

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 bg-card p-4 rounded-lg border">
        <span className="text-sm font-medium mr-2">{localized("Filter by severity:", "深刻度で絞り込み：", lang)}</span>
        {["all", "high", "medium", "low"].map((severity) => (
          <button
            key={severity}
            onClick={() => setFilterSeverity(severity)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterSeverity === severity
                ? "bg-primary text-primary-foreground"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {severity === "all" ? (localized("All", "すべて", lang)) : (lang === "ja" ? JA_SEV[severity] : localized(SEVERITY_LABELS[severity as keyof typeof SEVERITY_LABELS], severity, lang))}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Scam List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-lg font-semibold">{localized("Common Scams", "よくある詐欺", lang)}</h2>
          <div className="space-y-2">
            {filteredScams.map((scam) => (
              <button
                key={scam.id}
                onClick={() => setSelectedScam(scam.id === selectedScam ? null : scam.id)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedScam === scam.id
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{scam.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{localized(scam.title, scam.titleCn, lang)}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      SEVERITY_COLORS[scam.severity]
                    }`}
                  >
                    {lang === "ja" ? JA_SEV[scam.severity] : localized(scam.severity, scam.severity, lang)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Scam Detail */}
        <div className="lg:col-span-2">
          {currentScam ? (
            <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{currentScam.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold">{localized(currentScam.title, currentScam.titleCn, lang)}</h2>
                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                        SEVERITY_COLORS[currentScam.severity]
                      }`}
                    >
                      {lang === "ja" ? JA_SEV[currentScam.severity] : localized(SEVERITY_LABELS[currentScam.severity], currentScam.severity, lang)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-6 border-b">
                {lang !== "ja" && <p className="text-foreground">{guideText(currentScam.description, lang)}</p>}
                <p className="text-muted-foreground mt-2">{jaText(currentScam.descriptionCn, lang)}</p>
              </div>

              {/* Signs */}
              <div className="border-b">
                <button
                  onClick={() => toggleSection("signs")}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🚩</span>
                    <span className="font-semibold">{localized("Warning Signs", "警告サイン", lang)}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {expandedSections.signs ? "▲" : "▼"}
                  </span>
                </button>
                {expandedSections.signs && (
                  <div className="px-4 pb-4">
                    <div className="grid md:grid-cols-2 gap-3">
                      {currentScam.signs.map((sign, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">⚠️</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t space-y-1">
                      {currentScam.signsCn.map((sign, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground">
                          {jaText(sign, lang)}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Prevention */}
              <div className="border-b">
                <button
                  onClick={() => toggleSection("prevention")}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🛡️</span>
                    <span className="font-semibold">{localized("Prevention", "予防方法", lang)}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {expandedSections.prevention ? "▲" : "▼"}
                  </span>
                </button>
                {expandedSections.prevention && (
                  <div className="px-4 pb-4">
                    <div className="grid gap-3">
                      {currentScam.prevention.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t space-y-1">
                      {currentScam.preventionCn.map((tip, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground">
                          {jaText(tip, lang)}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* What To Do */}
              <div className="border-b">
                <button
                  onClick={() => toggleSection("whatToDo")}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📋</span>
                    <span className="font-semibold">{localized("What To Do", "対処方法", lang)}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {expandedSections.whatToDo ? "▲" : "▼"}
                  </span>
                </button>
                {expandedSections.whatToDo && (
                  <div className="px-4 pb-4">
                    <div className="grid gap-3">
                      {currentScam.whatToDo.map((action, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">{idx + 1}.</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t space-y-1">
                      {currentScam.whatToDoCn.map((action, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground">
                          {jaText(action, lang)}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Examples */}
              <div className="p-6 bg-slate-50">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span>💬</span><Bi en="Real Examples" zh="真实案例" lang={lang} /></h3>
                <div className="space-y-3">
                  {currentScam.examples.map((example, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border">
                      <p className="text-sm">{example}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {jaText(currentScam.examplesCn[idx], lang)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-xl border p-12 text-center">
              <span className="text-6xl mb-4 block">🛡️</span>
              <h3 className="text-xl font-semibold mb-2">{localized("Select a Scam Type", "詐欺の種類を選択", lang)}</h3>
              <p className="text-muted-foreground">
                {localized("Choose a scam from the list to see detailed information", "リストから詐欺を選択すると詳細情報が表示されます", lang)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ScamPreventionClient;

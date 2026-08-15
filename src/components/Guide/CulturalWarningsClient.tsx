// @ts-nocheck
import { CULTURAL_WARNINGS, IMPORTANCE_STYLES } from "@/data/cultural-warnings";
import React, { useState } from "react";
import { type Language, translations } from "@/i18n/translations";
import { jaText, guideText } from "./guide-i18n";

export function CulturalWarningsClient({ lang = "en" }: { lang?: Language } = {}) { const t = translations[lang] || translations.en; const tg = (t.culturalWarnings || translations.en.culturalWarnings || {}) as Record<string, string>;
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeImportance, setActiveImportance] = useState("all");

  const categories = [
    { id: "all", label: "All", labelJa: "すべて", icon: "📋" },
    { id: "Numbers", label: "Numbers", labelJa: "数字", icon: "🔢" },
    { id: "Colors", label: "Colors", labelJa: "色", icon: "🎨" },
    { id: "Gift Etiquette", label: "Gifts", labelJa: "ギフト", icon: "🎁" },
    { id: "Dining", label: "Dining", labelJa: "食事", icon: "🍽️" },
    { id: "Social", label: "Social", labelJa: "交流", icon: "💬" },
    { id: "Photography", label: "Photo", labelJa: "写真", icon: "📷" },
    { id: "General", label: "General", labelJa: "全般", icon: "📌" },
  ];

  const filteredWarnings = CULTURAL_WARNINGS.filter((w) => {
    const categoryMatch = activeCategory === "all" || w.category === activeCategory;
    const importanceMatch = activeImportance === "all" || w.importance === activeImportance;
    return categoryMatch && importanceMatch;
  });

  const groupedWarnings = filteredWarnings.reduce(
    (acc, warning) => {
      if (!acc[warning.category]) {
        acc[warning.category] = [];
      }
      acc[warning.category].push(warning);
      return acc;
    },
    {} as Record<string, typeof CULTURAL_WARNINGS>,
  );

  return (
    <div className="space-y-6">
      {/* Importance Filter */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium mr-2 py-2">{lang === "ja" ? "重要度:" : "Importance:"}</span>
        {[
          { id: "all", label: "All", labelJa: "すべて" },
          { id: "critical", label: "Critical", labelJa: "重大", style: IMPORTANCE_STYLES.critical },
          { id: "warning", label: "Warning", labelJa: "警告", style: IMPORTANCE_STYLES.warning },
          { id: "note", label: "Note", labelJa: "メモ", style: IMPORTANCE_STYLES.note },
        ].map((imp) => (
          <button
            key={imp.id}
            onClick={() => setActiveImportance(imp.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeImportance === imp.id
                ? imp.style
                  ? `${imp.style.bg} ${imp.style.text} border`
                  : "bg-primary text-primary-foreground"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {imp.id !== "all" && <span className="mr-1">{imp.style.icon}</span>}
            {lang === "ja" ? imp.labelJa : imp.label}
          </button>
        ))}
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{lang === "ja" ? cat.labelJa : cat.label}</span>
          </button>
        ))}
      </div>

      {/* Warnings Grid */}
      <div className="grid gap-6">
        {Object.entries(groupedWarnings).map(([category, warnings]) => (
          <div key={category} className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-lg">{lang === "ja" ? (categories.find((x) => x.id === category)?.labelJa || category) : category}</h2>
            </div>
            <div className="divide-y">
              {warnings.map((warning) => {
                const style = IMPORTANCE_STYLES[warning.importance];
                return (
                  <div
                    key={warning.id}
                    className={`p-4 ${style.bg} border-l-4`}
                    style={{
                      borderLeftColor:
                        warning.importance === "critical"
                          ? "#dc2626"
                          : warning.importance === "warning"
                            ? "#f59e0b"
                            : "#3b82f6",
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{warning.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{lang === "ja" ? jaText(warning.titleCn, lang) : warning.title}</h3>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}
                          >
                            {lang === "ja" ? (style.labelCn === "重要" ? "重大" : style.labelCn === "注意" ? "警告" : "メモ") : style.label}
                          </span>
                        </div>
                        {lang !== "ja" && <p className="text-sm text-muted-foreground mb-2">{jaText(warning.titleCn, lang)}</p>}
                        <p className="text-foreground">{lang === "ja" ? jaText(warning.descriptionCn, lang) : guideText(warning.description, lang)}</p>
                        {lang !== "ja" && <p className="text-muted-foreground mt-1">{jaText(warning.descriptionCn, lang)}</p>}
                        {warning.region && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium">{lang === "ja" ? "地域: " : "Region: "}</span>
                            <span className="text-muted-foreground">
                              {lang === "ja" ? jaText(warning.regionCn, lang) : <>{warning.region} ({jaText(warning.regionCn, lang)})</>}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {filteredWarnings.length === 0 && (
        <div className="text-center py-12 bg-card rounded-xl border">
          <span className="text-6xl mb-4 block">🔍</span>
          <h3 className="text-xl font-semibold mb-2">{lang === "ja" ? "警告は見つかりませんでした" : "No warnings found"}</h3>
          <p className="text-muted-foreground">{lang === "ja" ? "フィルターを調整してください" : "Try adjusting your filters"}</p>
        </div>
      )}
    </div>
  );
}

export default CulturalWarningsClient;
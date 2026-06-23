// @ts-nocheck
import { CULTURAL_WARNINGS, IMPORTANCE_STYLES } from "@/data/cultural-warnings";
import React, { useState } from "react";

export function CulturalWarningsClient() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeImportance, setActiveImportance] = useState("all");

  const categories = [
    { id: "all", label: "All", icon: "📋" },
    { id: "Numbers", label: "Numbers", icon: "🔢" },
    { id: "Colors", label: "Colors", icon: "🎨" },
    { id: "Gift Etiquette", label: "Gifts", icon: "🎁" },
    { id: "Dining", label: "Dining", icon: "🍽️" },
    { id: "Social", label: "Social", icon: "💬" },
    { id: "Photography", label: "Photo", icon: "📷" },
    { id: "General", label: "General", icon: "📌" },
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
        <span className="text-sm font-medium mr-2 py-2">Importance:</span>
        {[
          { id: "all", label: "All" },
          { id: "critical", label: "Critical", style: IMPORTANCE_STYLES.critical },
          { id: "warning", label: "Warning", style: IMPORTANCE_STYLES.warning },
          { id: "note", label: "Note", style: IMPORTANCE_STYLES.note },
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
            {imp.label}
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
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Warnings Grid */}
      <div className="grid gap-6">
        {Object.entries(groupedWarnings).map(([category, warnings]) => (
          <div key={category} className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-lg">{category}</h2>
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
                          <h3 className="font-semibold text-lg">{warning.title}</h3>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}
                          >
                            {style.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{warning.titleCn}</p>
                        <p className="text-foreground">{warning.description}</p>
                        <p className="text-muted-foreground mt-1">{warning.descriptionCn}</p>
                        {warning.region && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium">Region: </span>
                            <span className="text-muted-foreground">
                              {warning.region} ({warning.regionCn})
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
          <h3 className="text-xl font-semibold mb-2">No warnings found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}

export default CulturalWarningsClient;

import { EXPO_CALENDAR, EXPO_CATEGORIES, YEAR_MONTHS } from "@/data/guide/business/expo-calendar";
import React, { useState } from "react";

export function ExpoCalendarClient() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [expandedExpo, setExpandedExpo] = useState<string | null>(null);

  const filteredExpos = EXPO_CALENDAR.filter((expo) => {
    const categoryMatch = selectedCategory === "all" || expo.category === selectedCategory;
    const monthMatch = selectedMonth === null || expo.months.includes(selectedMonth);
    return categoryMatch && monthMatch;
  });

  const toggleExpo = (id: string) => {
    setExpandedExpo((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-start gap-4">
          <span className="text-5xl">📅</span>
          <div>
            <h2 className="text-2xl font-bold mb-2">China Expo Calendar 2026</h2>
            <p className="text-indigo-100 max-w-2xl">
              Plan your business trips around China&apos;s most important trade shows and
              exhibitions. From the Canton Fair to industry-specific events across major cities.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        {/* Category Filter */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Category / 类别</h3>
          <div className="flex flex-wrap gap-2">
            {EXPO_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat.label}
                <span className="ml-1 opacity-70 text-xs">{cat.labelCn}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Month Filter */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Month / 月份</h3>
          <div className="flex flex-wrap gap-2">
            {YEAR_MONTHS.map((m) => (
              <button
                key={m.month}
                onClick={() => setSelectedMonth(selectedMonth === m.month ? null : m.month)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedMonth === m.month
                    ? "bg-purple-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {m.label}
                <span className="ml-1 opacity-70 text-xs">{m.labelCn}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-card rounded-xl border p-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredExpos.length} event{filteredExpos.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Expo Cards */}
      <div className="grid gap-4">
        {filteredExpos.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border">
            <span className="text-5xl mb-4 block">🔍</span>
            <p className="text-muted-foreground">No events found for the selected filters.</p>
            <p className="text-muted-foreground text-sm">请尝试其他筛选条件</p>
          </div>
        ) : (
          filteredExpos.map((expo) => (
            <div
              key={expo.id}
              className="bg-card rounded-xl border overflow-hidden hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => toggleExpo(expo.id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 transition-colors"
              >
                {/* Month Badges */}
                <div className="flex flex-col gap-1 shrink-0">
                  {expo.months.map((m) => {
                    const month = YEAR_MONTHS.find((ym) => ym.month === m);
                    return (
                      <span
                        key={m}
                        className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-xs font-medium text-center"
                      >
                        {month?.label}
                      </span>
                    );
                  })}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{getCategoryEmoji(expo.category)}</span>
                    <h3 className="font-semibold text-lg">{expo.name}</h3>
                  </div>
                  <p className="text-sm text-primary font-medium">{expo.nameCn}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <span>📍 {expo.city}</span>
                    <span>🏢 {expo.venue}</span>
                    <span>🔁 {expo.frequency}</span>
                  </div>
                </div>

                <span className="text-muted-foreground shrink-0">
                  {expandedExpo === expo.id ? "▲" : "▼"}
                </span>
              </button>

              {expandedExpo === expo.id && (
                <div className="px-5 pb-5 border-t">
                  <div className="grid md:grid-cols-2 gap-6 mt-5">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <span>🌐</span> Description
                      </h4>
                      <p className="text-sm text-foreground mb-3">{expo.description}</p>
                      <p className="text-sm text-muted-foreground">{expo.descriptionCn}</p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <span>🔗</span> Quick Info
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-slate-50 p-2 rounded">
                          <span className="text-muted-foreground block text-xs">City</span>
                          <span className="font-medium">{expo.city}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded">
                          <span className="text-muted-foreground block text-xs">Frequency</span>
                          <span className="font-medium">{expo.frequency}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded md:col-span-2">
                          <span className="text-muted-foreground block text-xs">Venue</span>
                          <span className="font-medium">{expo.venue}</span>
                        </div>
                      </div>
                      {expo.website && (
                        <a
                          href={expo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <span>🌐</span>
                          Visit Official Website
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Canton Fair Spotlight */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <span className="text-4xl">⭐</span>
          <div>
            <h3 className="text-xl font-bold text-amber-900 mb-1">
              Canton Fair Spotlight / 广交会亮点
            </h3>
            <p className="text-amber-800 text-sm mb-3">
              The China Import and Export Fair (Canton Fair) is the oldest, largest, and most
              successful trade fair in China. Held every spring and autumn in Guangzhou.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium">
                Spring: April 15 – May 5, 2026
              </span>
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium">
                Autumn: October 15 – November 4, 2026
              </span>
            </div>
            <a
              href="https://www.cantonfair.org.cn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 text-amber-700 hover:text-amber-900 font-semibold"
            >
              Register & Learn More →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    comprehensive: "🌐",
    furniture: "🪑",
    electronics: "💻",
    automotive: "🚗",
    apparel: "👔",
    medical: "🏥",
    industrial: "🏭",
    trade: "🤝",
  };
  return map[category] || "📋";
}

export default ExpoCalendarClient;

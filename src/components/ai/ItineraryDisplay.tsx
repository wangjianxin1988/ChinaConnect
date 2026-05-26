/**
 * ItineraryDisplay Component
 * Displays saved travel itineraries in a structured, visual format
 */

import type { DailyPlan, SavedItinerary } from "@/lib/ai/types";
import React, { useState, useCallback } from "react";

interface ItineraryDisplayProps {
  itinerary: SavedItinerary | null;
  language?: "en" | "zh" | "ja" | "ko";
  onSave?: (name: string) => void;
  onExport?: (format: "text" | "json") => void;
  onShare?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

const LABEL = {
  en: {
    save: "Save",
    export: "Export",
    share: "Share",
    delete: "Delete",
    saved: "Saved",
    overview: "Overview",
    daily: "Daily Plan",
    practical: "Practical Info",
    highlights: "Top Highlights",
    budget: "Budget Breakdown",
    total: "Total",
    day: "Day",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    accommodation: "Accommodation",
    transport: "Transport",
    noItinerary: "No itinerary to display",
    generateFirst: "Generate an itinerary first by chatting with the AI.",
  },
  zh: {
    save: "保存",
    export: "导出",
    share: "分享",
    delete: "删除",
    saved: "已保存",
    overview: "概览",
    daily: "每日行程",
    practical: "实用信息",
    highlights: "亮点",
    budget: "预算明细",
    total: "总计",
    day: "第",
    morning: "上午",
    afternoon: "下午",
    evening: "晚上",
    breakfast: "早餐",
    lunch: "午餐",
    dinner: "晚餐",
    accommodation: "住宿",
    transport: "交通",
    noItinerary: "暂无行程",
    generateFirst: "请先与AI对话生成行程。",
  },
};

export const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({
  itinerary,
  language = "en",
  onSave,
  onExport,
  onShare,
  onDelete,
  compact = false,
}) => {
  const labels = LABEL[language] || LABEL.en;
  const [activeTab, setActiveTab] = useState<"overview" | "daily" | "practical">("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleSaveClick = useCallback(() => {
    if (itinerary?.id?.startsWith("temp_")) {
      setShowSaveDialog(true);
      setEditName(itinerary.name);
    } else if (onSave && !itinerary?.id?.startsWith("temp_")) {
      onSave(itinerary.name);
    }
  }, [itinerary, onSave]);

  const handleSaveConfirm = useCallback(() => {
    if (editName.trim() && onSave) {
      onSave(editName.trim());
      setShowSaveDialog(false);
    }
  }, [editName, onSave]);

  // No itinerary to display
  if (!itinerary) {
    return (
      <div className={`${compact ? "p-4" : "p-6"} bg-gray-50 rounded-xl text-center`}>
        <div className="text-4xl mb-3">🗺️</div>
        <h3 className="font-semibold text-gray-700 mb-2">{labels.noItinerary}</h3>
        <p className="text-sm text-gray-500">{labels.generateFirst}</p>
      </div>
    );
  }

  const summary = itinerary.data?.summary;
  const daily = itinerary.data?.dailyItinerary || [];
  const isSaved = !itinerary.id?.startsWith("temp_");

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${compact ? "" : "shadow-sm"}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">{itinerary.name}</h2>
            <p className="text-blue-100 text-sm mt-1">
              {summary?.destination || itinerary.destination} &middot; {itinerary.days}{" "}
              {language === "zh" ? "天" : "days"}
            </p>
          </div>
          {isSaved && (
            <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs">
              ✓ {labels.saved}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSaveClick}
            className="flex-1 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            {labels.save}
          </button>

          <button
            onClick={() => onExport?.("text")}
            className="flex-1 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {labels.export}
          </button>

          {isSaved && (
            <button
              onClick={onShare}
              className="flex-1 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              {labels.share}
            </button>
          )}

          {isSaved && onDelete && (
            <button
              onClick={onDelete}
              className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm transition-colors"
              title={labels.delete}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <nav className="flex">
          {(["overview", "daily", "practical"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
              }`}
            >
              {labels[tab as keyof typeof labels] || tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Highlights */}
            {summary?.topHighlights && summary.topHighlights.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-xl">⭐</span> {labels.highlights}
                </h3>
                <ul className="space-y-1">
                  {summary.topHighlights.slice(0, 5).map((h, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Budget */}
            {summary?.estimatedTotalCost && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-xl">💰</span> {labels.budget}
                </h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {summary.estimatedTotalCost.toLocaleString()} {summary.currency || "CNY"}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {summary.costBreakdown &&
                      Object.entries(summary.costBreakdown).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-gray-600">
                          <span className="capitalize">{key}</span>
                          <span className="font-medium">{Number(value).toLocaleString()}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            {summary?.travelTips && summary.travelTips.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-xl">💡</span> Travel Tips
                </h3>
                <ul className="space-y-1">
                  {summary.travelTips.slice(0, 4).map((tip, i) => (
                    <li key={i} className="text-sm text-gray-600">
                      • {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Daily Tab */}
        {activeTab === "daily" && (
          <div className="space-y-4">
            {daily.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">
                {language === "zh"
                  ? "每日行程详情将在完整规划后显示"
                  : "Daily details will appear after full planning"}
              </p>
            ) : (
              daily.map((day: DailyPlan) => (
                <div key={day.day} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
                      {day.day}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-800">{day.theme}</div>
                      <div className="text-xs text-gray-500">
                        {day.dailyCost ? `${day.dailyCost} CNY` : ""}
                      </div>
                    </div>
                  </div>

                  {/* Locations */}
                  {day.locations && day.locations.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {day.locations.map((loc, i) => (
                        <div key={i} className="text-sm">
                          <div className="font-medium text-gray-700">{loc.name}</div>
                          <div className="text-xs text-gray-500">
                            {loc.bestTimeStart} - {loc.bestTimeEnd} · {loc.ticketInfo.price}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Meals */}
                  <div className="flex gap-2 text-xs">
                    {day.meals?.breakfast && (
                      <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded">
                        🌅 {day.meals.breakfast.name}
                      </span>
                    )}
                    {day.meals?.lunch && (
                      <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                        ☀️ {day.meals.lunch.name}
                      </span>
                    )}
                    {day.meals?.dinner && (
                      <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">
                        🌙 {day.meals.dinner.name}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Practical Tab */}
        {activeTab === "practical" && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-800 mb-2">⚠️ Visa Information</h4>
              <p className="text-sm text-amber-700">
                Most nationalities require a visa. Tourist (L) visa recommended. Apply 2-4 weeks
                before travel.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">💳 Payment</h4>
              <p className="text-sm text-green-700">
                Use Alipay or WeChat Pay for most payments. Keep some cash as backup. International
                cards accepted at hotels and large restaurants.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">📱 SIM Card</h4>
              <p className="text-sm text-blue-700">
                Get a local SIM at the airport or convenience stores. China Mobile, Unicom, and
                Telecom offer tourist plans.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">🚇 Transport</h4>
              <p className="text-sm text-gray-600">
                High-speed trains are efficient. Download Didi app for taxis. Metro available in all
                major cities.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">🆘 Emergency</h4>
              <div className="text-sm text-red-700 space-y-1">
                <div>🚑 Ambulance: 120</div>
                <div>🚔 Police: 110</div>
                <div>🔥 Fire: 119</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
            <h3 className="font-semibold text-lg mb-4">{labels.save} Itinerary</h3>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Itinerary name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfirm}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {labels.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryDisplay;

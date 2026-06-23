/**
 * ItineraryDisplay Component
 * Beautiful day-by-day itinerary cards with timeline layout
 * No dangerouslySetInnerHTML - all safe rendering via React
 */

import type { DailyPlan, MealPlan, SavedItinerary } from "@/lib/ai/types";
import React, { useState, useCallback } from "react";

// ============================================
// Types
// ============================================

interface ItineraryDisplayProps {
  itinerary: SavedItinerary | null;
  // LABEL table is only translated for en/zh; ja/ko falls back to en at runtime.
  language?: "en" | "zh";
  onSave?: (name: string) => void;
  onExport?: (format: "text" | "json") => void;
  onShare?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

// ============================================
// Labels
// ============================================

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
    perDay: "per day",
    days: "days",
    cuisine: "Cuisine",
    priceRange: "Price",
    recommended: "Recommended dishes",
    reservation: "Reservation required",
    insiderTip: "Insider tip",
    duration: "Duration",
    tickets: "Tickets",
    bookNow: "Booking required",
    from: "from",
    to: "to",
    cost: "Cost",
    perNight: "/night",
    stars: "Stars",
    nearestMetro: "Nearest metro",
    map: "View on map",
    cancel: "Cancel",
    saveItinerary: "Save Itinerary",
    itineraryName: "Itinerary name",
    accommodationLabel: "🏨 Accommodation",
    transportLabel: "🚇 Transport",
    foodLabel: "🍜 Food",
    attractionsLabel: "🎫 Attractions",
    emergencyTitle: "Emergency Contacts",
    visaTitle: "Visa Information",
    paymentTitle: "Payment",
    simTitle: "SIM Card",
    transportTitle: "Transport",
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
    perDay: "每天",
    days: "天",
    cuisine: "菜系",
    priceRange: "价格",
    recommended: "推荐菜品",
    reservation: "需要预约",
    insiderTip: "内行建议",
    duration: "游玩时长",
    tickets: "门票",
    bookNow: "需要预约",
    from: "从",
    to: "到",
    cost: "费用",
    perNight: "/晚",
    stars: "星级",
    nearestMetro: "最近地铁站",
    map: "查看地图",
    cancel: "取消",
    saveItinerary: "保存行程",
    itineraryName: "行程名称",
    accommodationLabel: "🏨 住宿",
    transportLabel: "🚇 交通",
    foodLabel: "🍜 餐饮",
    attractionsLabel: "🎫 景点",
    emergencyTitle: "紧急联系",
    visaTitle: "签证信息",
    paymentTitle: "支付方式",
    simTitle: "电话卡",
    transportTitle: "交通出行",
  },
};

// ============================================
// Sub-components
// ============================================

const ClockIcon: React.FC = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MapPinIcon: React.FC = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const TicketIcon: React.FC = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
);

const StarIcon: React.FC<{ filled?: boolean }> = ({ filled }) => (
  <svg className={`w-3.5 h-3.5 ${filled ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// ============================================
// Meal Card Component
// ============================================

const MealCard: React.FC<{
  meal: MealPlan;
  label: string;
  icon: string;
  labels: typeof LABEL.en;
}> = ({ meal, label, icon, labels }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-lg">{icon}</span>
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
    </div>
    <div className="font-medium text-gray-800 text-sm">{meal.name}</div>
    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
      <span className="text-orange-500">🍽</span>
      <span>{labels.cuisine}: {meal.cuisine}</span>
    </div>
    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
      <span className="text-green-500">💰</span>
      <span>{labels.priceRange}: {meal.priceRange}</span>
    </div>
    {meal.recommendedDishes && meal.recommendedDishes.length > 0 && (
      <div className="mt-2">
        <div className="text-xs text-gray-400 mb-1">{labels.recommended}:</div>
        <div className="flex flex-wrap gap-1">
          {meal.recommendedDishes.map((dish, i) => (
            <span key={i} className="bg-orange-50 text-orange-700 text-xs px-2 py-0.5 rounded-full">
              {dish}
            </span>
          ))}
        </div>
      </div>
    )}
    {meal.location && (
      <div className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
        <MapPinIcon />
        <span>{meal.location}</span>
        {meal.distanceFromAttraction && <span className="text-gray-300">· {meal.distanceFromAttraction}</span>}
      </div>
    )}
    {meal.reservationRequired && (
      <div className="mt-1.5">
        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">📋 {labels.reservation}</span>
      </div>
    )}
  </div>
);

// ============================================
// Timeline Activity Component
// ============================================

const TimelineActivity: React.FC<{
  location: NonNullable<DailyPlan["locations"]>[number];
  index: number;
  isLast: boolean;
  labels: typeof LABEL.en;
}> = ({ location, index, isLast, labels }) => (
  <div className="flex gap-3">
    {/* Timeline line */}
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
        {index + 1}
      </div>
      {!isLast && <div className="w-0.5 flex-1 bg-gradient-to-b from-blue-200 to-gray-100 mt-1" />}
    </div>

    {/* Activity card */}
    <div
      className="flex-1 pb-5"
      data-lat={location.coordinates?.lat}
      data-lng={location.coordinates?.lng}
      data-name={location.name}
    >
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
        {/* Time & Name */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium mb-1">
              <ClockIcon />
              <span>{location.bestTimeStart} – {location.bestTimeEnd}</span>
            </div>
            <h4 className="font-semibold text-gray-800 text-sm">{location.name}</h4>
            {location.nameZh && <p className="text-xs text-gray-400">{location.nameZh}</p>}
          </div>
          {location.ticketInfo?.price && (
            <span className="shrink-0 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-lg font-medium">
              🎫 {location.ticketInfo.price}
            </span>
          )}
        </div>

        {/* Duration */}
        {location.durationHours && (
          <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <span>⏱</span>
            <span>{labels.duration}: {location.durationHours}h</span>
          </div>
        )}

        {/* Highlights */}
        {location.highlights && location.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {location.highlights.slice(0, 3).map((h, i) => (
              <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                ✨ {h}
              </span>
            ))}
          </div>
        )}

        {/* Booking notice */}
        {location.ticketInfo?.bookingRequired && (
          <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg mb-2">
            ⚠️ {labels.bookNow}
            {location.ticketInfo.bookingUrl && (
              <a href={location.ticketInfo.bookingUrl} target="_blank" rel="noopener" className="ml-1 underline">
                →
              </a>
            )}
          </div>
        )}

        {/* Insider tip */}
        {location.insiderTip && (
          <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg mt-1">
            💡 <span className="font-medium">{labels.insiderTip}:</span> {location.insiderTip}
          </div>
        )}
      </div>
    </div>
  </div>
);

// ============================================
// Day Card Component
// ============================================

const DayCard: React.FC<{
  day: DailyPlan;
  labels: typeof LABEL.en;
  language: string;
}> = ({ day, labels, language }) => {
  const [expanded, setExpanded] = useState(day.day <= 2); // First 2 days expanded

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Day Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors text-left"
      >
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex flex-col items-center justify-center text-white shadow-lg shrink-0">
          <span className="text-[10px] uppercase tracking-wider opacity-80">{labels.day}</span>
          <span className="text-xl font-bold leading-none">{day.day}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 text-base truncate">{day.theme}</h3>
          {day.dailyCost > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">
              ¥{day.dailyCost.toLocaleString()} {labels.perDay}
            </p>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Transport to attractions */}
          {day.transportToAttractions && (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              <span>🚇</span>
              <span className="font-medium">{labels.transport}:</span>
              <span>{day.transportToAttractions.route}</span>
              {day.transportToAttractions.duration && <span>· {day.transportToAttractions.duration}</span>}
              {day.transportToAttractions.cost && <span className="text-green-600 font-medium">· {day.transportToAttractions.cost}</span>}
            </div>
          )}

          {/* Timeline */}
          <div className="ml-2">
            {day.locations && day.locations.length > 0 ? (
              day.locations.map((loc, i) => (
                <TimelineActivity
                  key={i}
                  location={loc}
                  index={i}
                  isLast={i === day.locations!.length - 1}
                  labels={labels}
                />
              ))
            ) : (
              <p className="text-sm text-gray-400 pl-10">—</p>
            )}
          </div>

          {/* Meals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {day.meals?.breakfast && (
              <MealCard meal={day.meals.breakfast} label={labels.breakfast} icon="🌅" labels={labels} />
            )}
            {day.meals?.lunch && (
              <MealCard meal={day.meals.lunch} label={labels.lunch} icon="☀️" labels={labels} />
            )}
            {day.meals?.dinner && (
              <MealCard meal={day.meals.dinner} label={labels.dinner} icon="🌙" labels={labels} />
            )}
          </div>

          {/* Accommodation */}
          {day.accommodation && (
            <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🏨</span>
                <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">{labels.accommodation}</span>
              </div>
              <div className="font-medium text-gray-800">{day.accommodation.name}</div>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} filled={i < day.accommodation!.stars} />
                  ))}
                </div>
                <span className="text-indigo-600 font-medium">{day.accommodation.pricePerNight}{labels.perNight}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <MapPinIcon />
                <span>{day.accommodation.location}</span>
                {day.accommodation.nearestMetro && <span className="text-gray-400">· 🚇 {day.accommodation.nearestMetro}</span>}
              </div>
              {day.accommodation.highlights && day.accommodation.highlights.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {day.accommodation.highlights.map((h, i) => (
                    <span key={i} className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">{h}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// Budget Section Component
// ============================================

const BudgetBreakdown: React.FC<{
  costBreakdown: NonNullable<SavedItinerary["data"]["summary"]["costBreakdown"]>;
  estimatedTotalCost: number;
  currency: string;
  labels: typeof LABEL.en;
}> = ({ costBreakdown, estimatedTotalCost, currency, labels }) => {
  const items = [
    { key: "accommodation", label: labels.accommodationLabel, color: "bg-indigo-500", bgColor: "bg-indigo-50", textColor: "text-indigo-700" },
    { key: "food", label: labels.foodLabel, color: "bg-orange-500", bgColor: "bg-orange-50", textColor: "text-orange-700" },
    { key: "transport", label: labels.transportLabel, color: "bg-blue-500", bgColor: "bg-blue-50", textColor: "text-blue-700" },
    { key: "attractions", label: labels.attractionsLabel, color: "bg-green-500", bgColor: "bg-green-50", textColor: "text-green-700" },
  ] as const;

  const total = Object.values(costBreakdown).reduce((sum, v) => sum + Number(v), 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <span className="text-xl">💰</span>
        {labels.budget}
      </h3>

      {/* Total */}
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-gray-900">
          {currency === "CNY" ? "¥" : currency} {estimatedTotalCost.toLocaleString()}
        </div>
        <div className="text-sm text-gray-500">{labels.total}</div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="flex h-3 rounded-full overflow-hidden mb-4 bg-gray-100">
          {items.map((item) => {
            const value = Number(costBreakdown[item.key as keyof typeof costBreakdown] || 0);
            const pct = (value / total) * 100;
            return pct > 0 ? (
              <div key={item.key} className={`${item.color} transition-all`} style={{ width: `${pct}%` }} title={`${item.label}: ${value}`} />
            ) : null;
          })}
        </div>
      )}

      {/* Breakdown items */}
      <div className="space-y-2">
        {items.map((item) => {
          const value = Number(costBreakdown[item.key as keyof typeof costBreakdown] || 0);
          const pct = total > 0 ? Math.round((value / total) * 100) : 0;
          return (
            <div key={item.key} className={`flex items-center justify-between ${item.bgColor} rounded-lg px-3 py-2`}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className={`text-sm font-medium ${item.textColor}`}>{item.label}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-gray-800">
                  {currency === "CNY" ? "¥" : currency} {value.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 ml-1">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// Practical Info Section
// ============================================

const PracticalInfoSection: React.FC<{ labels: typeof LABEL.en }> = ({ labels }) => (
  <div className="space-y-3">
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <h4 className="font-semibold text-amber-800 mb-2">⚠️ {labels.visaTitle}</h4>
      <p className="text-sm text-amber-700">
        Most nationalities require a visa. Tourist (L) visa recommended. Apply 2–4 weeks before travel.
      </p>
    </div>
    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
      <h4 className="font-semibold text-green-800 mb-2">💳 {labels.paymentTitle}</h4>
      <p className="text-sm text-green-700">
        Use Alipay or WeChat Pay for most payments. Keep some cash as backup. International cards accepted at hotels and large restaurants.
      </p>
    </div>
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <h4 className="font-semibold text-blue-800 mb-2">📱 {labels.simTitle}</h4>
      <p className="text-sm text-blue-700">
        Get a local SIM at the airport or convenience stores. China Mobile, Unicom, and Telecom offer tourist plans.
      </p>
    </div>
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
      <h4 className="font-semibold text-gray-800 mb-2">🚇 {labels.transportTitle}</h4>
      <p className="text-sm text-gray-600">
        High-speed trains are efficient. Download Didi app for taxis. Metro available in all major cities.
      </p>
    </div>
    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
      <h4 className="font-semibold text-red-800 mb-2">🆘 {labels.emergencyTitle}</h4>
      <div className="text-sm text-red-700 space-y-1">
        <div>🚑 Ambulance: 120</div>
        <div>🚔 Police: 110</div>
        <div>🔥 Fire: 119</div>
      </div>
    </div>
  </div>
);

// ============================================
// Main Component
// ============================================

export const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({
  itinerary,
  language = "en",
  onSave,
  onExport,
  onShare,
  onDelete,
  compact = false,
}) => {
  const labels = (LABEL[language] || LABEL.en) as typeof LABEL.en;
  const [activeTab, setActiveTab] = useState<"overview" | "daily" | "practical">("daily");
  const [editName, setEditName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleSaveClick = useCallback(() => {
    if (!itinerary) return;
    if (itinerary.id?.startsWith("temp_")) {
      setShowSaveDialog(true);
      setEditName(itinerary.name);
    } else if (onSave) {
      onSave(itinerary.name);
    }
  }, [itinerary, onSave]);

  const handleSaveConfirm = useCallback(() => {
    if (editName.trim() && onSave) {
      onSave(editName.trim());
      setShowSaveDialog(false);
    }
  }, [editName, onSave]);

  // No itinerary
  if (!itinerary) {
    return (
      <div className={`${compact ? "p-4" : "p-8"} bg-gray-50 rounded-xl text-center`}>
        <div className="text-5xl mb-4">🗺️</div>
        <h3 className="font-semibold text-gray-700 mb-2">{labels.noItinerary}</h3>
        <p className="text-sm text-gray-500">{labels.generateFirst}</p>
      </div>
    );
  }

  const summary = itinerary.data?.summary;
  const daily = itinerary.data?.dailyItinerary || [];
  const practical = itinerary.data?.practicalInfo || [];
  const isSaved = !itinerary.id?.startsWith("temp_");

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden ${compact ? "" : "shadow-sm"}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">{itinerary.name}</h2>
            <p className="text-blue-100 text-sm mt-1">
              {summary?.destination || itinerary.destination} · {itinerary.days} {labels.days}
            </p>
          </div>
          {isSaved && (
            <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium">
              ✓ {labels.saved}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSaveClick}
            className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            {labels.save}
          </button>
          <button
            onClick={() => onExport?.("text")}
            className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {labels.export}
          </button>
          {isSaved && (
            <button
              onClick={onShare}
              className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {labels.share}
            </button>
          )}
          {isSaved && onDelete && (
            <button
              onClick={onDelete}
              className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm rounded-lg text-sm transition-colors"
              title={labels.delete}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
        <nav className="flex px-2">
          {(["daily", "overview", "practical"] as const).map((tab) => (
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
      <div className={`p-4 ${compact ? "max-h-96" : "max-h-[70vh]"} overflow-y-auto`}>
        {/* Daily Tab */}
        {activeTab === "daily" && (
          <div className="space-y-4">
            {daily.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-gray-500 text-sm">
                  {language === "zh" ? "每日行程详情将在完整规划后显示" : "Daily details will appear after full planning"}
                </p>
              </div>
            ) : (
              daily.map((day: DailyPlan) => (
                <DayCard key={day.day} day={day} labels={labels} language={language} />
              ))
            )}
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-5">
            {/* Highlights */}
            {summary?.topHighlights && summary.topHighlights.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-xl">⭐</span> {labels.highlights}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {summary.topHighlights.slice(0, 6).map((h, i) => (
                    <div key={i} className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2 text-sm text-gray-700">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="truncate">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Budget */}
            {summary?.estimatedTotalCost && summary?.costBreakdown && (
              <BudgetBreakdown
                costBreakdown={summary.costBreakdown}
                estimatedTotalCost={summary.estimatedTotalCost}
                currency={summary.currency || "CNY"}
                labels={labels}
              />
            )}

            {/* Tips */}
            {summary?.travelTips && summary.travelTips.length > 0 && (
              <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
                <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <span className="text-xl">💡</span> Travel Tips
                </h3>
                <ul className="space-y-2">
                  {summary.travelTips.map((tip, i) => (
                    <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Practical Tab */}
        {activeTab === "practical" && <PracticalInfoSection labels={labels} />}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowSaveDialog(false)}>
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">{labels.saveItinerary}</h3>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder={labels.itineraryName}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSaveConfirm()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                {labels.cancel}
              </button>
              <button
                onClick={handleSaveConfirm}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
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

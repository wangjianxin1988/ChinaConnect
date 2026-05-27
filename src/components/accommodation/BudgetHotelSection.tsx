/**
 * BudgetHotelSection Component
 * 平价酒店板块组件 - 用于城市详情页
 */

import type { BudgetHotelType } from "@/types/accommodation";
import React, { useMemo, useState } from "react";
import { BudgetHotelCard } from "./BudgetHotelCard";
import type { BudgetHotelCardData } from "./BudgetHotelCard";

interface BudgetHotelSectionProps {
  hotels: BudgetHotelCardData[];
  citySlug: string;
  cityName: string;
}

const FILTER_TYPES: { value: BudgetHotelType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "budget_hostel", label: "Hostel" },
  { value: "economy_hotel", label: "Economy Hotel" },
  { value: "motel", label: "Motel" },
];

const PRICE_RANGES: { value: [number, number] | null; label: string }[] = [
  { value: null, label: "Any Price" },
  { value: [0, 100], label: "Under ¥100" },
  { value: [100, 150], label: "¥100 - ¥150" },
  { value: [150, 200], label: "¥150 - ¥200" },
  { value: [200, 300], label: "¥200 - ¥300" },
];

export function BudgetHotelSection({ hotels }: BudgetHotelSectionProps) {
  const [selectedType, setSelectedType] = useState<BudgetHotelType | "all">("all");
  const [selectedPrice, setSelectedPrice] = useState<[number, number] | null>(null);
  const [showOnlyMetro, setShowOnlyMetro] = useState(false);
  const [showOnlyForeignerFriendly, setShowOnlyForeignerFriendly] = useState(false);
  const [sortBy, setSortBy] = useState<"rating" | "price_low" | "price_high">("rating");

  // Filter and sort hotels
  const filteredHotels = useMemo(() => {
    let result = [...hotels];

    // Filter by type
    if (selectedType !== "all") {
      result = result.filter((h) => h.type === selectedType);
    }

    // Filter by price range
    if (selectedPrice) {
      const [min, max] = selectedPrice;
      result = result.filter((h) => h.avgPrice >= min && h.avgPrice <= max);
    }

    // Filter by metro nearby
    if (showOnlyMetro) {
      result = result.filter((h) => h.metro !== undefined);
    }

    // Filter by foreigner friendly
    if (showOnlyForeignerFriendly) {
      result = result.filter((h) => h.foreignerFriendly);
    }

    // Sort
    switch (sortBy) {
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "price_low":
        result.sort((a, b) => a.avgPrice - b.avgPrice);
        break;
      case "price_high":
        result.sort((a, b) => b.avgPrice - a.avgPrice);
        break;
    }

    return result;
  }, [hotels, selectedType, selectedPrice, showOnlyMetro, showOnlyForeignerFriendly, sortBy]);

  const handleTypeFilter = (type: BudgetHotelType | "all") => {
    setSelectedType(type);
  };

  const handlePriceFilter = (price: [number, number] | null) => {
    setSelectedPrice(price);
  };

  const resetFilters = () => {
    setSelectedType("all");
    setSelectedPrice(null);
    setShowOnlyMetro(false);
    setShowOnlyForeignerFriendly(false);
  };

  const hasActiveFilters =
    selectedType !== "all" || selectedPrice !== null || showOnlyMetro || showOnlyForeignerFriendly;

  return (
    <div>
      {/* Section header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🏨</span>
          <h3 className="text-xl font-bold text-gray-900">Budget Hotels</h3>
          <span className="px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            ¥100-300
          </span>
        </div>
        <p className="text-gray-600 text-sm">
          Affordable stays near metro stations, foreigner-friendly
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        {/* Type filter */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Type</h4>
          <div className="flex flex-wrap gap-2">
            {FILTER_TYPES.map((filter) => (
              <button
                type="button"
                key={filter.value}
                onClick={() => handleTypeFilter(filter.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  selectedType === filter.value
                    ? "bg-blue-50 text-blue-700 border-blue-200 ring-2 ring-blue-200"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price filter */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Price Range
          </h4>
          <div className="flex flex-wrap gap-2">
            {PRICE_RANGES.map((range) => (
              <button
                type="button"
                key={range.label}
                onClick={() => handlePriceFilter(range.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  JSON.stringify(selectedPrice) === JSON.stringify(range.value)
                    ? "bg-blue-50 text-blue-700 border-blue-200 ring-2 ring-blue-200"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Additional filters */}
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyMetro}
              onChange={(e) => setShowOnlyMetro(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Near Metro</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyForeignerFriendly}
              onChange={(e) => setShowOnlyForeignerFriendly(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Foreigner Friendly</span>
          </label>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              <span>✕</span>
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Sort bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredHotels.length}</span> of{" "}
          {hotels.length} hotels
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
          >
            <option value="rating">Highest Rated</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Hotel list */}
      {filteredHotels.length > 0 ? (
        <div className="grid gap-4">
          {filteredHotels.map((hotel) => (
            <BudgetHotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="text-4xl mb-3">🏨</div>
          <h4 className="text-lg font-semibold text-gray-700 mb-2">No hotels found</h4>
          <p className="text-gray-500 text-sm mb-4">
            Try adjusting your filters to see more options
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Info box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <span>💡</span>
          <span>Booking Tips</span>
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Budget hotels in China often have good quality despite low prices</li>
          <li>• Hostels are great for meeting other travelers</li>
          <li>• Economy hotels (like 如家, 汉庭) offer private rooms at budget prices</li>
          <li>
            • Most accept international credit cards, but Alipay/WeChat Pay is more convenient
          </li>
          <li>• Book directly through the hotel's official channel for better rates</li>
        </ul>
      </div>
    </div>
  );
}

export default BudgetHotelSection;

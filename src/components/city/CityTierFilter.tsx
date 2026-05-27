"use client";

import { TIER_CONFIG } from "@/data/cities/tier-data";
import type { CityTier } from "@/data/cities/types";
import React, { useState } from "react";

export interface TierFilterOption {
  tier: CityTier | "all";
  label: string;
  count?: number;
}

interface CityTierFilterProps {
  onFilterChange?: (selectedTiers: CityTier[]) => void;
  options?: TierFilterOption[];
  defaultSelected?: CityTier[];
  showCounts?: boolean;
}

export function CityTierFilter({
  onFilterChange,
  options,
  defaultSelected = ["S", "A", "D"],
  showCounts = true,
}: CityTierFilterProps) {
  const [selectedTiers, setSelectedTiers] = useState<CityTier[]>(defaultSelected);

  const defaultOptions: TierFilterOption[] = [
    { tier: "S", label: "S-Tier", count: 35 },
    { tier: "A", label: "A-Tier", count: options ? undefined : 250 },
    { tier: "D", label: "D-Tier", count: options ? undefined : 2900 },
    { tier: "all", label: "All Cities" },
  ];

  const filterOptions = options || defaultOptions;

  const toggleTier = (tier: CityTier) => {
    const newSelected = selectedTiers.includes(tier)
      ? selectedTiers.filter((t) => t !== tier)
      : [...selectedTiers, tier];

    // Ensure at least one tier is selected
    if (newSelected.length > 0) {
      setSelectedTiers(newSelected);
      onFilterChange?.(newSelected);
    }
  };

  const selectAll = () => {
    const allTiers: CityTier[] = ["S", "A", "D"];
    setSelectedTiers(allTiers);
    onFilterChange?.(allTiers);
  };

  const clearAll = () => {
    setSelectedTiers([]);
    onFilterChange?.([]);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Label */}
      <span className="text-sm font-medium text-gray-700 mr-1">Tier:</span>

      {/* Filter buttons */}
      {filterOptions
        .filter((opt) => opt.tier !== "all")
        .map((option) => {
          const tier = option.tier as CityTier;
          const isSelected = selectedTiers.includes(tier);
          const config = TIER_CONFIG[tier];

          return (
            <button
              key={tier}
              type="button"
              onClick={() => toggleTier(tier)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                border transition-all duration-200
                ${
                  isSelected
                    ? `${config.bgColor} ${config.color} border-current shadow-sm`
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }
              `}
            >
              {/* Tier icon */}
              <span className={isSelected ? "opacity-100" : "opacity-60"}>
                {tier === "S" && (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    role="img"
                    aria-label="S-Tier"
                  >
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                )}
                {tier === "A" && (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    role="img"
                    aria-label="A-Tier"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                )}
                {tier === "D" && (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    role="img"
                    aria-label="D-Tier"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                )}
              </span>
              <span>{option.label}</span>
              {showCounts && option.count !== undefined && (
                <span
                  className={`
                    ml-1 px-1.5 py-0.5 rounded-full text-xs
                    ${isSelected ? "bg-white/50" : "bg-gray-100"}
                  `}
                >
                  {option.count}
                </span>
              )}
            </button>
          );
        })}

      {/* All/None quick actions */}
      <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-200">
        <button
          type="button"
          onClick={selectAll}
          className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
        >
          All
        </button>
        <span className="text-gray-300">|</span>
        <button
          type="button"
          onClick={clearAll}
          className="text-xs text-gray-500 hover:text-gray-700 hover:underline"
        >
          None
        </button>
      </div>
    </div>
  );
}

/**
 * Compact tier filter for inline use
 */
export function CityTierFilterCompact({
  onFilterChange,
}: {
  onFilterChange?: (selectedTiers: CityTier[]) => void;
}) {
  const [selectedTiers, setSelectedTiers] = useState<CityTier[]>(["S"]);

  const toggleTier = (tier: CityTier) => {
    const newSelected = selectedTiers.includes(tier)
      ? selectedTiers.filter((t) => t !== tier)
      : [...selectedTiers, tier];

    if (newSelected.length > 0) {
      setSelectedTiers(newSelected);
      onFilterChange?.(newSelected);
    }
  };

  return (
    <div className="inline-flex items-center gap-1">
      {(["S", "A", "D"] as CityTier[]).map((tier) => {
        const config = TIER_CONFIG[tier];
        const isSelected = selectedTiers.includes(tier);

        return (
          <button
            key={tier}
            type="button"
            onClick={() => toggleTier(tier)}
            className={`
              w-8 h-8 rounded-lg text-sm font-bold border transition-all
              ${isSelected ? `${config.bgColor} ${config.color} border-current` : "bg-gray-50 text-gray-400 border-gray-200"}`}
            title={config.description}
          >
            {tier}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Tier sort dropdown
 */
export type TierSortOption = "priority" | "tier" | "name" | "region";

export function CityTierSortDropdown({
  value,
  onChange,
}: {
  value: TierSortOption;
  onChange: (option: TierSortOption) => void;
}) {
  const options: { value: TierSortOption; label: string }[] = [
    { value: "priority", label: "Recommended" },
    { value: "tier", label: "Tier (S → D)" },
    { value: "name", label: "Name (A-Z)" },
    { value: "region", label: "Region" },
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as TierSortOption)}
      className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export default CityTierFilter;

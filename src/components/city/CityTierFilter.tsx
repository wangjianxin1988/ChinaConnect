"use client";

import { TIER_CONFIG } from "@/data/cities/tier-data";
import type { CityTier } from "@/data/cities/types";
import { ct } from "@/i18n/components-strings";
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
  tierLabel?: string;
  allLabel?: string;
  noneLabel?: string;
  lang?: string;
}

export function CityTierFilter({
  onFilterChange,
  options,
  defaultSelected = ["S", "A", "B", "C", "D"],
  showCounts = true,
  tierLabel,
  allLabel,
  noneLabel,
  lang = "en",
}: CityTierFilterProps) {
  const [selectedTiers, setSelectedTiers] = useState<CityTier[]>(defaultSelected);

  const resolvedTierLabel = tierLabel ?? ct(lang, "tier_label", "Tier:");
  const resolvedAllLabel = allLabel ?? ct(lang, "tier_all", "All");
  const resolvedNoneLabel = noneLabel ?? ct(lang, "tier_none", "None");

  const defaultOptions: TierFilterOption[] = [
    { tier: "S", label: ct(lang, "tier_short_s", "S-Tier"), count: 35 },
    { tier: "A", label: ct(lang, "tier_short_a", "A-Tier"), count: options ? undefined : 250 },
    { tier: "B", label: ct(lang, "tier_short_b", "B-Tier"), count: options ? undefined : 500 },
    { tier: "C", label: ct(lang, "tier_short_c", "C-Tier"), count: options ? undefined : 1500 },
    { tier: "D", label: ct(lang, "tier_short_d", "D-Tier"), count: options ? undefined : 2900 },
  ];

  const filterOptions = options || defaultOptions;

  const toggleTier = (tier: CityTier) => {
    const newSelected = selectedTiers.includes(tier)
      ? selectedTiers.filter((t) => t !== tier)
      : [...selectedTiers, tier];
    if (newSelected.length > 0) {
      setSelectedTiers(newSelected);
      onFilterChange?.(newSelected);
    }
  };

  const selectAll = () => {
    const allTiers: CityTier[] = ["S", "A", "B", "C", "D"];
    setSelectedTiers(allTiers);
    onFilterChange?.(allTiers);
  };

  const clearAll = () => {
    setSelectedTiers([]);
    onFilterChange?.([]);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-700 mr-1">{resolvedTierLabel}</span>
      {filterOptions.map((option) => {
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
            <span className={isSelected ? "opacity-100" : "opacity-60"}>
              {tier === "S" && (
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  role="img"
                  aria-label={`${tier}-Tier`}
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
                  aria-label={`${tier}-Tier`}
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              )}
              {tier === "B" && (
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  role="img"
                  aria-label={`${tier}-Tier`}
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              )}
              {tier === "C" && (
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  role="img"
                  aria-label={`${tier}-Tier`}
                >
                  <path d="M12 2L2 22h20L12 2zm0 4l7.53 14H4.47L12 6z" />
                </svg>
              )}
              {tier === "D" && (
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  role="img"
                  aria-label={`${tier}-Tier`}
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

      <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-200">
        <button
          type="button"
          onClick={selectAll}
          className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
        >
          {resolvedAllLabel}
        </button>
        <span className="text-gray-300">|</span>
        <button
          type="button"
          onClick={clearAll}
          className="text-xs text-gray-500 hover:text-gray-700 hover:underline"
        >
          {resolvedNoneLabel}
        </button>
      </div>
    </div>
  );
}

export function CityTierFilterCompact({
  onFilterChange,
  lang = "en",
}: {
  onFilterChange?: (selectedTiers: CityTier[]) => void;
  lang?: string;
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
      {(["S", "A", "B", "C", "D"] as CityTier[]).map((tier) => {
        const config = TIER_CONFIG[tier];
        const isSelected = selectedTiers.includes(tier);
        const keyMap = {
          S: "tier_short_s",
          A: "tier_short_a",
          B: "tier_short_b",
          C: "tier_short_c",
          D: "tier_short_d",
        };
        return (
          <button
            key={tier}
            type="button"
            onClick={() => toggleTier(tier)}
            className={`w-8 h-8 rounded-lg text-sm font-bold border transition-all ${isSelected ? `${config.bgColor} ${config.color} border-current` : "bg-gray-50 text-gray-400 border-gray-200"}`}
            title={ct(lang, keyMap[tier], tier + "-Tier")}
          >
            {tier}
          </button>
        );
      })}
    </div>
  );
}

export type TierSortOption = "priority" | "tier" | "name" | "region";

export interface TierSortLabels {
  priority?: string;
  tier?: string;
  name?: string;
  region?: string;
}

export function CityTierSortDropdown({
  value,
  onChange,
  labels,
}: {
  value: TierSortOption;
  onChange: (option: TierSortOption) => void;
  labels?: TierSortLabels;
}) {
  const options = [
    { value: "priority", label: labels?.priority || "Recommended" },
    { value: "tier", label: labels?.tier || "Tier (S -> D)" },
    { value: "name", label: labels?.name || "Name (A-Z)" },
    { value: "region", label: labels?.region || "Region" },
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

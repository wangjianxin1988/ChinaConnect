/**
 * HotelCategoryFilter Component
 * 酒店分类筛选组件 - 横向滚动的分类按钮
 *
 * Categories: 全部 / 豪华 / 中端 / 经济 / 青年旅舍 / 情趣 / 电竞
 */

import React, { useCallback, useRef } from "react";
import {
  HOTEL_CATEGORY_CONFIG,
  type HotelCategory,
} from "./HotelCard";

// ─── Props ───────────────────────────────────────────────────────

interface HotelCategoryFilterProps {
  /** Currently active category, null = "全部" */
  activeCategory: HotelCategory | null;
  /** Callback when category changes */
  onChange: (category: HotelCategory | null) => void;
  /** Optional: show counts per category */
  counts?: Partial<Record<HotelCategory, number>>;
}

// ─── "All" button config ─────────────────────────────────────────

const ALL_CONFIG = {
  label: "全部",
  labelEn: "All",
  icon: "🏨",
};

// ─── Component ───────────────────────────────────────────────────

export function HotelCategoryFilter({
  activeCategory,
  onChange,
  counts,
}: HotelCategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const isActive = activeCategory === null;

  const handleClick = useCallback(
    (cat: HotelCategory | null) => {
      onChange(cat);
    },
    [onChange],
  );

  // Build button list: "All" + each category
  const categories: Array<{ key: HotelCategory | null; label: string; icon: string }> = [
    { key: null, label: ALL_CONFIG.label, icon: ALL_CONFIG.icon },
    ...Object.entries(HOTEL_CATEGORY_CONFIG).map(([key, cfg]) => ({
      key: key as HotelCategory,
      label: cfg.label,
      icon: cfg.icon,
    })),
  ];

  return (
    <div className="relative">
      {/* Horizontal scrollable container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {categories.map(({ key, label, icon }) => {
          const active = activeCategory === key;
          const count = key && counts ? counts[key] : undefined;

          return (
            <button
              key={key ?? "all"}
              onClick={() => handleClick(key)}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                whitespace-nowrap shrink-0 transition-all duration-200 touch-manipulation
                ${
                  active
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
                }
              `}
              aria-pressed={active}
            >
              <span className="text-base">{icon}</span>
              <span>{label}</span>
              {count != null && count > 0 && (
                <span
                  className={`
                    ml-0.5 px-1.5 py-0 rounded-full text-xs font-semibold
                    ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}
                  `}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Fade-out edges for scroll hint */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
    </div>
  );
}

export default HotelCategoryFilter;

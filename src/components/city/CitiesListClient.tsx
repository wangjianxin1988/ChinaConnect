"use client";

import { S_TIER_CITIES, TIER_CONFIG } from "@/data/cities/tier-data";
import type { CityTier } from "@/data/cities/types";
import type { City } from "@/data/cities/types";
import { type CityScoreDisplay, fetchCityScores } from "@/lib/city-sources/city-scores-api";
import React, { useState, useMemo, useEffect } from "react";
import { CityTierBadge } from "./CityTierBadge";
import { CityTierFilter, CityTierSortDropdown, type TierSortOption } from "./CityTierFilter";

interface CitiesListClientProps {
  citiesMeta: Array<{
    slug: string;
    name: string;
    nameZh: string;
    description: string;
  }>;
  citiesData: City[];
}

export function CitiesListClient({ citiesMeta, citiesData }: CitiesListClientProps) {
  const [selectedTiers, setSelectedTiers] = useState<CityTier[]>(["S", "A", "B", "C", "D"]);
  const [sortBy, setSortBy] = useState<TierSortOption>("priority");
  const [searchQuery, setSearchQuery] = useState("");
  const [cityScores, setCityScores] = useState<Record<string, CityScoreDisplay>>({});
  const [_scoresLoading, setScoresLoading] = useState(true);
  // Lazy loading: start with 12 cities, load more on scroll
  const [visibleCount, setVisibleCount] = useState(12);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  // Fetch city scores from Supabase on mount
  useEffect(() => {
    async function loadScores() {
      try {
        const scores = await fetchCityScores();
        const scoresMap: Record<string, CityScoreDisplay> = {};
        for (const score of scores) {
          scoresMap[score.slug] = score;
        }
        setCityScores(scoresMap);
      } catch (error) {
        console.error("Failed to fetch city scores:", error);
      } finally {
        setScoresLoading(false);
      }
    }
    loadScores();
  }, []);

  // Build city data with tier info, cover images, and scores from Supabase
  const citiesWithTier = useMemo(() => {
    return citiesMeta.map((meta) => {
      const tierMeta = S_TIER_CITIES[meta.slug];
      const cityData = citiesData.find((c) => c.slug === meta.slug);
      const dbScore = cityScores[meta.slug];

      // Use score from Supabase if available, otherwise fall back to tier-data
      return {
        ...meta,
        tier: dbScore?.tier || tierMeta?.tier || ("D" as CityTier),
        priority: tierMeta?.priority || 999,
        region: tierMeta?.region || "Other",
        tags: tierMeta?.tags || [],
        coverImage: cityData?.coverImage,
        // Prefer Supabase score over static data
        compositeScore: dbScore?.compositeScore ?? tierMeta?.compositeScore,
        overallRank: dbScore?.rank ?? tierMeta?.overallRank,
        // Also store dimension scores if available
        economyScore: dbScore?.economyScore,
        internationalScore: dbScore?.internationalScore,
        tourismScore: dbScore?.tourismScore,
        livabilityScore: dbScore?.livabilityScore,
      };
    });
  }, [citiesMeta, citiesData, cityScores]);

  // Reset visible count when filters/search change
  useEffect(() => {
    setVisibleCount(12);
  }, [selectedTiers, searchQuery, sortBy]);



  // Filter cities
  const filteredCities = useMemo(() => {
    return citiesWithTier.filter((city) => {
      // Tier filter
      if (!selectedTiers.includes(city.tier)) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          city.name.toLowerCase().includes(query) ||
          city.nameZh.includes(query) ||
          city.description.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [citiesWithTier, selectedTiers, searchQuery]);

  // Sort cities
  const sortedCities = useMemo(() => {
    const sorted = [...filteredCities];

    switch (sortBy) {
      case "priority":
        sorted.sort((a, b) => {
          // S-tier always first, then by priority
          if (a.tier !== b.tier) {
            const tierOrder = { S: 0, A: 1, B: 2, C: 3, D: 4 };
            return tierOrder[a.tier] - tierOrder[b.tier];
          }
          return a.priority - b.priority;
        });
        break;
      case "tier":
        sorted.sort((a, b) => {
          const tierOrder = { S: 0, A: 1, B: 2, C: 3, D: 4 };
          return tierOrder[a.tier] - tierOrder[b.tier];
        });
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "region":
        sorted.sort((a, b) => a.region.localeCompare(b.region));
        break;
    }

    return sorted;
  }, [filteredCities, sortBy]);

  // IntersectionObserver for lazy loading more cities
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 12);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sortedCities.length]);

  // Count by tier
  const tierCounts = useMemo(() => {
    const counts: Record<CityTier, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
    for (const city of citiesWithTier) {
      if (city.tier in counts) {
        counts[city.tier as CityTier]++;
      }
    }
    return counts;
  }, [citiesWithTier]);

  // Get gradient colors for tier fallback
  const getGradient = (tier: CityTier, index: number): string => {
    const gradients: Record<CityTier, string[]> = {
      S: [
        "from-amber-500 to-orange-600",
        "from-yellow-500 to-amber-600",
        "from-orange-500 to-red-600",
      ],
      A: ["from-blue-500 to-indigo-600", "from-cyan-500 to-blue-600", "from-sky-500 to-indigo-600"],
      B: ["from-emerald-500 to-teal-600", "from-green-500 to-emerald-600", "from-teal-500 to-cyan-600"],
      C: ["from-purple-500 to-violet-600", "from-fuchsia-500 to-purple-600", "from-violet-500 to-indigo-600"],
      D: ["from-gray-500 to-slate-600", "from-gray-400 to-gray-600", "from-slate-400 to-gray-600"],
    };
    const tierGradients = gradients[tier];
    return tierGradients[index % tierGradients.length];
  };

  // Get tier badge color scheme
  const _getTierColorScheme = (tier: CityTier): { bg: string; text: string } => {
    const schemes: Record<CityTier, { bg: string; text: string }> = {
      S: { bg: "bg-amber-500", text: "text-amber-500" },
      A: { bg: "bg-blue-500", text: "text-blue-500" },
      B: { bg: "bg-emerald-500", text: "text-emerald-500" },
      C: { bg: "bg-purple-500", text: "text-purple-500" },
      D: { bg: "bg-gray-400", text: "text-gray-400" },
    };
    return schemes[tier];
  };

  return (
    <div>
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full md:max-w-md">
            <input
              type="text"
              placeholder="Search cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-label="Search"
            >
              <title>Search</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Sort:</span>
            <CityTierSortDropdown value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        {/* Tier Filter */}
        <div className="mt-4">
          <CityTierFilter
            onFilterChange={setSelectedTiers}
            options={[
              { tier: "S", label: "S-Tier", count: tierCounts.S },
              { tier: "A", label: "A-Tier", count: tierCounts.A },
              { tier: "B", label: "B-Tier", count: tierCounts.B },
              { tier: "C", label: "C-Tier", count: tierCounts.C },
              { tier: "D", label: "D-Tier", count: tierCounts.D },
            ]}
            defaultSelected={["S", "A", "B", "C", "D"]}
          />
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-gray-500">
          Showing {sortedCities.length} of {citiesWithTier.length} cities
          {selectedTiers.length < 3 && (
            <span className="ml-1">
              (filtered by {selectedTiers.map((t) => TIER_CONFIG[t].label).join(", ")})
            </span>
          )}
        </div>

        {/* Scoring Methodology - compact */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span className="font-medium text-gray-600">📊 Scoring:</span>
            <span>Economy <span className="font-semibold text-blue-600">30%</span></span>
            <span>Connectivity <span className="font-semibold text-purple-600">25%</span></span>
            <span>Tourism <span className="font-semibold text-emerald-600">25%</span></span>
            <span>Livability <span className="font-semibold text-amber-600">20%</span></span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-400">S≥85 A≥70 B≥55 C≥40 D&lt;40</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-400">Updated weekly from economic reports, global rankings, travel & review data</span>
          </div>
        </div>
      </div>

      {/* Cities Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCities.slice(0, visibleCount).map((city, index) => (
          <a
            key={city.slug}
            href={`/city/${city.slug}`}
            className={`group relative overflow-hidden rounded-2xl card-hover block ${
              index === 0 && selectedTiers.includes("S")
                ? "md:col-span-2 lg:col-span-1 lg:row-span-2"
                : ""
            }`}
          >
            {/* Background Image or Gradient Fallback */}
            {city.coverImage ? (
              /* Real city image */
              <div
                className={`relative ${index === 0 && selectedTiers.includes("S") ? "h-80 lg:h-full min-h-[320px]" : "h-48"}`}
              >
                <img
                  src={city.coverImage}
                  alt={`${city.name} cityscape`}
                  className="w-full h-full object-cover"
                  loading={index < 6 ? "eager" : "lazy"}
                />
                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>
            ) : (
              /* Gradient fallback when no image */
              <div
                className={`bg-gradient-to-br ${getGradient(city.tier, index)} ${
                  index === 0 && selectedTiers.includes("S")
                    ? "h-80 lg:h-full min-h-[320px]"
                    : "h-48"
                } flex items-center justify-center relative`}
              >
                {/* Large letter watermark */}
                <span className="text-white/20 text-8xl font-bold absolute">{city.name[0]}</span>
              </div>
            )}

            {/* Tier Badge - positioned top right */}
            <div className="absolute top-3 right-3 z-10">
              <CityTierBadge tier={city.tier} size="sm" />
            </div>

            {/* Score Badge - positioned top left if available */}
            {city.compositeScore !== undefined && (
              <div className="absolute top-3 left-3 z-10">
                <div
                  className={`px-2 py-1 rounded-md text-xs font-semibold text-white backdrop-blur-sm ${
                    city.tier === "S"
                      ? "bg-amber-500/80"
                      : city.tier === "A"
                        ? "bg-blue-500/80"
                        : "bg-gray-500/80"
                  }`}
                >
                  {city.compositeScore.toFixed(0)}
                </div>
              </div>
            )}

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <div className="mb-2">
                <span className="text-blue-300 text-sm font-medium">{city.nameZh}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                {city.name}
              </h3>
              <p className="text-gray-300 text-sm mb-4 line-clamp-2">{city.description}</p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-white text-sm font-medium">
                  <span>Explore Guide</span>
                  <svg
                    className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Go to city page"
                  >
                    <title>Go to city page</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <div className="flex items-center gap-2">
                  {/* Region tag */}
                  <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs text-white">
                    {city.region}
                  </span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Lazy loading sentinel — triggers loading more cities when visible */}
      {visibleCount < sortedCities.length && (
        <div ref={sentinelRef} className="flex justify-center py-8">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-sm">Loading more cities...</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {sortedCities.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🏙️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No cities found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your filters or search query</p>
          <button
            type="button"
            onClick={() => {
              setSelectedTiers(["S", "A", "B", "C", "D"]);
              setSearchQuery("");
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Tier Legend */}
      <div className="mt-12 p-6 bg-gray-50 rounded-xl">
        <h3 className="text-lg font-semibold mb-4">City Tier Guide</h3>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <span className="text-amber-600 font-bold">S</span>
            </div>
            <div>
              <h4 className="font-semibold text-amber-700">S-Tier</h4>
              <p className="text-sm text-gray-600 mt-1">
                Top-tier global destinations with complete guides, real-time data, and comprehensive coverage.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-blue-600 font-bold">A</span>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700">A-Tier</h4>
              <p className="text-sm text-gray-600 mt-1">
                Major cities with strong tourism and economic presence. Detailed guides available.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <span className="text-emerald-600 font-bold">B</span>
            </div>
            <div>
              <h4 className="font-semibold text-emerald-700">B-Tier</h4>
              <p className="text-sm text-gray-600 mt-1">
                Notable regional destinations with good tourism value and curated content.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <span className="text-purple-600 font-bold">C</span>
            </div>
            <div>
              <h4 className="font-semibold text-purple-700">C-Tier</h4>
              <p className="text-sm text-gray-600 mt-1">
                Emerging destinations with unique character. Core travel info provided.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <span className="text-gray-600 font-bold">D</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">D-Tier</h4>
              <p className="text-sm text-gray-600 mt-1">
                Smaller cities and towns with basic information available for exploration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CitiesListClient;

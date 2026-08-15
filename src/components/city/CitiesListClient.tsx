"use client";

import { S_TIER_CITIES, TIER_CONFIG } from "@/data/cities/tier-data";
import type { CityTier } from "@/data/cities/types";
import type { City } from "@/data/cities/types";
import { type CityScoreDisplay, fetchCityScores } from "@/lib/city-sources/city-scores-api";
import React, { useState, useMemo, useEffect } from "react";
import { CityTierBadge } from "./CityTierBadge";
import { CityTierFilter, CityTierSortDropdown, type TierSortOption } from "./CityTierFilter";

interface CityMeta {
  slug: string;
  name: string;
  nameZh: string;
  description: string;
  coverImage?: string;
}

interface CitiesListClientProps {
  citiesMeta: CityMeta[];
  citiesData: City[];
  lang?: string;
  i18n?: Record<string, any>;
}

export function CitiesListClient({ citiesMeta, citiesData, lang = "en", i18n = {} }: CitiesListClientProps) {
  const JA_REGIONS: Record<string, string> = { 华北: "華北", 长三角: "長江デルタ", 珠三角: "珠江デルタ", 西北: "西北", 西南: "西南", 华南: "華南", 云南: "雲南", 福建: "福建", 山东: "山東", 湖南: "湖南", 海南: "海南", 华中: "華中", 东北: "東北", 中原: "中原", 内蒙古: "内モンゴル", 青海: "青海", 华东: "華東" };
  const regionName = (r: string) => (lang === "ja" ? JA_REGIONS[r] || r : r);
  // i18n lookup helper - resolved string with fallback
  const t = (key: string, fallback: string): string => {
    if (lang === "en" || !i18n) return fallback;
    const parts = key.split(".");
    let cur: any = i18n;
    for (const p of parts) {
      if (cur && typeof cur === "object" && p in cur) cur = cur[p];
      else return fallback;
    }
    return typeof cur === "string" ? cur : fallback;
  };

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

      return {
        ...meta,
        tier: dbScore?.tier || tierMeta?.tier || ("D" as CityTier),
        priority: tierMeta?.priority || 999,
        region: tierMeta?.region || "Other",
        tags: tierMeta?.tags || [],
        coverImage: cityData?.coverImage,
        compositeScore: dbScore?.compositeScore ?? tierMeta?.compositeScore,
        overallRank: dbScore?.rank ?? tierMeta?.overallRank,
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
      if (!selectedTiers.includes(city.tier)) return false;
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

  // IntersectionObserver for lazy loading
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 12);
        }
      },
      { rootMargin: "200px" },
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
      B: [
        "from-emerald-500 to-teal-600",
        "from-green-500 to-emerald-600",
        "from-teal-500 to-cyan-600",
      ],
      C: [
        "from-purple-500 to-violet-600",
        "from-fuchsia-500 to-purple-600",
        "from-violet-500 to-indigo-600",
      ],
      D: ["from-gray-500 to-slate-600", "from-gray-400 to-gray-600", "from-slate-400 to-gray-600"],
    };
    const tierGradients = gradients[tier];
    return tierGradients[index % tierGradients.length];
  };

  // Tier labels (i18n)
  const tierLabels: Record<CityTier, string> = {
    S: t("cities.tierShortS", "S-Tier"),
    A: t("cities.tierShortA", "A-Tier"),
    B: t("cities.tierShortB", "B-Tier"),
    C: t("cities.tierShortC", "C-Tier"),
    D: t("cities.tierShortD", "D-Tier"),
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
              placeholder={t("cities.searchPlaceholder", "Search cities...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-label={t("common.search", "Search")}
            >
              <title>{t("common.search", "Search")}</title>
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
            <span className="text-sm text-gray-500">{t("cities.sortBy", "Sort:")}</span>
            <CityTierSortDropdown
              value={sortBy}
              onChange={setSortBy}
              labels={{
                priority: t("cities.sortRecommended", "Recommended"),
                tier: t("cities.sortTier", "Tier (S → D)"),
                name: t("cities.sortName", "Name (A-Z)"),
                region: t("cities.sortRegion", "Region"),
              }}
            />
          </div>
        </div>

        {/* Tier Filter */}
        <div className="mt-4">
          <CityTierFilter
            onFilterChange={setSelectedTiers}
            options={[
              { tier: "S", label: tierLabels.S, count: tierCounts.S },
              { tier: "A", label: tierLabels.A, count: tierCounts.A },
              { tier: "B", label: tierLabels.B, count: tierCounts.B },
              { tier: "C", label: tierLabels.C, count: tierCounts.C },
              { tier: "D", label: tierLabels.D, count: tierCounts.D },
            ]}
            defaultSelected={["S", "A", "B", "C", "D"]}
            tierLabel={t("cities.tierLabel", "Tier:")}
            allLabel={t("cities.tierAll", "All")}
            noneLabel={t("cities.tierNone", "None")}
            lang={lang}
          />
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-gray-500">
          {t("cities.showing", "Showing")} {sortedCities.length} {t("cities.of", "of")}{" "}
          {citiesWithTier.length} {t("cities.citiesWord", "cities")}
          {selectedTiers.length < 5 && (
            <span className="ml-1">
              ({t("cities.filteredBy", "filtered by")}{" "}
              {selectedTiers.map((tier) => tierLabels[tier]).join(", ")})
            </span>
          )}
        </div>

        {/* Scoring Methodology */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="font-medium text-gray-700">
              🏆 {t("cities.ratingTitle", "ChinaConnect City Rating™")}
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500">
              {t("cities.ratingDesc", "Composite score based on four dimensions:")}
            </span>
            <span className="text-gray-500">
              {t("cities.economicStrength", "Economic Strength")}{" "}
              <span className="font-semibold text-blue-600">30%</span>
            </span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">
              {t("cities.globalConnectivity", "Global Connectivity")}{" "}
              <span className="font-semibold text-purple-600">25%</span>
            </span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">
              {t("cities.tourismCompetitiveness", "Tourism Competitiveness")}{" "}
              <span className="font-semibold text-emerald-600">25%</span>
            </span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">
              {t("cities.urbanLivability", "Urban Livability")}{" "}
              <span className="font-semibold text-amber-600">20%</span>
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 text-xs text-gray-400">
            <span>
              {t(
                "cities.dataSources",
                "Data sources: National Bureau of Statistics, Civil Aviation Administration, Ministry of Culture and Tourism, OpenMeteo meteorological data",
              )}
            </span>
            <span>·</span>
            <span>{t("cities.refreshedWeekly", "Refreshed weekly with real-time climate adjustment")}</span>
          </div>
        </div>
      </div>

      {/* Cities Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCities.slice(0, visibleCount).map((city, index) => (
          <a
            key={city.slug}
            href={lang === "en" ? `/city/${city.slug}` : `/${lang}/city/${city.slug}`}
            className={`group relative overflow-hidden rounded-2xl card-hover block ${
              index === 0 && selectedTiers.includes("S")
                ? "md:col-span-2 lg:col-span-1 lg:row-span-2"
                : ""
            }`}
          >
            {city.coverImage ? (
              <div
                className={`relative ${index === 0 && selectedTiers.includes("S") ? "h-80 lg:h-full min-h-[320px]" : "h-48"}`}
              >
                <img
                  src={city.coverImage}
                  alt={`${city.name} cityscape`}
                  className="w-full h-full object-cover"
                  loading={index < 6 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>
            ) : (
              <div
                className={`bg-gradient-to-br ${getGradient(city.tier, index)} ${
                  index === 0 && selectedTiers.includes("S")
                    ? "h-80 lg:h-full min-h-[320px]"
                    : "h-48"
                } flex items-center justify-center relative`}
              >
                <span className="text-white/20 text-8xl font-bold absolute">{city.name[0]}</span>
              </div>
            )}

            {/* Tier Badge - top right */}
            <div className="absolute top-3 right-3 z-10">
              <CityTierBadge tier={city.tier} size="sm" lang={lang} />
            </div>

            {/* Score Badge - top left */}
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

              <div className="flex items-center justify-between">
                <div className="flex items-center text-white text-sm font-medium">
                  <span>{t("cities.exploreGuide", "Explore Guide")}</span>
                  <svg
                    className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label={t("cities.goToCity", "Go to city page")}
                  >
                    <title>{t("cities.goToCity", "Go to city page")}</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs text-white">
                    {regionName(city.region)}
                  </span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Lazy loading sentinel */}
      {visibleCount < sortedCities.length && (
        <div ref={sentinelRef} className="flex justify-center py-8">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-sm">{t("cities.loadingMore", "Loading more cities...")}</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {sortedCities.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t("cities.noCitiesFound", "No cities found")}
          </h3>
          <p className="text-gray-500 mb-4">
            {t("cities.adjustFilters", "Try adjusting your filters or search query")}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedTiers(["S", "A", "B", "C", "D"]);
              setSearchQuery("");
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("cities.clearFilters", "Clear Filters")}
          </button>
        </div>
      )}

      {/* Tier Legend */}
      <div className="mt-12 p-6 bg-gray-50 rounded-xl">
        <h3 className="text-lg font-semibold mb-2">
          {t("cities.tierLegendTitle", "ChinaConnect City Rating™ - Tier Classification")}
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          {t(
            "cities.tierLegendDesc",
            "Cities are classified into five tiers based on their composite score (0–100), calculated from economic output, international connectivity, tourism competitiveness, and urban livability metrics.",
          )}
        </p>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <span className="text-amber-600 font-bold">S</span>
            </div>
            <div>
              <h4 className="font-semibold text-amber-700">
                {t("cities.tierSDesc", "S-Tier (≥85): World-class cities with top economic output, extensive international networks, and full-spectrum travel infrastructure.")}
              </h4>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-blue-600 font-bold">A</span>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700">
                {t("cities.tierADesc", "A-Tier (≥70): Major economic hubs and top tourism destinations with strong international connectivity and comprehensive city guides.")}
              </h4>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <span className="text-emerald-600 font-bold">B</span>
            </div>
            <div>
              <h4 className="font-semibold text-emerald-700">
                {t("cities.tierBDesc", "B-Tier (≥55): Significant regional centers with solid economic base, established tourism appeal, and quality travel recommendations.")}
              </h4>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <span className="text-purple-600 font-bold">C</span>
            </div>
            <div>
              <h4 className="font-semibold text-purple-700">
                {t("cities.tierCDesc", "C-Tier (≥40): Emerging destinations with distinct cultural or natural attractions. Core travel information and essential guides provided.")}
              </h4>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <span className="text-gray-600 font-bold">D</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">
                {t("cities.tierDDesc", "D-Tier (<40): Smaller cities and towns with developing tourism infrastructure. Basic travel information available for exploration.")}
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CitiesListClient;
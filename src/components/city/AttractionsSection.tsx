import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import React, { useState } from "react";
import { AttractionCard, type AttractionData } from "./AttractionCard";
import { CityMap } from "./CityMap";

interface AttractionsSectionProps {
  attractions: AttractionData[];
  citySlug: string;
  cityName: string;
  totalCount?: number;
}

export function AttractionsSection({ attractions, citySlug, cityName, totalCount }: AttractionsSectionProps) {
  const [_selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);

  const { visibleItems, hasMore, loading, sentinelRef } = useInfiniteScroll<AttractionData>({
    items: attractions,
    initialCount: 5,
    loadMoreCount: 5,
  });

  const total = totalCount ?? attractions.length;

  return (
    <div>
      <div className="mb-6">
        <CityMap
          city={
            {
              slug: citySlug,
              name: cityName,
              coordinates: { lat: 0, lng: 0 },
              attractions,
              restaurants: [],
              hotels: [],
            } as any
          }
          activeTab="attractions"
          height="350px"
        />
      </div>

      <div className="space-y-4">
        {visibleItems.map((attraction, index) => (
          <AttractionCard
            key={attraction.id}
            attraction={attraction}
            index={index}
            onSelectMapMarker={setSelectedCoords}
          />
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="py-8 flex flex-col items-center">
          {loading ? (
            <>
              <div className="flex items-center gap-3 text-gray-500">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-sm font-medium">Loading more...</span>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Showing {visibleItems.length} of {total} attractions
              </div>
            </>
          ) : (
            <div className="h-8" />
          )}
        </div>
      )}

      {/* View All button */}
      {attractions.length > 0 && (
        <div className="py-6 flex flex-col items-center gap-3">
          {!hasMore && attractions.length >= 5 && (
            <div className="text-sm text-gray-400 mb-2">
              Showing {visibleItems.length} of {total} attractions
            </div>
          )}
          <a
            href={`/city/${citySlug}/attractions`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            View All {total} Attractions
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}

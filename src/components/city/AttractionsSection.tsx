import { InfiniteList } from "@/components/ui/InfiniteList";
import React, { useState } from "react";
import { AttractionCard, type AttractionData } from "./AttractionCard";
import { CityMap } from "./CityMap";

interface AttractionsSectionProps {
  attractions: AttractionData[];
  citySlug: string;
  cityName: string;
}

export function AttractionsSection({ attractions, citySlug, cityName }: AttractionsSectionProps) {
  const [_selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);

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

      <InfiniteList
        items={attractions}
        initialCount={10}
        loadMoreCount={10}
        renderItem={(attraction, index) => (
          <AttractionCard
            key={attraction.id}
            attraction={attraction}
            index={index}
            onSelectMapMarker={setSelectedCoords}
          />
        )}
      />
    </div>
  );
}

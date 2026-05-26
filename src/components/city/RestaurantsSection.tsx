import React, { useState } from "react";
import { RestaurantCard, RestaurantCardData } from "./RestaurantCard";
import { CityMap } from "./CityMap";
import { InfiniteList } from "@/components/ui/InfiniteList";

interface RestaurantsSectionProps {
  restaurants: RestaurantCardData[];
  citySlug: string;
  cityName: string;
}

export function RestaurantsSection({
  restaurants,
  citySlug,
  cityName,
}: RestaurantsSectionProps) {
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);

  return (
    <div>
      <div className="mb-6">
        <CityMap
          city={{ slug: citySlug, name: cityName, coordinates: { lat: 0, lng: 0 }, attractions: [], restaurants, hotels: [] } as any}
          activeTab="food"
          height="350px"
        />
      </div>

      <InfiniteList
        items={restaurants}
        initialCount={10}
        loadMoreCount={10}
        renderItem={(restaurant, index) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
          />
        )}
      />
    </div>
  );
}

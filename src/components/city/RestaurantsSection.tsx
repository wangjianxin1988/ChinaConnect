import { InfiniteList } from "@/components/ui/InfiniteList";
import React from "react";
import { CityMap } from "./CityMap";
import { RestaurantCard, type RestaurantCardData } from "./RestaurantCard";

interface RestaurantsSectionProps {
  restaurants: RestaurantCardData[];
  citySlug: string;
  cityName: string;
}

export function RestaurantsSection({ restaurants, citySlug, cityName }: RestaurantsSectionProps) {
  return (
    <div>
      <div className="mb-6">
        <CityMap
          city={
            {
              slug: citySlug,
              name: cityName,
              coordinates: { lat: 0, lng: 0 },
              attractions: [],
              restaurants,
              hotels: [],
            } as any
          }
          activeTab="food"
          height="350px"
        />
      </div>

      <InfiniteList
        items={restaurants}
        initialCount={10}
        loadMoreCount={10}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        renderItem={(restaurant, _index) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        )}
      />
    </div>
  );
}

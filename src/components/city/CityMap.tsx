import { DynamicMap } from "@/components/Map";
import type { DualMapLocation } from "@/components/Map";
import type { MapMarker } from "@/lib/map-types";
import { useMemo, useState } from "react";

// Define types matching the actual city JSON structure
interface Attraction {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  coordinates?: { lat: number; lng: number };
  address?: string;
  openingHours?: string;
  description?: string;
}

interface Restaurant {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  cuisine: string;
  avgPrice: number;
  rating: number;
  coordinates?: { lat: number; lng: number };
  address?: string;
  phone?: string;
  hours?: string;
  description?: string;
}

interface EmergencyContact {
  type: string;
  name: string;
  nameEn: string;
  phone: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  notes?: string;
}

interface City {
  slug: string;
  name: string;
  nameEn: string;
  population: string;
  coordinates: { lat: number; lng: number };
  attractions: Attraction[];
  restaurants: Restaurant[];
  emergencyContacts: EmergencyContact[];
}

// Type assertion helper
function getCoordinates<T extends object>(obj: T): { lat: number; lng: number } | null {
  if ("coordinates" in obj && obj.coordinates) {
    const coords = obj.coordinates as { lat: number; lng: number };
    if (typeof coords.lat === "number" && typeof coords.lng === "number") {
      return coords;
    }
  }
  return null;
}

interface CityMapProps {
  city: City;
  activeTab?: "overview" | "attractions" | "food" | "emergency";
  height?: string;
  showControls?: boolean;
}

export function CityMap({
  city,
  activeTab = "overview",
  height = "350px",
  showControls = true,
}: CityMapProps) {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  const markers = useMemo(() => {
    const result: MapMarker[] = [];

    // City center marker
    result.push({
      id: `${city.slug}-center`,
      coordinates: city.coordinates,
      name: city.name,
      nameEn: city.nameEn,
      type: "transport",
      description: `${city.population} population`,
    });

    // Add attraction markers
    if (activeTab === "overview" || activeTab === "attractions") {
      city.attractions.forEach((attraction: Attraction) => {
        const coords = getCoordinates(attraction);
        if (coords) {
          result.push({
            id: attraction.id,
            coordinates: coords,
            name: attraction.name,
            nameEn: attraction.nameEn,
            type: "attraction",
            category: attraction.category,
            description: attraction.description,
            address: attraction.address,
          });
        }
      });
    }

    // Add restaurant markers
    if (activeTab === "overview" || activeTab === "food") {
      city.restaurants.forEach((restaurant: Restaurant) => {
        const coords = getCoordinates(restaurant);
        if (coords) {
          result.push({
            id: restaurant.id,
            coordinates: coords,
            name: restaurant.name,
            nameEn: restaurant.nameEn,
            type: "restaurant",
            category: restaurant.type,
            description: restaurant.description,
            address: restaurant.address,
            phone: restaurant.phone,
            rating: restaurant.rating,
            priceRange: `${restaurant.avgPrice} CNY`,
          });
        }
      });
    }

    // Add emergency contact markers
    if (activeTab === "emergency" || activeTab === "overview") {
      city.emergencyContacts
        .filter((contact) => getCoordinates(contact))
        .slice(0, 5)
        .forEach((contact) => {
          const coords = getCoordinates(contact);
          if (coords) {
            result.push({
              id: `emergency-${contact.nameEn}`,
              coordinates: coords,
              name: contact.name,
              nameEn: contact.nameEn,
              type: "emergency",
              description: contact.notes,
              phone: contact.phone,
              address: contact.address,
            });
          }
        });
    }

    return result;
  }, [city, activeTab]);

  const initialLocation: DualMapLocation = {
    lat: city.coordinates.lat,
    lng: city.coordinates.lng,
    name: city.nameEn,
  };

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
  };

  return (
    <div className="space-y-3">
      {/* Map Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span className="font-medium">Legend:</span>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
          <span>Attractions</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
          <span>Restaurants</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          <span>Transport</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-600 inline-block"></span>
          <span>Emergency</span>
        </div>
      </div>

      {/* Map Component */}
      <DynamicMap
        initialLocation={initialLocation}
        markers={markers}
        height={height}
        showControls={showControls}
        showLayerControls={true}
        onMarkerClick={handleMarkerClick}
        className="rounded-xl overflow-hidden shadow-sm border border-gray-100"
      />

      {/* Selected Marker Details */}
      {selectedMarker && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">{selectedMarker.nameEn}</h4>
              {selectedMarker.name !== selectedMarker.nameEn && (
                <p className="text-sm text-gray-500">{selectedMarker.name}</p>
              )}
            </div>
            <button
              onClick={() => setSelectedMarker(null)}
              className="text-gray-400 hover:text-gray-600 p-1 text-sm"
            >
              Close
            </button>
          </div>

          {selectedMarker.description && (
            <p className="text-sm text-gray-600 mt-2">{selectedMarker.description}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            {selectedMarker.address && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                📍 {selectedMarker.address}
              </span>
            )}
            {selectedMarker.phone && (
              <a
                href={`tel:${selectedMarker.phone.replace(/[^\d+]/g, "")}`}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
              >
                📞 {selectedMarker.phone}
              </a>
            )}
            {selectedMarker.rating && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                ★ {selectedMarker.rating}
              </span>
            )}
            {selectedMarker.priceRange && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                {selectedMarker.priceRange}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CityMap;

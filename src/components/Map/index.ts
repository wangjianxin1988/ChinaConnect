// Map components barrel export
// Note: Only export types and client-only components
// The actual map components (Leaflet-based) are loaded dynamically to avoid SSR issues

export type { MapMarker, MapProvider, MapLayer, MapViewState, MapBounds } from "@/lib/map-types";

// Re-export the DynamicMap wrapper which handles SSR
export { DynamicMap } from "./DynamicMap";
export { ClientOnlyMap } from "./ClientOnlyMap";

// Export types for location objects
export interface DualMapLocation {
  lat: number;
  lng: number;
  name?: string;
}

// Note: DualMap, GoogleTileLayer, AmapTileLayer, and MapToggle
// are loaded dynamically via DynamicMap to avoid SSR issues with Leaflet
// Do NOT add them to this barrel export

/**
 * Map-related type definitions for ChinaConnect dual map engine
 * Supports Google Maps (WGS-84) and Gaode/Amap (GCJ-02)
 */

/** Map provider types */
export type MapProvider = "google" | "amap";

/** Map layer types for tile switching */
export type MapLayer = "standard" | "satellite" | "terrain";

/** Coordinate pair */
export interface Coordinates {
  lat: number;
  lng: number;
}

/** City marker for map rendering */
export interface CityMarker {
  id: string;
  coordinates: Coordinates;
  name: string;
  nameEn: string;
  type: "attraction" | "restaurant" | "hotel" | "emergency" | "transport";
  icon?: string;
  description?: string;
  address?: string;
  phone?: string;
  category?: string;
  rating?: number;
  priceRange?: string;
}

/** Map configuration per provider */
export interface MapConfig {
  provider: MapProvider;
  layers: Record<MapLayer, string>;
  tileUrl: string;
  subdomains?: string[];
  attribution: string;
  coordinateSystem: "WGS84" | "GCJ02";
}

/** Map view state */
export interface MapViewState {
  center: Coordinates;
  zoom: number;
  layer: MapLayer;
}

/** Map bounds for viewport */
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/** IP-based country detection result */
export interface CountryDetection {
  countryCode: string;
  countryName: string;
  isChina: boolean;
  source: "cf-ipcountry" | "ipapi" | "fallback";
}

/** Dual map component props */
export interface DualMapProps {
  initialLocation?: {
    lat: number;
    lng: number;
    name?: string;
  };
  markers?: CityMarker[];
  height?: string;
  showControls?: boolean;
  showLayerControls?: boolean;
  defaultLayer?: MapLayer;
  onMarkerClick?: (marker: CityMarker) => void;
  className?: string;
}

/** Tile layer configuration */
export interface TileLayerConfig {
  url: string;
  attribution: string;
  subdomains?: string;
  maxZoom?: number;
  minZoom?: number;
}

/** Map provider display info */
export interface ProviderDisplayInfo {
  name: string;
  nativeName: string;
  flag: string;
  switchLabel: string;
  switchFlag: string;
}

/** Map layer display info */
export interface LayerDisplayInfo {
  name: string;
  icon: string;
  description: string;
}

/** Auto-detection strategy */
export type DetectionStrategy = "cf-ipcountry" | "ipapi" | "both";

/** Hook return type for map provider detection */
export interface UseMapProviderReturn {
  provider: MapProvider;
  setProvider: (provider: MapProvider) => void;
  toggleProvider: () => void;
  isDetecting: boolean;
  countryDetection: CountryDetection | null;
  error: string | null;
  refetch: () => void;
}

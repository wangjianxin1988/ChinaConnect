// Map-related type definitions

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapMarker {
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

export type MapProvider = "google" | "amap";

export type MapLayer = "standard" | "satellite" | "terrain";

export interface MapViewState {
  center: Coordinates;
  zoom: number;
  layer: MapLayer;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Layer configuration for different map providers
export const MAP_CONFIG = {
  google: {
    layers: {
      standard: "m",
      satellite: "s",
      terrain: "p",
    },
    tileUrl: "https://mt{1-3}.google.com/vt?x={x}&y={y}&z={z}",
  },
  amap: {
    layers: {
      standard: "6",
      satellite: "3",
      terrain: "5",
    },
    tileUrl: "https://webst0{1-4}.is.autonavi.com/appmaptile?style={style}&x={x}&y={y}&z={z}",
  },
} as const;

// Default marker icons (SVG paths for custom markers)
export const MARKER_ICONS = {
  attraction: {
    color: "#f59e0b", // amber
    emoji: "🏛️",
  },
  restaurant: {
    color: "#ef4444", // red
    emoji: "🍜",
  },
  hotel: {
    color: "#8b5cf6", // purple
    emoji: "🏨",
  },
  emergency: {
    color: "#dc2626", // red-600
    emoji: "🚨",
  },
  transport: {
    color: "#10b981", // emerald
    emoji: "🚇",
  },
} as const;

// Layer display names
export const LAYER_NAMES: Record<MapLayer, { en: string; zh: string }> = {
  standard: { en: "Standard", zh: "标准地图" },
  satellite: { en: "Satellite", zh: "卫星地图" },
  terrain: { en: "Terrain", zh: "地形图" },
};

// Provider display names
export const PROVIDER_NAMES: Record<MapProvider, { en: string; zh: string }> = {
  google: { en: "Google Maps", zh: "谷歌地图" },
  amap: { en: "Amap (Gaode)", zh: "高德地图" },
};

// @ts-nocheck
/**
 * AmapTileLayer - Gaode (Amap) Maps tile layer component for Leaflet
 * Uses GCJ-02 coordinate system (China-specific deviation from WGS-84)
 */
import type { TileLayerConfig } from "@/types/map";
import React from "react";
import { TileLayer } from "react-leaflet";

/**
 * Amap tile layer URLs for different map types
 * - style=6: Standard map (矢量地图)
 * - style=3: Satellite imagery (卫星地图)
 * - style=5: Terrain map (地形地图) - actually a hybrid style
 *
 * Note: Amap uses GCJ-02 coordinate system, so WGS-84 coordinates
 * must be converted before rendering markers
 */
const AMAP_TILE_URLS = {
  standard: "https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
  satellite: "https://webst0{s}.is.autonavi.com/appmaptile?style=3&x={x}&y={y}&z={z}",
  terrain: "https://webst0{s}.is.autonavi.com/appmaptile?style=5&x={x}&y={y}&z={z}",
} as const;

/** Amap attribution text */
const AMAP_ATTRIBUTION =
  '&copy; <a href="https://www.amap.com/" target="_blank" rel="noopener noreferrer">高德地图</a>';

/** Amap subdomains - 4 servers for load balancing */
const AMAP_SUBDOMAINS = "1234";

/** Maximum zoom level for Amap */
const AMAP_MAX_ZOOM = 18;

/** Minimum zoom level for Amap */
const AMAP_MIN_ZOOM = 4;

export interface AmapTileLayerProps {
  layer?: "standard" | "satellite" | "terrain";
  className?: string;
}

/**
 * AmapTileLayer - Leaflet TileLayer for Amap (Gaode) Maps tiles
 *
 * @example
 * ```tsx
 * <MapContainer center={[39.9042, 116.4074]} zoom={13}>
 *   <AmapTileLayer layer="standard" />
 *   {/* markers... *\/}
 * </MapContainer>
 * ```
 *
 * Note: When using Amap, coordinates must be converted from WGS-84 to GCJ-02
 * using the wgs84ToGcj02() function from @/lib/coordinates
 */
export function AmapTileLayer({ layer = "standard", className }: AmapTileLayerProps) {
  const tileUrl = AMAP_TILE_URLS[layer];

  return (
    <TileLayer
      url={tileUrl}
      subdomains={AMAP_SUBDOMAINS}
      attribution={AMAP_ATTRIBUTION}
      maxZoom={AMAP_MAX_ZOOM}
      minZoom={AMAP_MIN_ZOOM}
      className={className}
    />
  );
}

/**
 * Get Amap tile layer configuration
 */
export function getAmapTileConfig(layer: "standard" | "satellite" | "terrain"): TileLayerConfig {
  return {
    url: AMAP_TILE_URLS[layer],
    attribution: AMAP_ATTRIBUTION,
    subdomains: AMAP_SUBDOMAINS,
    maxZoom: AMAP_MAX_ZOOM,
    minZoom: AMAP_MIN_ZOOM,
  };
}

/**
 * Get all available Amap layer URLs
 */
export function getAmapLayerUrls(): Record<string, string> {
  return { ...AMAP_TILE_URLS };
}

export default AmapTileLayer;

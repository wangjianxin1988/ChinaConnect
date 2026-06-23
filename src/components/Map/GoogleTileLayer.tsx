// @ts-nocheck
/**
 * GoogleTileLayer - Google Maps tile layer component for Leaflet
 * Uses WGS-84 coordinate system (native for Google Maps)
 */
import type { TileLayerConfig } from "@/types/map";
import React from "react";
import { TileLayer } from "react-leaflet";

/** Google Maps tile layer URLs for different map types */
const GOOGLE_TILE_URLS = {
  standard: "https://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}",
  satellite: "https://{s}.google.com/vt?lyrs=s&x={x}&y={y}&z={z}",
  terrain: "https://{s}.google.com/vt?lyrs=p&x={x}&y={y}&z={z}",
} as const;

/** Google Maps attribution text */
const GOOGLE_ATTRIBUTION =
  '&copy; <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">Google Maps</a>';

/** Google Maps subdomains */
const GOOGLE_SUBDOMAINS = "1234";

/** Maximum zoom level for Google Maps */
const GOOGLE_MAX_ZOOM = 20;

/** Minimum zoom level for Google Maps */
const GOOGLE_MIN_ZOOM = 3;

export interface GoogleTileLayerProps {
  layer?: "standard" | "satellite" | "terrain";
  className?: string;
}

/**
 * GoogleTileLayer - Leaflet TileLayer for Google Maps tiles
 *
 * @example
 * ```tsx
 * <MapContainer center={[39.9042, 116.4074]} zoom={13}>
 *   <GoogleTileLayer layer="standard" />
 *   {/* markers... *\/}
 * </MapContainer>
 * ```
 */
export function GoogleTileLayer({ layer = "standard", className }: GoogleTileLayerProps) {
  const tileUrl = GOOGLE_TILE_URLS[layer];

  return (
    <TileLayer
      url={tileUrl}
      subdomains={GOOGLE_SUBDOMAINS}
      attribution={GOOGLE_ATTRIBUTION}
      maxZoom={GOOGLE_MAX_ZOOM}
      minZoom={GOOGLE_MIN_ZOOM}
      className={className}
    />
  );
}

/**
 * Get Google Maps tile layer configuration
 */
export function getGoogleTileConfig(layer: "standard" | "satellite" | "terrain"): TileLayerConfig {
  return {
    url: GOOGLE_TILE_URLS[layer],
    attribution: GOOGLE_ATTRIBUTION,
    subdomains: GOOGLE_SUBDOMAINS,
    maxZoom: GOOGLE_MAX_ZOOM,
    minZoom: GOOGLE_MIN_ZOOM,
  };
}

/**
 * Get all available Google Maps layer URLs
 */
export function getGoogleLayerUrls(): Record<string, string> {
  return { ...GOOGLE_TILE_URLS };
}

export default GoogleTileLayer;

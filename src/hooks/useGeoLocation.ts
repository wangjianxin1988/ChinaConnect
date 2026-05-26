/**
 * useGeoLocation - IP-based country detection and map provider auto-selection
 * Used to automatically switch map providers based on user's geographic location
 */

import { useCallback, useEffect, useRef, useState } from "react";

const IP_API_URL = "https://ipapi.co/json/";
const GEO_CACHE_KEY = "chinaconnect-geo-data";
const GEO_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export type GeoProvider = "google" | "amap";

export interface GeoData {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  lat: number;
  lng: number;
  timezone: string;
  detectedAt: number;
}

export interface UseGeoLocationReturn {
  geoData: GeoData | null;
  isDetecting: boolean;
  error: string | null;
  recommendedProvider: GeoProvider;
  isChina: boolean;
  refetch: () => void;
}

interface CachedGeoData extends GeoData {
  cachedAt: number;
}

function isValidCache(cached: CachedGeoData): boolean {
  return Date.now() - cached.cachedAt < GEO_CACHE_TTL;
}

export function useGeoLocation(): UseGeoLocationReturn {
  const [geoData, setGeoData] = useState<GeoData | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const detect = useCallback(async () => {
    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    setIsDetecting(true);
    setError(null);

    // Try to restore from cache
    if (typeof window !== "undefined") {
      try {
        const cachedRaw = localStorage.getItem(GEO_CACHE_KEY);
        if (cachedRaw) {
          const cached: CachedGeoData = JSON.parse(cachedRaw);
          if (isValidCache(cached)) {
            const { cachedAt, ...rest } = cached;
            setGeoData(rest);
            setIsDetecting(false);
            return;
          }
        }
      } catch {
        // ignore parse errors
      }
    }

    try {
      const response = await fetch(IP_API_URL, {
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      const detected: GeoData = {
        ip: data.ip || "unknown",
        country: data.country_name || "Unknown",
        countryCode: data.country_code || data.country || "US",
        region: data.region || "",
        city: data.city || "",
        lat: data.latitude ?? 39.9042,
        lng: data.longitude ?? 116.4074,
        timezone: data.timezone || "Asia/Shanghai",
        detectedAt: Date.now(),
      };

      setGeoData(detected);

      // Cache the result
      if (typeof window !== "undefined") {
        try {
          const toCache: CachedGeoData = { ...detected, cachedAt: Date.now() };
          localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(toCache));
        } catch {
          // ignore storage errors
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Detection failed";
      setError(msg);
      // Fallback to a neutral provider
    } finally {
      setIsDetecting(false);
    }
  }, []);

  useEffect(() => {
    detect();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [detect]);

  const isChina = geoData?.countryCode === "CN";
  const recommendedProvider: GeoProvider = isChina ? "amap" : "google";

  return {
    geoData,
    isDetecting,
    error,
    recommendedProvider,
    isChina,
    refetch: detect,
  };
}
/**
 * useGeoLocation - IP-based country detection and map provider auto-selection
 * Used to automatically switch map providers based on user's geographic location
 */

import { useCallback, useEffect, useRef, useState } from "react";

// Cloudflare trace endpoint is CSP-allowlisted (https://*.cloudflare.com) and
// returns the requester country code (loc=XX) without any third-party API key.
const CF_TRACE_URL = "https://www.cloudflare.com/cdn-cgi/trace";
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
      // Use AbortSignal.timeout if available, otherwise fall back to AbortController
      var fetchSignal =
        typeof AbortSignal.timeout === "function"
          ? AbortSignal.timeout(5000)
          : abortRef.current.signal;
      const response = await fetch(CF_TRACE_URL, {
        signal: fetchSignal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      // Parse the plain-text "k=v" lines Cloudflare returns.
      const text = await response.text();
      const data: Record<string, string> = {};
      for (const line of text.split("\n")) {
        const eq = line.indexOf("=");
        if (eq > 0) data[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
      }

      const detected: GeoData = {
        ip: data.ip || "unknown",
        country: data.loc === "CN" ? "China" : "Unknown",
        countryCode: data.loc || "US",
        region: data.colo || "",
        city: "",
        lat: 39.9042,
        lng: 116.4074,
        timezone: "Asia/Shanghai",
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

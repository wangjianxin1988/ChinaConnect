import { wgs84ToGcj02 } from "@/lib/coordinates";
import type { MapProvider, MapViewState } from "@/lib/map-types";
import { useCallback, useEffect, useState } from "react";

const IP_API_URL = "https://ipapi.co/json/";
const LOCATION_STORAGE_KEY = "chinaconnect-map-provider";

interface UseMapOptions {
  initialProvider?: MapProvider;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  detectLocation?: boolean;
}

interface UseMapReturn {
  provider: MapProvider;
  setProvider: (provider: MapProvider) => void;
  toggleProvider: () => void;
  userCountry: string | null;
  isDetectingLocation: boolean;
  viewState: MapViewState;
  setViewState: (state: Partial<MapViewState>) => void;
  convertCoordinates: (coords: { lat: number; lng: number }) => { lat: number; lng: number };
  coordinatesForProvider: (coords: { lat: number; lng: number }) => { lat: number; lng: number };
}

export function useMap(options: UseMapOptions = {}): UseMapReturn {
  const {
    initialProvider,
    initialCenter = { lat: 39.9042, lng: 116.4074 },
    initialZoom = 13,
    detectLocation = true,
  } = options;

  const [provider, setProviderState] = useState<MapProvider>(() => {
    // Try to restore from localStorage first
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (saved === "google" || saved === "amap") {
        return saved;
      }
    }
    return initialProvider || "google";
  });

  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(detectLocation);
  const [_userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [viewState, setViewStateState] = useState<MapViewState>({
    center: initialCenter,
    zoom: initialZoom,
    layer: "standard",
  });

  // Detect user country via IP and auto-switch provider
  useEffect(() => {
    if (!detectLocation) {
      setIsDetectingLocation(false);
      return;
    }

    const detectCountry = async () => {
      try {
        const response = await fetch(IP_API_URL, { signal: AbortSignal.timeout(5000) });
        if (!response.ok) throw new Error("Failed to fetch IP info");
        const data = await response.json();
        const countryCode = data.country_code || data.country;

        setUserCountry(countryCode);

        // Auto-switch to Amap if user is in China
        if (countryCode === "CN") {
          setProviderState("amap");
        }
      } catch {
        // Silently fail - use default provider
      } finally {
        setIsDetectingLocation(false);
      }
    };

    detectCountry();
  }, [detectLocation]);

  // Get user geolocation for centering
  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        // Geolocation denied - silently ignore
      },
      { timeout: 5000, maximumAge: 300000 },
    );
  }, []);

  // Set provider and persist to localStorage
  const setProvider = useCallback((newProvider: MapProvider) => {
    setProviderState(newProvider);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCATION_STORAGE_KEY, newProvider);
    }
  }, []);

  const toggleProvider = useCallback(() => {
    setProvider(provider === "google" ? "amap" : "google");
  }, [provider, setProvider]);

  // Update view state
  const setViewState = useCallback((state: Partial<MapViewState>) => {
    setViewStateState((prev) => ({ ...prev, ...state }));
  }, []);

  // Convert coordinates based on provider
  // Google Maps uses WGS-84, Amap uses GCJ-02
  // Data is stored in WGS-84, so we convert for Amap
  const coordinatesForProvider = useCallback(
    (coords: { lat: number; lng: number }) => {
      if (provider === "google") {
        // Data is already in WGS-84, Google can use it directly
        return coords;
      }
      // Convert to GCJ-02 for Amap
      return wgs84ToGcj02(coords.lat, coords.lng);
    },
    [provider],
  );

  // Convert coordinates from any source to target provider
  const convertCoordinates = useCallback(
    (coords: { lat: number; lng: number }) => {
      if (provider === "google") {
        return coords; // Return as-is (WGS-84)
      }
      return wgs84ToGcj02(coords.lat, coords.lng);
    },
    [provider],
  );

  return {
    provider,
    setProvider,
    toggleProvider,
    userCountry,
    isDetectingLocation,
    viewState,
    setViewState,
    convertCoordinates,
    coordinatesForProvider,
  };
}

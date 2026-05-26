/**
 * useCheckIn - GPS-verified user check-in hook
 * Uses the browser Geolocation API to verify the user's position
 * before recording a check-in. Persists history to localStorage.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { POINTS } from "@/types/database";

const CHECKIN_HISTORY_KEY = "chinaconnect-checkin-history";
const MAX_ACCURACY_METERS = 5000; // 5km radius

export type CheckInStatus =
  | "idle"
  | "locating"
  | "locating_timeout"
  | "out_of_range"
  | "ready"
  | "submitting"
  | "success"
  | "error";

export interface CheckInLocation {
  lat: number;
  lng: number;
  accuracy: number;
}

export interface CheckInEntry {
  id: string;
  city: string;
  cityId?: string;
  placeName: string;
  placeId?: string;
  lat: number;
  lng: number;
  note?: string;
  rating?: number;
  timestamp: number;
}

export interface UseCheckInOptions {
  /** The city slug the user must be within */
  targetCity?: string;
  /** The target coordinates to check distance from */
  targetCoords?: { lat: number; lng: number };
  /** Radius in meters for valid check-in */
  radiusMeters?: number;
  /** Called when check-in is submitted */
  onCheckIn?: (entry: CheckInEntry) => void;
}

export interface UseCheckInReturn {
  status: CheckInStatus;
  location: CheckInLocation | null;
  distanceMeters: number | null;
  history: CheckInEntry[];
  error: string | null;
  /** Request GPS and prepare for check-in */
  requestLocation: () => void;
  /** Submit a check-in at the current location */
  submitCheckIn: (data: { placeName: string; city: string; note?: string; rating?: number }) => Promise<CheckInEntry | null>;
  /** Check if user is within radius of target */
  isWithinRange: boolean;
  /** Clear any error state */
  clearError: () => void;
}

// Haversine formula - distance in meters between two coordinates
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function loadHistory(): CheckInEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHECKIN_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: CheckInEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHECKIN_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

export function useCheckIn(options: UseCheckInOptions = {}): UseCheckInReturn {
  const {
    targetCoords,
    radiusMeters = MAX_ACCURACY_METERS,
    onCheckIn,
  } = options;

  const [status, setStatus] = useState<CheckInStatus>("idle");
  const [location, setLocation] = useState<CheckInLocation | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [history, setHistory] = useState<CheckInEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Load history on mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    if (status === "locating_timeout" || status === "error" || status === "out_of_range") {
      setStatus("idle");
    }
  }, [status]);

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by this browser.");
      setStatus("error");
      return;
    }

    setStatus("locating");
    setError(null);

    // Clear any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    const timeoutId = setTimeout(() => {
      if (status === "locating") {
        setStatus("locating_timeout");
        setError("Location request timed out. Please try again.");
      }
    }, 15000);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        clearTimeout(timeoutId);
        const loc: CheckInLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setLocation(loc);

        let dist: number | null = null;
        if (targetCoords) {
          dist = haversineDistance(
            loc.lat,
            loc.lng,
            targetCoords.lat,
            targetCoords.lng,
          );
          setDistanceMeters(dist);

          if (dist > radiusMeters + (loc.accuracy || 0)) {
            setStatus("out_of_range");
            setError(`You are approximately ${Math.round(dist / 1000)} km away from the check-in location.`);
          } else {
            setStatus("ready");
          }
        } else {
          setStatus("ready");
        }
      },
      (err) => {
        clearTimeout(timeoutId);
        let msg = "Failed to get your location.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Location permission denied. Please enable GPS in your browser settings.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "Location information is unavailable.";
        }
        setError(msg);
        setStatus("error");
      },
      { timeout: 15000, maximumAge: 30000 },
    );
  }, [status, targetCoords, radiusMeters]);

  const submitCheckIn = useCallback(
    async (data: {
      placeName: string;
      city: string;
      note?: string;
      rating?: number;
    }): Promise<CheckInEntry | null> => {
      if (!location) {
        setError("No location data available. Please request location first.");
        return null;
      }

      if (targetCoords) {
        const dist = haversineDistance(
          location.lat,
          location.lng,
          targetCoords.lat,
          targetCoords.lng,
        );
        if (dist > radiusMeters + (location.accuracy || 0)) {
          setError(`Check-in rejected: you are ${Math.round(dist / 1000)} km away.`);
          return null;
        }
      }

      setStatus("submitting");

      const entry: CheckInEntry = {
        id: crypto.randomUUID(),
        city: data.city,
        placeName: data.placeName,
        lat: location.lat,
        lng: location.lng,
        note: data.note,
        rating: data.rating,
        timestamp: Date.now(),
      };

      try {
        // Save to local history
        const updated = [entry, ...history];
        saveHistory(updated);
        setHistory(updated);

        setStatus("success");
        onCheckIn?.(entry);
        return entry;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Check-in failed");
        setStatus("error");
        return null;
      }
    },
    [location, targetCoords, radiusMeters, history, onCheckIn],
  );

  const isWithinRange =
    distanceMeters !== null && distanceMeters <= radiusMeters + (location?.accuracy || 0);

  // Cleanup watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    status,
    location,
    distanceMeters,
    history,
    error,
    requestLocation,
    submitCheckIn,
    isWithinRange,
    clearError,
  };
}
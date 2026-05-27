/**
 * SOS Service Worker Registration
 *
 * This module provides offline support for the ChinaConnect SOS emergency system.
 * It registers a service worker that caches emergency data and pages for offline access.
 *
 * Features:
 * - Caches emergency contact data
 * - Provides offline fallback page
 * - Works with the SOS floating button on all pages
 *
 * @module sos-service-worker
 */

import type { EmergencyCity, EmergencyContact } from "@/types/emergency";

export const SERVICE_WORKER_PATH = "/sw.js";
export const CACHE_NAME = "chinaconnect-sos-v1";
export const EMERGENCY_CACHE_NAME = "chinaconnect-emergency-v1";

/**
 * Emergency data URLs to cache for offline use
 */
export const OFFLINE_ASSETS = ["/offline", "/emergency", "/offline-data/emergency.json"];

/**
 * Service Worker registration options
 */
export const SW_REGISTRATION_OPTIONS: RegistrationOptions = {
  scope: "/",
  updateViaCache: "none",
};

/**
 * Register the SOS Service Worker
 *
 * @returns Promise<ServiceWorkerRegistration | undefined>
 */
export async function registerSOSServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    console.warn("[SOS] Service Worker not supported in this environment");
    return undefined;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      SERVICE_WORKER_PATH,
      SW_REGISTRATION_OPTIONS,
    );

    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            console.log("[SOS] New service worker available");
          }
        });
      }
    });

    console.log("[SOS] Service Worker registered successfully:", registration.scope);
    return registration;
  } catch (error) {
    console.error("[SOS] Service Worker registration failed:", error);
    return undefined;
  }
}

/**
 * Unregister the SOS Service Worker
 *
 * @returns Promise<boolean>
 */
export async function unregisterSOSServiceWorker(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  for (const registration of registrations) {
    await registration.unregister();
  }
  return true;
}

/**
 * Check if service worker is supported and active
 *
 * @returns boolean
 */
export function isServiceWorkerSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator;
}

/**
 * Check if the app is currently running offline
 *
 * @returns boolean
 */
export function isOffline(): boolean {
  return typeof navigator !== "undefined" && !navigator.onLine;
}

/**
 * Listen for online/offline events
 *
 * @param onlineCallback - Called when coming back online
 * @param offlineCallback - Called when going offline
 * @returns Cleanup function
 */
export function listenForNetworkChanges(
  onlineCallback: () => void,
  offlineCallback: () => void,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("online", onlineCallback);
  window.addEventListener("offline", offlineCallback);

  return () => {
    window.removeEventListener("online", onlineCallback);
    window.removeEventListener("offline", offlineCallback);
  };
}

/**
 * Get cached emergency data from service worker
 *
 * @param cityId - Optional city ID to filter by
 * @returns Promise<EmergencyCity[] | null>
 */
export async function getCachedEmergencyData(cityId?: string): Promise<EmergencyCity[] | null> {
  if (!("caches" in window)) {
    return null;
  }

  try {
    const cache = await caches.open(EMERGENCY_CACHE_NAME);
    const response = await cache.match("/offline-data/emergency.json");

    if (!response) {
      return null;
    }

    const data = (await response.json()) as { cities: EmergencyCity[] };
    return cityId ? data.cities.filter((c) => c.id === cityId) : data.cities;
  } catch (error) {
    console.error("[SOS] Failed to get cached emergency data:", error);
    return null;
  }
}

/**
 * Emergency contact types
 */
export interface EmergencyType {
  police: EmergencyContact;
  ambulance: EmergencyContact;
  fire: EmergencyContact;
}

/**
 * Get emergency contact for a specific type
 *
 * @param type - One of: police, ambulance, fire, traffic
 * @param cityData - Optional city-specific data
 * @returns Emergency contact info
 */
export function getEmergencyContact(
  type: keyof EmergencyType,
  cityData?: EmergencyCity,
): EmergencyContact | null {
  if (cityData?.emergencies?.[type]) {
    return cityData.emergencies[type];
  }

  // Fallback to national numbers
  const nationalContacts: Record<string, EmergencyContact> = {
    police: { number: "110", name: "Police", nameCn: "警察" },
    ambulance: { number: "120", name: "Ambulance", nameCn: "救护车" },
    fire: { number: "119", name: "Fire", nameCn: "消防" },
    traffic: { number: "122", name: "Traffic", nameCn: "交通事故" },
  };

  return nationalContacts[type] || null;
}

/**
 * Initiate an emergency call using tel: protocol
 *
 * @param number - Emergency number to dial
 * @returns boolean - Whether the call was initiated
 */
export function initiateEmergencyCall(number: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.location.href = `tel:${number}`;
    return true;
  } catch (error) {
    console.error("[SOS] Failed to initiate emergency call:", error);
    return false;
  }
}

// Re-export types for convenience
export type { EmergencyCity, EmergencyContact } from "@/types/emergency";

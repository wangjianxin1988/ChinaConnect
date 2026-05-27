// Service Worker Registration for ChinaConnect PWA

export interface SWRegistrationOptions {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

export interface CacheStatus {
  version: string;
  caches: Record<string, number>;
  total: number;
}

// Check if SW is supported
export function isServiceWorkerSupported(): boolean {
  return "serviceWorker" in navigator;
}

// Register the service worker
export async function registerServiceWorker(
  options?: SWRegistrationOptions,
): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    console.log("[PWA] Service Worker not supported");
    options?.onError?.(new Error("Service Worker not supported"));
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    console.log("[PWA] Service Worker registered:", registration.scope);

    // Handle updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;

      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              // New content available
              console.log("[PWA] New content available, refresh to update");
              options?.onUpdate?.(registration);
            } else {
              // Content cached for the first time
              console.log("[PWA] Content cached for offline use");
              options?.onSuccess?.(registration);
            }
          }
        });
      }
    });

    // Check for updates periodically
    startUpdateCheck(registration);

    options?.onSuccess?.(registration);
    return registration;
  } catch (error) {
    console.error("[PWA] Service Worker registration failed:", error);
    options?.onError?.(error as Error);
    return null;
  }
}

// Start periodic update checks
function startUpdateCheck(
  registration: ServiceWorkerRegistration,
  interval = 60 * 60 * 1000,
): () => void {
  const timerId = setInterval(() => {
    registration.update();
  }, interval);

  return () => clearInterval(timerId);
}

// Unregister the service worker
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!isServiceWorkerSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
      console.log("[PWA] Service Worker unregistered");
      return true;
    }
    return false;
  } catch (error) {
    console.error("[PWA] Service Worker unregistration failed:", error);
    return false;
  }
}

// Request background sync
export async function requestBackgroundSync(tag: string): Promise<boolean> {
  if (!isServiceWorkerSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && "sync" in registration) {
      // @ts-expect-error - sync is not in TypeScript types
      await registration.sync.register(tag);
      console.log("[PWA] Background sync registered:", tag);
      return true;
    }
    return false;
  } catch (error) {
    console.error("[PWA] Background sync registration failed:", error);
    return false;
  }
}

// Send message to service worker
export async function sendMessageToSW(message: Record<string, unknown>): Promise<void> {
  if (!isServiceWorkerSupported()) return;

  const registration = await navigator.serviceWorker.getRegistration();
  if (registration?.active) {
    registration.active.postMessage(message);
  }
}

// Get cache status from service worker
export async function getCacheStatus(): Promise<CacheStatus | null> {
  if (!isServiceWorkerSupported()) return null;

  return new Promise((resolve) => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "CACHE_STATUS") {
        navigator.serviceWorker.removeEventListener("message", handleMessage);
        resolve(event.data as CacheStatus);
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);

    navigator.serviceWorker.ready.then((registration) => {
      if (registration.active) {
        registration.active.postMessage({ type: "GET_CACHE_STATUS" });
      }
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
      resolve(null);
    }, 5000);
  });
}

// Cache city data manually
export async function cacheCityData(cityData: Record<string, unknown>): Promise<void> {
  await sendMessageToSW({
    type: "CACHE_CITY",
    payload: cityData,
  });
}

// Cache AI response manually
export async function cacheAIResponse(query: string, response: unknown): Promise<void> {
  await sendMessageToSW({
    type: "CACHE_AI_RESPONSE",
    payload: { query, response },
  });
}

// Clear all caches
export async function clearAllCaches(): Promise<void> {
  await sendMessageToSW({ type: "CLEAR_CACHE" });
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.log("[PWA] Notifications not supported");
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

// Show a local notification
export async function showNotification(
  title: string,
  options?: NotificationOptions,
): Promise<void> {
  const permission = await requestNotificationPermission();

  if (permission !== "granted") {
    console.log("[PWA] Notification permission denied");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.showNotification(title, {
        icon: "/icons/icon-192.png",
        badge: "/icons/badge-72.png",
        ...options,
      });
    }
  } catch (error) {
    console.error("[PWA] Failed to show notification:", error);
  }
}

// Check if running in standalone mode (installed PWA)
export function isRunningAsPWA(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-expect-error - navigator.standalone is not in TypeScript types
    window.navigator.standalone === true
  );
}

// Initialize PWA features
export async function initializePWA(): Promise<void> {
  if (!isServiceWorkerSupported()) return;

  // Register service worker
  await registerServiceWorker({
    onSuccess: (_registration) => {
      console.log("[PWA] Initialized successfully");
      // Notify user if update available
      if (navigator.serviceWorker.controller) {
        console.log("[PWA] App is ready for offline use");
      }
    },
    onUpdate: (_registration) => {
      console.log("[PWA] Update available");
      // Could show an update banner here
    },
  });

  // Request notification permission if appropriate
  if (isRunningAsPWA()) {
    requestNotificationPermission();
  }
}

// Auto-initialize when imported
let initialized = false;
export function autoInitialize(): void {
  if (initialized) return;
  initialized = true;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initializePWA());
  } else {
    initializePWA();
  }
}

export default {
  isServiceWorkerSupported,
  registerServiceWorker,
  unregisterServiceWorker,
  requestBackgroundSync,
  sendMessageToSW,
  getCacheStatus,
  cacheCityData,
  cacheAIResponse,
  clearAllCaches,
  requestNotificationPermission,
  showNotification,
  isRunningAsPWA,
  initializePWA,
  autoInitialize,
};

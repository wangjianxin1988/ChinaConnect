// Service Worker for ChinaConnect Emergency System
// Caches emergency phrases, contacts, and embassy info for offline use

const CACHE_NAME = "chinaconnect-emergency-v1";
const OFFLINE_URL = "/offline-emergency.html";

// Emergency data to cache
const EMERGENCY_URLS = [
  "/",
  "/beijing",
  "/shanghai",
  "/guangzhou",
  "/xian",
  "/chengdu",
  "/hangzhou",
  "/emergency",
];

// Install event - cache essential emergency resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching emergency resources");
      return cache.addAll(EMERGENCY_URLS);
    }),
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)),
      );
    }),
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip chrome-extension and other non-http(s) requests
  if (!event.request.url.startsWith("http")) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          // Don't cache non-success responses
          if (!response || response.status !== 200 || response.type !== "basic") {
            // Still cache opaque responses (e.g., from CDN)
            if (response && response.type === "opaque") {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return response;
          }

          // Clone and cache the response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }
          return new Response("Offline", { status: 503 });
        });
    }),
  );
});

// Listen for messages from the main app
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});

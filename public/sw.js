// ChinaConnect Service Worker with Workbox-style caching strategies
// Version: 1.1.0 - Enhanced offline support

const CACHE_VERSION = 'v1.1.0';
const CACHE_NAME = `chinaconnect-${CACHE_VERSION}`;

// Workbox-style cache names for different strategies
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;
const CITY_CACHE = `${CACHE_NAME}-cities`;
const AI_RESPONSE_CACHE = `${CACHE_NAME}-ai-responses`;
const IMAGE_CACHE = `${CACHE_NAME}-images`;

// Static assets to precache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline/',
  '/offline-emergency.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon.svg',
];

// City pages for offline access
const _CITY_PAGES = [
  '/city/beijing',
  '/city/shanghai',
  '/city/guangzhou',
  '/city/xian',
  '/city/chengdu',
  '/city/hangzhou',
];

// Critical routes - always available offline
const CRITICAL_ROUTES = [
  '/',
  '/cities',
  '/food',
  '/ai',
  '/emergency',
  '/guide',
];

// Cache expiry: 7 days for dynamic content
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000;

// Install event - precache static assets
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing Service Worker v${CACHE_VERSION}`);

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Precaching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.error('[SW] Failed to precache some assets:', err);
        // Continue even if some assets fail
        return Promise.resolve();
      });
    })
  );

  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // Delete old version caches
            return name.startsWith('chinaconnect-') &&
                   !name.includes(CACHE_VERSION);
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );

  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // Skip WebSocket requests
  if (url.protocol === 'ws:' || url.protocol === 'wss:') return;

  // Skip AI API requests - do not cache, these require network
  if (isAIAPIRequest(url)) {
    event.respondWith(
      networkFirstWithCacheFallback(request, AI_RESPONSE_CACHE)
    );
    return;
  }

  // Determine caching strategy based on request type
  if (isStaticAsset(url)) {
    // Cache-first strategy for static assets
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else if (isCityPage(url) || isCityData(url)) {
    // Cache-first with network fallback for city pages and data
    event.respondWith(cacheFirstWithNetworkFallback(request, CITY_CACHE));
  } else if (isImage(url)) {
    // Stale-while-revalidate for images
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
  } else if (isCriticalRoute(url)) {
    // Network-first for critical pages (with cache fallback)
    event.respondWith(networkFirstWithCacheFallback(request, DYNAMIC_CACHE));
  } else {
    // Network-first for everything else
    event.respondWith(networkFirstWithCacheFallback(request, DYNAMIC_CACHE));
  }
});

// Helper functions

function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|woff2?|ttf|eot|ico|svg|png|jpg|jpeg|gif|webp)$/);
}

function isCityPage(url) {
  // Match city pages like /city/beijing, /city/shanghai
  return url.pathname.match(/\/city\/[a-z]+$/);
}

function isCityData(url) {
  return url.pathname.startsWith('/api/cities') ||
         url.pathname.startsWith('/data/cities');
}

function isAIAPIRequest(url) {
  // Do not cache AI API requests - require network, show cached responses only for display
  return url.pathname.startsWith('/api/ai') ||
         url.pathname.startsWith('/api/chat') ||
         url.pathname.includes('dify') ||
         url.pathname.includes('openai') ||
         url.pathname.includes('anthropic') ||
         url.pathname.includes('minimax');
}

function isImage(url) {
  return url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/) !== null;
}

function isCriticalRoute(url) {
  return CRITICAL_ROUTES.some(route =>
    url.pathname === route || url.pathname.startsWith(`${route}/`)
  );
}

// Cache-first strategy (good for static assets)
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Check if cache is still valid
    const cachedDate = cachedResponse.headers.get('sw-cache-date');
    if (cachedDate && Date.now() - Number.parseInt(cachedDate) < CACHE_EXPIRY) {
      return cachedResponse;
    }
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      // Clone and add cache timestamp header
      const responseToCache = new Response(await networkResponse.clone().blob(), {
        headers: {
          ...Object.fromEntries(networkResponse.headers.entries()),
          'sw-cache-date': Date.now().toString()
        }
      });
      cache.put(request, responseToCache);
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network request failed:', error);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return offline fallback for navigation
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline/') ||
                          await caches.match('/offline-emergency.html');
      if (offlinePage) return offlinePage;
    }
    return new Response('Offline', { status: 503 });
  }
}

// Cache-first with network fallback
async function cacheFirstWithNetworkFallback(request, cacheName) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Refresh cache in background
    fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        caches.open(cacheName).then(cache => cache.put(request, networkResponse.clone()));
      }
    }).catch(() => {});
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network request failed for city data:', error);
    return new Response(JSON.stringify({
      error: 'Offline',
      cached: false,
      message: 'This content is not available offline. Please connect to the internet.'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Network-first with cache fallback (good for dynamic content)
async function networkFirstWithCacheFallback(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());

      // Send cache status update to clients
      broadcastCacheUpdate(cacheName);
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network request failed, trying cache:', error);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // For navigation requests, return offline page
    if (request.mode === 'navigate') {
      // Try offline page in order of preference
      const offlinePage = await caches.match('/offline/') ||
                          await caches.match('/offline.html') ||
                          await caches.match('/offline-emergency.html');
      if (offlinePage) {
        return offlinePage;
      }
      // Fallback inline response
      return new Response(getOfflineHTML(), {
        status: 503,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Broadcast cache update to all clients
async function broadcastCacheUpdate(_cacheName) {
  try {
    const clients = await self.clients.matchAll();
    const status = await getCacheStatus();
    clients.forEach(client => {
      client.postMessage({
        type: 'CACHE_STATUS',
        ...status
      });
    });
  } catch (_e) {
    // Ignore broadcast errors
  }
}

// Inline offline HTML (fallback when no offline page cached)
function getOfflineHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - ChinaConnect</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;background:linear-gradient(135deg,#dc2626,#991b1b);min-height:100vh;display:flex;align-items:center;justify-content:center;color:white}
    .container{max-width:400px;text-align:center;padding:20px}
    h1{font-size:2rem;margin-bottom:1rem}
    .numbers{background:rgba(255,255,255,0.2);border-radius:16px;padding:24px;margin:24px 0;text-align:left}
    .num{display:flex;align-items:center;justify-content:space-between;padding:12px;margin:8px 0;background:rgba(255,255,255,0.15);border-radius:8px}
    .num a{color:white;text-decoration:none;display:flex;align-items:center;gap:12px;width:100%}
    .num span{font-size:1.2rem}
    .num b{font-size:1.2rem}
  </style>
</head>
<body>
  <div class="container">
    <h1>You're Offline</h1>
    <p>Emergency contacts work without internet:</p>
    <div class="numbers">
      <div class="num"><a href="tel:110"><span>Police</span><b>110</b></a></div>
      <div class="num"><a href="tel:120"><span>Ambulance</span><b>120</b></a></div>
      <div class="num"><a href="tel:119"><span>Fire</span><b>119</b></a></div>
    </div>
    <p><a href="/" style="color:white">Return to home</a></p>
  </div>
</body>
</html>`;
}

// Stale-while-revalidate (good for images and non-critical assets)
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Fetch in background regardless of cache hit
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch((error) => {
    console.log('[SW] Background fetch failed:', error);
  });

  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }

  // Otherwise wait for network
  return fetchPromise;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  } else if (event.tag === 'sync-user-data') {
    event.waitUntil(syncUserData());
  } else if (event.tag === 'sync-city-cache') {
    event.waitUntil(cacheTopCities());
  }
});

// Periodically cache top cities for offline access
async function cacheTopCities() {
  const cities = ['beijing', 'shanghai', 'guangzhou', 'xian', 'chengdu', 'hangzhou'];

  for (const city of cities) {
    try {
      const response = await fetch(`/city/${city}`);
      if (response.ok) {
        const cache = await caches.open(CITY_CACHE);
        await cache.put(`/city/${city}`, response.clone());
        console.log('[SW] Cached city:', city);
      }
    } catch (error) {
      console.log('[SW] Failed to cache city:', city, error);
    }
  }
}

// Sync favorites when back online
async function syncFavorites() {
  try {
    // Get pending favorites from IndexedDB
    const db = await openDB();
    const tx = db.transaction('pending-favorites', 'readwrite');
    const store = tx.objectStore('pending-favorites');
    const pendingFavorites = await store.getAll();

    for (const favorite of pendingFavorites) {
      try {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(favorite)
        });

        // Remove from pending after successful sync
        await store.delete(favorite.id);
      } catch (error) {
        console.log('[SW] Failed to sync favorite:', error);
      }
    }
  } catch (error) {
    console.log('[SW] Favorites sync failed:', error);
  }
}

// Sync user data when back online
async function syncUserData() {
  try {
    const db = await openDB();
    const tx = db.transaction('pending-user-data', 'readwrite');
    const store = tx.objectStore('pending-user-data');
    const pendingData = await store.getAll();

    for (const data of pendingData) {
      try {
        await fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        await store.delete(data.id);
      } catch (error) {
        console.log('[SW] Failed to sync user data:', error);
      }
    }
  } catch (error) {
    console.log('[SW] User data sync failed:', error);
  }
}

// IndexedDB helper
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ChinaConnect-Offline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create stores for offline data
      if (!db.objectStoreNames.contains('pending-favorites')) {
        db.createObjectStore('pending-favorites', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('pending-user-data')) {
        db.createObjectStore('pending-user-data', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('cached-cities')) {
        db.createObjectStore('cached-cities', { keyPath: 'slug' });
      }

      if (!db.objectStoreNames.contains('cached-ai-responses')) {
        db.createObjectStore('cached-ai-responses', { keyPath: 'query' });
      }
    };
  });
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body || 'New notification from ChinaConnect',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Close' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'ChinaConnect', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Message handling for cache management
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CACHE_CITY':
      cacheCityData(payload);
      break;

    case 'CACHE_AI_RESPONSE':
      cacheAIResponse(payload);
      break;

    case 'CLEAR_CACHE':
      clearAllCaches();
      break;

    case 'GET_CACHE_STATUS':
      getCacheStatus().then((status) => {
        event.ports[0]?.postMessage(status);
      });
      break;

    case 'SYNC_FAVORITES':
      syncFavorites();
      break;

    default:
      console.log('[SW] Unknown message type:', type);
  }
});

// Cache specific city data
async function cacheCityData(cityData) {
  if (!cityData?.slug) return;

  try {
    const db = await openDB();
    const tx = db.transaction('cached-cities', 'readwrite');
    const store = tx.objectStore('cached-cities');
    await store.put({
      ...cityData,
      cachedAt: Date.now()
    });
    console.log('[SW] Cached city data:', cityData.slug);
  } catch (error) {
    console.log('[SW] Failed to cache city data:', error);
  }
}

// Cache AI response
async function cacheAIResponse(responseData) {
  if (!responseData?.query) return;

  try {
    const db = await openDB();
    const tx = db.transaction('cached-ai-responses', 'readwrite');
    const store = tx.objectStore('cached-ai-responses');
    await store.put({
      query: responseData.query,
      response: responseData.response,
      cachedAt: Date.now()
    });
    console.log('[SW] Cached AI response for:', responseData.query);
  } catch (error) {
    console.log('[SW] Failed to cache AI response:', error);
  }
}

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter((name) => name.startsWith('chinaconnect-'))
      .map((name) => caches.delete(name))
  );
  console.log('[SW] All caches cleared');
}

// Get cache status
async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const chinaconnectCaches = cacheNames.filter((name) => name.startsWith('chinaconnect-'));

  const status = {
    version: CACHE_VERSION,
    caches: {} as Record<string, number>,
    total: 0
  };

  for (const cacheName of chinaconnectCaches) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    status.caches[cacheName] = keys.length;
    status.total += keys.length;
  }

  // Get IndexedDB stats
  try {
    const db = await openDB();
    const caches = ['pending-favorites', 'pending-user-data', 'cached-cities', 'cached-ai-responses'];

    for (const storeName of caches) {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const count = await new Promise((resolve) => {
          const request = store.count();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => resolve(0);
        });
        status.caches[storeName] = count as number;
      } catch {
        // Store might not exist
      }
    }
  } catch {
    // IndexedDB not available
  }

  return status;
}

console.log('[SW] Service Worker loaded');

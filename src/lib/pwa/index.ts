export {
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
} from "./sw-register";
export {
  cacheFirst,
  networkFirst,
  staleWhileRevalidate,
  cacheOnly,
  networkOnly,
  openCacheDB,
  getFromIDBCache,
  putInIDBCache,
} from "./cache-strategy";
export type { CacheEntry, CacheOptions } from "./cache-strategy";

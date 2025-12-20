// Firebase messaging service worker disabled during Supabase migration.
// The original service worker used Firebase SDK and contained project config.
// To re-enable push notifications, either:
// 1) Reintroduce FCM with proper secure handling (server-side FCM & runtime config),
// 2) Migrate to Web Push (VAPID) and implement a standard Push API service worker.

self.addEventListener('install', (event) => {
  console.log('[SW] Placeholder service worker installed - messaging disabled');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Placeholder service worker activated');
});

// No background message handling implemented in this placeholder.

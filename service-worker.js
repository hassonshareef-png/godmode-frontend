const CACHE_NAME = "godmode-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/app2.js",
  "/auth-utils.js",
  "/style2.css",
  "/galaxy.css",
  "/manifest.json"
];

// Install: pre-cache static shell
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  clients.claim();
});

// Fetch: cache-first for static assets, network-first for API calls
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Let non-GET and cross-origin API requests pass through
  if (e.request.method !== "GET" || url.origin !== self.location.origin) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Cache-first for same-origin static files
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((response) => {
        // Cache successful responses for static assets
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback: serve index.html for navigation requests
        if (e.request.mode === "navigate") {
          return caches.match("/index.html");
        }
      });
    })
  );
});

// Install and cache core files
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("godmode-cache").then((cache) => {
      return cache.addAll([
        "index.html",
        "numbers.html",
        "manifest.json",
        "icon-192.png",
        "icon-512.png"
      ]);
    })
  );
  self.skipWaiting();
});

// Activate immediately
self.addEventListener("activate", (e) => {
  clients.claim();
});

// Serve from cache first, then network
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request);
    })
  );
});

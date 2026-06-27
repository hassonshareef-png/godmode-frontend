self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("godmode-cache").then((cache) => {
      return cache.addAll([
        "index.html",
        "numbers.html",
        "manifest.json"
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});

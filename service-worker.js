const KEEP_ALIVE_URL = "https://godmode-backend2.onrender.com/health";
const KEEP_ALIVE_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  clients.claim();
  // Start keep-alive pings immediately when service worker activates
  startKeepAlive();
});

self.addEventListener("fetch", (e) => {
  // Basic passthrough fetch
  e.respondWith(fetch(e.request));
});

// Keep the backend alive by pinging /health every 10 minutes
function startKeepAlive() {
  setInterval(() => {
    fetch(KEEP_ALIVE_URL, { mode: "no-cors" })
      .catch(() => {}); // Silently ignore errors
  }, KEEP_ALIVE_INTERVAL_MS);
}

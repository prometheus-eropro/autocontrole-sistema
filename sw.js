const CACHE_NAME = "autocontrole-v3";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/app.html",
  "/css/style.css",
  "/logo.png",
  "/icon-192.png",
  "/icon-512.png"
];

// 🔹 INSTALAÇÃO (cache inicial)
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// 🔹 ATIVAÇÃO (limpa cache antigo)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 🔹 FETCH (INTELIGENTE)
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // 👉 HTML → NETWORK FIRST (sempre tenta atualizar)
  if (req.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, clone);
          });
          return res;
        })
        .catch(() => caches.match(req).then(res => res || caches.match("/index.html")))
    );
    return;
  }

  // 👉 JS/CSS/IMG → CACHE FIRST (rápido)
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, clone);
        });
        return res;
      });
    })
  );
});
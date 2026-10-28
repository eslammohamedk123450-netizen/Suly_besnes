const CACHE_NAME = 'business-empire-shell-v4';
const BASE_URL = new URL('./', self.registration.scope).pathname;
const APP_SHELL = [BASE_URL, `${BASE_URL}manifest.webmanifest`, `${BASE_URL}icons/app-icon.svg`, `${BASE_URL}images/cairo-skyline-lite.webp`];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    for (const path of APP_SHELL) {
      try {
        const response = await fetch(path, { cache: 'reload' });
        if (response.ok) await cache.put(path, response);
      } catch {
        // Optional shell assets must not prevent the application from opening.
      }
    }
    const shell = await cache.match(BASE_URL);
    if (shell) {
      const html = await shell.text();
      const assetPaths = [...html.matchAll(/(?:src|href)="([^\"]+\.(?:js|css)(?:\?[^\"]*)?)"/g)]
        .map((match) => match[1])
        .filter((path) => path.startsWith(BASE_URL));
      await Promise.all(assetPaths.map(async (path) => {
        try {
          const response = await fetch(path, { cache: 'reload' });
          if (response.ok) await cache.put(path, response);
        } catch {
          // A failed optional asset fetch should not block installation.
        }
      }));
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(BASE_URL, copy));
          }
          return response;
        })
        .catch(async () => (await caches.match(BASE_URL)) ?? Response.error()),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});

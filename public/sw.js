self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

self.addEventListener('fetch', (event) => {
  // Simple pass-through network-first strategy for dynamic POS scan companion
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request) as any))
})

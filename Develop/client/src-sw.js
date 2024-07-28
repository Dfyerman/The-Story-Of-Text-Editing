import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

const pageCache = new CacheFirst({
  cacheName: 'page-cache',
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxAgeSeconds: 30 * 24 * 60 * 60,
    }),
  ],
});

// Warm the cache with specific URLs
registerRoute(
  ({ url }) => url.pathname === '/index.html' || url.pathname === '/',
  ({ request }) => fetch(request).then((response) => {
    return caches.open(pageCache.cacheName).then((cache) => {
      cache.put(request, response.clone());
      return response;
    });
  })
);

registerRoute(
  ({ request }) => request.mode === 'navigate',
  ({ event }) => pageCache.handle({ event })
);

// Implement asset caching
registerRoute(
  ({ request }) => ['style', 'script', 'worker'].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: 'asset-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);
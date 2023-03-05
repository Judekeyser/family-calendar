self.addEventListener('install', (event) => {
  const cacheKey = 'CalendarSW_v1';

  event.waitUntil(caches.open(cacheKey).then(cache => {
    return cache.addAll([
      '/image/logo192.png',
      '/image/logo512.png',
      '/image/logo64.png'
    ]);
  }));
});
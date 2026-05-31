// Workbox via CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');
// idb via CDN for IndexedDB operations inside Service Worker
importScripts('https://cdn.jsdelivr.net/npm/idb@8/build/umd/index-min.js');

if (workbox) {
  workbox.setConfig({ debug: false });

  // ── App Shell: CSS, JS, HTML, fonts, local images ──────────────────────
  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === 'document' ||
      request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'image' ||
      request.destination === 'font',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'story-app-shell-v1',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        }),
      ],
    })
  );

  // ── Leaflet Map Tiles: CacheFirst so maps render offline ───────────────
  workbox.routing.registerRoute(
    ({ url }) =>
      url.hostname.includes('tile.openstreetmap.org') ||
      url.hostname.includes('arcgisonline.com') ||
      url.hostname.includes('tile.opentopomap.org'),
    new workbox.strategies.CacheFirst({
      cacheName: 'leaflet-tiles-v1',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 250,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    })
  );

  // ── Dicoding Story API: NetworkFirst with cache fallback ───────────────
  workbox.routing.registerRoute(
    ({ url }) => url.href.includes('story-api.dicoding.dev/v1/stories'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'dicoding-api-v1',
      networkTimeoutSeconds: 5,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 10 * 60, // 10 minutes
        }),
      ],
    })
  );
}

// ── Background Sync: upload queued stories ─────────────────────────────────
async function syncPendingStories() {
  if (typeof idb === 'undefined') return;

  try {
    const db = await idb.openDB('story-app-db', 1);
    const pendingStories = await db.getAll('offline-sync');

    for (const story of pendingStories) {
      try {
        const formData = new FormData();
        formData.append('description', story.description);
        formData.append('photo', story.photoFile);

        if (story.lat !== null && story.lat !== undefined && story.lat !== '') {
          formData.append('lat', String(story.lat));
        }
        if (story.lon !== null && story.lon !== undefined && story.lon !== '') {
          formData.append('lon', String(story.lon));
        }

        const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
          method: 'POST',
          headers: { Authorization: `Bearer ${story.token}` },
          body: formData,
        });

        if (response.ok) {
          await db.delete('offline-sync', story.id);

          self.registration.showNotification('Cerita Berhasil Dikirim! ✅', {
            body: 'Cerita offline Anda telah disinkronkan secara otomatis.',
            icon: '/icon-192.png',
            badge: '/icon-192.png',
          });

          const clients = await self.clients.matchAll({ type: 'window' });
          for (const client of clients) {
            client.postMessage({
              type: 'SYNC_COMPLETE',
              message: 'Cerita berhasil disinkronkan.',
            });
          }
        }
      } catch {
        // Single story failed — will retry on next sync event
      }
    }
  } catch {
    // DB unavailable — skip sync
  }
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-new-stories') {
    event.waitUntil(syncPendingStories());
  }
});

// ── Push Notifications ─────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  event.waitUntil(
    (async () => {
      let title = 'Story Baru! 📸';
      let body = 'Ada cerita menarik baru dari pengguna lain!';

      try {
        const response = await fetch('https://story-api.dicoding.dev/v1/stories?page=1&size=1');
        const data = await response.json();
        const story = data.listStory && data.listStory.length > 0 ? data.listStory[0] : null;
        
        if (story) {
          title = `Cerita Baru dari ${story.name}`;
          body = story.description.slice(0, 50) + '...';
        }
      } catch (err) {
        // Fallback if fetch fails
      }

      if (event.data) {
        try {
          const pushData = event.data.json();
          title = pushData.title || title;
          body = pushData.body || body;
        } catch {
          body = event.data.text() || body;
        }
      }

      await self.registration.showNotification(title, {
        body: body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [100, 50, 100],
        data: { url: '/' },
      });
    })()
  );
});

// ── Notification Click: focus or open app window ───────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('/');
    })
  );
});

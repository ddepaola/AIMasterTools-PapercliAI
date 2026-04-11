/**
 * AIMasterTools Service Worker
 * Provides offline access to key pages and caches static assets.
 */

const CACHE_NAME = 'aimastertools-v1';
const STATIC_CACHE = 'aimastertools-static-v1';
const DYNAMIC_CACHE = 'aimastertools-dynamic-v1';

// Core pages to cache on install (shell)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/about.html',
  '/ai-prompt-library.html',
  '/crypto-signals/',
  '/crypto-signals/index.html',
  '/reviews/claude.html',
  '/reviews/chatgpt.html',
  '/reviews/midjourney.html',
  '/reviews/cursor.html',
  '/reviews/perplexity.html',
  '/css/styles.css',
  '/offline.html',
];

// Install — precache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
  const keepCaches = [STATIC_CACHE, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !keepCaches.includes(key))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — network-first for HTML, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Cache-first for CSS, JS, images, icons
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Network-first for HTML pages (fresh content, fall back to cache)
  event.respondWith(networkFirst(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Asset unavailable offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Serve offline fallback for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    return new Response('Offline', { status: 503 });
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  let data = { title: 'AIMasterTools', body: 'New update available!', url: '/' };
  try {
    data = { ...data, ...event.data.json() };
  } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      image: data.image || undefined,
      tag: data.tag || 'aimastertools-notification',
      renotify: true,
      requireInteraction: false,
      data: { url: data.url },
      actions: [
        { action: 'open', title: 'Read Now' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url === targetUrl && 'focus' in client) {
            return client.focus();
          }
        }
        return clients.openWindow(targetUrl);
      })
  );
});

// Background sync for notification subscription retries
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-subscription') {
    event.waitUntil(syncSubscription());
  }
});

async function syncSubscription() {
  // Re-attempt sending subscription to server when back online
  const db = await openDB();
  const pending = await db.get('pending-subscription');
  if (pending) {
    await sendSubscriptionToServer(pending);
    await db.delete('pending-subscription');
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('aimastertools-sw', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('pending-subscription');
    req.onsuccess = () => resolve(wrapDB(req.result));
    req.onerror = reject;
  });
}

function wrapDB(db) {
  return {
    get: (key) =>
      new Promise((res, rej) => {
        const tx = db.transaction('pending-subscription', 'readonly');
        const req = tx.objectStore('pending-subscription').get(key);
        req.onsuccess = () => res(req.result);
        req.onerror = rej;
      }),
    delete: (key) =>
      new Promise((res, rej) => {
        const tx = db.transaction('pending-subscription', 'readwrite');
        const req = tx.objectStore('pending-subscription').delete(key);
        req.onsuccess = () => res();
        req.onerror = rej;
      }),
  };
}

async function sendSubscriptionToServer(subscription) {
  await fetch('/api/push-subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  });
}

const CACHE_VERSION = 'mizzz-pwa-v1'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const PAGE_CACHE = `${CACHE_VERSION}-pages`
const OFFLINE_URL = '/offline.html'

const STATIC_ASSETS = [
  '/',
  '/site.webmanifest',
  '/offline.html',
  '/logo.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys
      .filter((key) => !key.startsWith(CACHE_VERSION))
      .map((key) => caches.delete(key))
    )).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const acceptsHtml = request.headers.get('accept')?.includes('text/html')

  if (acceptsHtml) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cloned = response.clone()
          caches.open(PAGE_CACHE).then((cache) => cache.put(request, cloned))
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          if (cached) return cached
          return caches.match(OFFLINE_URL)
        }),
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request)
      .then((response) => {
        const cloned = response.clone()
        caches.open(STATIC_CACHE).then((cache) => cache.put(request, cloned))
        return response
      })),
  )
})

self.addEventListener('push', (event) => {
  if (!event.data) return
  let payload = {}
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'mizzz update', body: event.data.text() }
  }

  const title = payload.title || 'mizzz update'
  const options = {
    body: payload.body || '新しいお知らせがあります。',
    icon: '/logo.svg',
    badge: '/logo.svg',
    data: {
      url: payload.url || '/',
      sourceSite: payload.sourceSite || 'main',
      campaign: payload.campaign || null,
    },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification?.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const opened = list.find((client) => 'focus' in client)
      if (opened) {
        opened.navigate(targetUrl)
        return opened.focus()
      }
      return self.clients.openWindow(targetUrl)
    }),
  )
})

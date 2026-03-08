const CACHE = 'yihai-v19';
const URLS = [
  '/anki-maker/',
  '/anki-maker/index.html',
  '/anki-maker/manifest.json',
  '/anki-maker/icon-192.png',
  '/anki-maker/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(URLS))
  );
  // 不自动 skipWaiting，等用户点「立即更新」
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

// 收到 SKIP_WAITING 消息后激活新版本
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

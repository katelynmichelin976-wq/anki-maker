const CACHE = 'yihai-v21';

// 这些资源才缓存（静态资源）
const STATIC = [
  '/anki-maker/manifest.json',
  '/anki-maker/icon-192.png',
  '/anki-maker/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC))
  );
  self.skipWaiting();
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
  const url = new URL(e.request.url);
  const isHTML = e.request.destination === 'document' ||
                 url.pathname.endsWith('.html') ||
                 url.pathname.endsWith('/');

  if (isHTML) {
    // HTML 页面：网络优先，失败才用缓存（离线备份）
    e.respondWith(
      fetch(e.request)
        .then(res => {
          // 同时更新缓存里的 HTML
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    // 其他资源：缓存优先
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
  }
});

// 收到 SKIP_WAITING 消息后激活新版本
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

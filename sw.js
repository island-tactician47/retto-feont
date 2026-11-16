// 列島フロント オフライン用 Service Worker
// 新しい版を配るときは VERSION を書き換える（例: v2.17-1 → v2.18-1）
const VERSION = 'v2.18-10';
const CACHE = 'retto-front-' + VERSION;
const FILES = ['./', './index.html', './manifest.json', './icon-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// 端末に保存した版を優先して即起動、裏で通信できれば最新を取り直す
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
    return hit || (await net) || c.match('./index.html');
  }));
});

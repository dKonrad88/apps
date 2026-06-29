/* Apps — launcher / biblioteca pessoal — service worker (PWA)
   Estratégia segura para um portal que pode mudar:
   - Navegação (abrir o launcher): network-first -> sempre pega o index.html mais novo quando online;
     se estiver offline, cai no cache (abre mesmo sem internet).
   - Supabase (saudação): NUNCA passa pelo cache. Sempre rede.
   - Demais GET (CDNs: Tabler icons, supabase-js): stale-while-revalidate.
   Bump CACHE quando quiser forçar limpeza do cache antigo. */
var CACHE = 'apps-v1';
var SHELL = ['./', './index.html', './manifest.json',
             './apple-touch-icon.png', './icon-192.png', './icon-512.png'];

self.addEventListener('message', function (e) {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () {}); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);

  if (/supabase\.(co|in)/.test(url.hostname)) return;       // sessão: sempre rede

  if (req.mode === 'navigate') {                            // abrir o launcher: network-first
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put('./index.html', copy); });
        return res;
      }).catch(function () {
        return caches.match('./index.html').then(function (m) { return m || caches.match('./'); });
      })
    );
    return;
  }

  e.respondWith(                                            // CDNs estáticos: stale-while-revalidate
    caches.match(req).then(function (cached) {
      var net = fetch(req).then(function (res) {
        if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || net;
    })
  );
});

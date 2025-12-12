/// <reference lib="webworker" />
const SEARCH_CACHE = 'oc-search-assets-v1';
const HTML_CACHE = 'oc-html-cache-v1';
const PAGEFIND_PATH = '/pagefind/';
const PRECACHE_URLS = ['/pagefind/pagefind.js', '/pagefind/pagefind.wasm', '/pagefind/pagefind.json'];
const sw = self;
sw.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(SEARCH_CACHE);
        await cache.addAll(PRECACHE_URLS);
        await sw.skipWaiting();
    })());
});
sw.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys
            .filter((key) => key !== SEARCH_CACHE && key !== HTML_CACHE)
            .map((key) => caches.delete(key)));
        await sw.clients.claim();
    })());
});
sw.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    if (url.origin === sw.location.origin && url.pathname.startsWith(PAGEFIND_PATH)) {
        event.respondWith(cacheFirst(request, SEARCH_CACHE));
        return;
    }
    if (request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'))) {
        event.respondWith(networkFirst(request, HTML_CACHE));
    }
});
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
}
async function networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    try {
        const response = await fetch(request);
        cache.put(request, response.clone());
        return response;
    }
    catch (error) {
        const cached = await cache.match(request);
        if (cached)
            return cached;
        return new Response('Contenido no disponible sin conexión', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    }
}
export {};

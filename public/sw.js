const CACHE_VERSION = 'v1';
const APP_SHELL_CACHE = `blueberry-shell-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `blueberry-dynamic-${CACHE_VERSION}`;

// 앱 실행에 필요한 핵심 리소스
const APP_SHELL_URLS = ['/', '/index.html', '/manifest.webmanifest'];

// ─── Install: 앱 셸 사전 캐싱 ───────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then(cache => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

// ─── Activate: 오래된 캐시 정리 ─────────────────────────────────────────────
self.addEventListener('activate', event => {
  const validCaches = [APP_SHELL_CACHE, DYNAMIC_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then(names =>
        Promise.all(
          names.filter(name => !validCaches.includes(name)).map(name => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ─── Fetch: 요청 가로채기 ───────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;

  // GET 이외의 요청(POST, PATCH 등)은 서비스 워커가 처리하지 않음
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Supabase API → Network First (최신 데이터 우선, 오프라인 시 캐시 폴백)
  if (url.hostname.includes('supabase')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 앱 셸·정적 에셋 → Cache First (빠른 응답, 없으면 네트워크)
  event.respondWith(cacheFirst(request));
});

// ─── 전략: Cache First ──────────────────────────────────────────────────────
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // 오프라인 + 캐시 없음 → 앱 셸 반환
    const fallback = await caches.match('/');
    return fallback ?? new Response('Offline', { status: 503 });
  }
}

// ─── 전략: Network First ────────────────────────────────────────────────────
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
    return (
      cached ??
      new Response(JSON.stringify({ error: 'offline' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  }
}

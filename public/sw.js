const CACHE_VERSION = 'v3';
const APP_SHELL_CACHE = `blueberry-shell-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `blueberry-dynamic-${CACHE_VERSION}`;

// 앱 실행에 필요한 핵심 리소스
const APP_SHELL_URLS = ['/', '/index.html', '/manifest.webmanifest', '/offline.html'];

// ─── Push: 알림 표시 + 뱃지 세팅 ────────────────────────────────────────────
self.addEventListener('push', event => {
  let title = 'BlueBerry';
  let body = '';
  try {
    const data = event.data?.json();
    title = data?.title ?? title;
    body = data?.body ?? body;
  } catch {
    body = event.data?.text() ?? '';
  }
  event.waitUntil(
    self.registration
      .showNotification(title, {
        body,
        icon: '/favicon.ico',
      })
      .then(() => {
        if ('setAppBadge' in navigator) navigator.setAppBadge();
      }),
  );
});

// ─── Notification Click: 뱃지 제거 + 앱 열기 ────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if ('clearAppBadge' in navigator) navigator.clearAppBadge();
  event.waitUntil(clients.openWindow('/'));
});

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
  const validCaches = [APP_SHELL_CACHE, DYNAMIC_CACHE, 'blueberry-share'];
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
  const url = new URL(request.url);

  // ── Share Target: POST /share-target → 이미지 캐시 저장 후 /new로 리다이렉트
  if (url.pathname === '/share-target' && request.method === 'POST') {
    event.respondWith(
      (async () => {
        try {
          const formData = await request.formData();
          const image = formData.get('image');
          if (image instanceof File) {
            const cache = await caches.open('blueberry-share');
            await cache.put(
              '/shared-image',
              new Response(image, {
                headers: { 'Content-Type': image.type },
              }),
            );
          }
        } catch {
          /* 저장 실패해도 /new로 이동 */
        }
        return Response.redirect('/new?shared=true', 303);
      })(),
    );
    return;
  }

  // GET 이외의 요청(POST, PATCH 등)은 서비스 워커가 처리하지 않음
  if (request.method !== 'GET') return;

  // 개발 환경(localhost)에서는 캐시 사용 안 함
  if (url.hostname === 'localhost') return;

  // Supabase API → 캐시 없이 네트워크 직통 (인증된 사용자 데이터 캐시 방지)
  if (url.hostname.includes('supabase')) return;

  // HTML 문서(navigate) → Network First (배포 후 항상 최신 index.html 보장)
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // 정적 에셋(JS, CSS 등) → Cache First (빠른 응답, 없으면 네트워크)
  event.respondWith(cacheFirst(request));
});

// ─── 전략: Network First (HTML 문서용) ─────────────────────────────────────
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(APP_SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const appShell = await caches.match('/index.html');
    if (appShell) return appShell;
    const offline = await caches.match('/offline.html');
    return offline ?? new Response('Offline', { status: 503 });
  }
}

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
    // 네비게이션 요청 오프라인 → offline.html
    if (request.mode === 'navigate') {
      const offline = await caches.match('/offline.html');
      return offline ?? new Response('Offline', { status: 503 });
    }
    const fallback = await caches.match('/');
    return fallback ?? new Response('Offline', { status: 503 });
  }
}

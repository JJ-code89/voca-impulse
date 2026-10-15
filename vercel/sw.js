// 한글 설명 주석: 캐시 버전을 올리면 이전 앱 파일을 남기지 않고 새 정적 파일로 교체해요.
const CACHE_NAME = "voca-impulse-v7";

// 한글 설명 주석: 앱 셸과 단어 데이터를 미리 저장해 네트워크가 없어도 기본 학습 화면을 열 수 있어요.
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./words.json",
  "./manifest.json",
  "./icon.svg"
];

// 한글 설명 주석: 설치할 때 핵심 파일을 캐시한 뒤 대기 중인 새 서비스 워커를 활성화해요.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 한글 설명 주석: 활성화 시 오래된 앱 캐시를 정리하고 현재 탭에 새 서비스 워커를 적용해요.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

// 한글 설명 주석: 같은 출처 GET 요청은 캐시를 우선 사용하고, 캐시에 없는 앱 셸 요청은 네트워크를 시도해요.
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseCopy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", responseCopy));
          }
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match("./index.html");
          if (!cachedPage) {
            throw new Error("오프라인 앱 화면을 캐시에서 찾을 수 없어요.");
          }
          return cachedPage;
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => cachedResponse || fetch(request))
  );
});

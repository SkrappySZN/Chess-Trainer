// Chess Trainer service worker: keeps the page, its libraries and the engine on the
// device so the site opens instantly and drills work with no signal.
//
// - The page itself is network-first, so a new version shows up on the next visit
//   (and falls back to the saved copy offline).
// - Library, engine and font files are versioned on the CDN, so they're served
//   from the cache once fetched.
// - chess.com is never cached: your game list always comes fresh.
const VERSION = "ct-v2";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png", "./puzzles.json"];
const LIBS = [
  "https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.13.4/chess.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.wasm.js",
  "https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.wasm",
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js",
  "https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"
];
const CDN = /^https:\/\/(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|fonts\.gstatic\.com)\//;

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(SHELL).catch(() => {});
    // one at a time, so a single failed download doesn't cancel the rest
    await Promise.all(LIBS.map((u) => c.add(new Request(u, { mode: "cors" })).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

async function networkFirst(req) {
  const c = await caches.open(VERSION);
  try {
    const res = await fetch(req);
    if (res.ok) c.put(req, res.clone());
    return res;
  } catch (e) {
    return (await c.match(req, { ignoreSearch: true })) || (await c.match("./index.html")) || Response.error();
  }
}
async function cacheFirst(req) {
  const c = await caches.open(VERSION);
  const hit = await c.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === "opaque") c.put(req, res.clone());
  return res;
}
async function staleWhileRevalidate(req) {
  const c = await caches.open(VERSION);
  const hit = await c.match(req);
  const net = fetch(req).then((res) => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
  return hit || net;
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = req.url;
  if (url.startsWith("https://api.chess.com/")) return;              // always live
  if (req.mode === "navigate") return e.respondWith(networkFirst(req));
  if (CDN.test(url)) return e.respondWith(cacheFirst(req));
  if (url.startsWith("https://fonts.googleapis.com/")) return e.respondWith(staleWhileRevalidate(req));
  if (new URL(url).origin === self.location.origin) return e.respondWith(networkFirst(req));
});

const CACHE_NAME = "pwa-cache-v6"; // Change le nom du cache pour forcer la mise à jour
const FILES_TO_CACHE = [
    "index.html",
    "style.css",
    "app.js",
    "manifest.json",
    "icon-192x192.png",
    "icon-512x512.png"
];

// Installation : mise en cache des fichiers
self.addEventListener("install", (event) => {
    console.log("Service Worker : Installation...");
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activation : suppression des anciens caches
self.addEventListener("activate", (event) => {
    console.log("Service Worker : Activation...");
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log("Service Worker : Suppression de l'ancien cache", cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Interception des requêtes pour servir les fichiers en cache
self.addEventListener("fetch", (event) => {
    console.log("Service Worker : Fetch -> ", event.request.url);

    // Si la requête est une iframe externe, ne pas la rediriger vers index.html
    if (event.request.destination === "iframe") {
        console.log("Service Worker : Ignorer iframe -> ", event.request.url);
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                console.log("Service Worker : Chargement depuis le cache -> ", event.request.url);
                return response;
            }
            console.log("Service Worker : Fichier non en cache, chargement depuis le réseau -> ", event.request.url);
            return fetch(event.request).catch(() => {
                if (event.request.mode === "navigate") {
                    return caches.match("index.html");
                }
            });
        })
    );
});

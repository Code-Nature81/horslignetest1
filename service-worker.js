const CACHE_NAME = "pwa-cache-v1";
const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/style.css",
    "/app.js",
    "/manifest.json",
    "/icon-192x192.png",
    "/icon-512x512.png"
];

// Installation du Service Worker et mise en cache des fichiers
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Mise en cache des fichiers...");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting(); // Activation immédiate du SW
});

// Activation et suppression des anciennes caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log("Suppression de l'ancienne cache :", cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Prend le contrôle immédiatement
});

// Interception des requêtes réseau et réponse avec le cache
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                // Optionnel : Retourner une page hors ligne custom si l'utilisateur est offline
                return caches.match("/index.html");
            });
        })
    );
});

// Files to cache
var cacheName = '𝔻-5';
var appShellFiles = [ './',
		      'index.html',
		      'app.js',
		      'style.css',
		      'icons/icon-16.png',
		      'icons/icon-32.png',
		      'icons/icon-57.png',
		      'icons/icon-60.png',
		      'icons/icon-72.png',
		      'icons/icon-76.png',
		      'icons/icon-96.png',
		      'icons/icon-114.png',
		      'icons/icon-120.png',
		      'icons/icon-144.png',
		      'icons/icon-152.png',
		      'icons/icon-180.png',
		      'icons/icon-192.png',
		      'icons/icon-512.png'
		    ];

// Installing Service Worker
self.addEventListener('install', function(e) {
    e.waitUntil(
	caches.open(cacheName).then(function(cache) {
	    return cache.addAll(appShellFiles);
	})
    );
});

// Fetching content using Service Worker
self.addEventListener('fetch', function(e) {
    e.respondWith(
	caches.match(e.request).then(function(r) {
	    // console.log('[Service Worker] Fetching resource: '+e.request.url);
	    return r || fetch(e.request).then(function(response) {
		return caches.open(cacheName).then(function(cache) {
		    // console.log('[Service Worker] Caching new resource: '+e.request.url);
		    cache.put(e.request, response.clone());
		    return response;
		});
	    });
	})
    );
});

// Ensure old versions are removed.
self.addEventListener('activate', function(e) {
    e.waitUntil(
	caches.keys()
	    .then(function(keyList) {
		return Promise.all(
		    keyList.map(function(key) {
			if (cacheName !== key) {
			    return caches.delete(key);
			}
		    }));
	    })
    );
});

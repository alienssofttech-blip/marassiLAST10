// // MARASSI Logistics - Service Worker for Offline Support
// const CACHE_NAME = 'marassi-logistics-v1.0.0';
// const urlsToCache = [
//   '/',
//   '/index.html',
//   '/about.html',
//   '/service.html',
//   '/project.html',
//   '/contact.html',
//   '/assets/css/bootstrap.min.css',
//   '/assets/css/main.css',
//   '/assets/css/satoshi.css',
//   '/assets/js/jquery-3.7.1.min.js',
//   '/assets/js/main.js',
//   '/assets/js/phosphor-icon.js',
//   '/assets/js/boostrap.bundle.min.js',
//   '/assets/images/logo/Marassi_logo.png',
//   '/header.html',
//   '/footer.html'
// ];

// // Install event
// self.addEventListener('install', event => {
//   event.waitUntil(
//     caches.open(CACHE_NAME)
//       .then(cache => {
//         console.log('Opened cache');
//         return cache.addAll(urlsToCache);
//       })
//   );
// });

// // Fetch event
// self.addEventListener('fetch', event => {
//   event.respondWith(
//     caches.match(event.request)
//       .then(response => {
//         // Return cached version or fetch from network
//         if (response) {
//           return response;
//         }
//         return fetch(event.request);
//       }
//     )
//   );
// });

// // Activate event
// self.addEventListener('activate', event => {
//   event.waitUntil(
//     caches.keys().then(cacheNames => {
//       return Promise.all(
//         cacheNames.map(cacheName => {
//           if (cacheName !== CACHE_NAME) {
//             console.log('Deleting old cache:', cacheName);
//             return caches.delete(cacheName);
//           }
//         })
//       );
//     })
//   );
// });
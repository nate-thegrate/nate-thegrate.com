'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "034ec050ba26138bc51be6baef2670a1",
"assets/AssetManifest.bin.json": "ab7d03df768dc33725a62a1e92b65786",
"assets/AssetManifest.json": "ec8def36d78e9b546c9cf15b075d50c4",
"assets/assets/fonts/annie_use_your_telescope.ttf": "5a6b9c2a0fcf8141c1bbf42b27fdafab",
"assets/assets/fonts/gaegu.ttf": "1f8a5a376fdef2af441c4f5a6f68aae4",
"assets/assets/fonts/gaegu_bold.ttf": "33aed714c4f905218f66be72588b34f1",
"assets/assets/fonts/roboto_mono.ttf": "336102a48d996db3d945a346b1790b1f",
"assets/assets/fonts/times.ttf": "3f7dc90a1651b35e69718bbf38ed265a",
"assets/assets/fonts/timesbd.ttf": "54e5495b1fa1fcb0958134a536546201",
"assets/assets/images/gradient.png": "388e79c2456cb1f51fcb5aa3e923d252",
"assets/assets/images/tolls.png": "8dbda3363a4b380268b90fefaf55bc96",
"assets/FontManifest.json": "359c6d38a084566385f54b86e936fe22",
"assets/fonts/MaterialIcons-Regular.otf": "0db35ae7a415370b89e807027510caf0",
"assets/NOTICES": "5cbd59d76e5503aa64fb3adaba49ee91",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"canvaskit/canvaskit.js": "de27f912e40a372c22a069c1c7244d9b",
"canvaskit/canvaskit.js.symbols": "51b30aa29d95ec2cb8dd5f14fe984287",
"canvaskit/canvaskit.wasm": "ae6c3990a4d7bf3a4bb015390935a51a",
"canvaskit/chromium/canvaskit.js": "73343b0c5d471d1114d7f02e06c1fdb2",
"canvaskit/chromium/canvaskit.js.symbols": "e499ed06b2962cd01b88f31dc282988f",
"canvaskit/chromium/canvaskit.wasm": "b9a0e18737aba06fce47c5b3fd964823",
"canvaskit/skwasm.js": "c757bee7edc67bf93024e6df40a7e31e",
"canvaskit/skwasm.js.symbols": "516c46fa3c9eafdae3b8f4d9d5dba0e9",
"canvaskit/skwasm.wasm": "3e836aaa135e167222752db00a022065",
"canvaskit/skwasm_st.js": "d1326ceef381ad382ab492ba5d96f04d",
"canvaskit/skwasm_st.js.symbols": "362bbd27660ce810bce9384426d2ed9a",
"canvaskit/skwasm_st.wasm": "a5cb5a5a4bc604535e820e55f6add5f1",
"favicon.png": "07464c3599f12220e3787717a1ed4707",
"flutter.js": "76f08d47ff9f5715220992f993002504",
"flutter_bootstrap.js": "ec1f54b5acc983547c4d8d9aa6af733c",
"index.html": "b8204a7f7d3d1e811dd285daac639606",
"/": "b8204a7f7d3d1e811dd285daac639606",
"main.dart.js": "4a8371cba32302e0708bca288f38f291",
"main.dart.mjs": "9a6e48eeb567ea843a1c28b3c795c792",
"main.dart.wasm": "8d6195cc209bac31b79fad5ac1272dda",
"manifest.json": "93ca2d420708a5d093e769dfb6f35793",
"version.json": "db761c3701a9d37e5a6f844252910a88"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"main.dart.wasm",
"main.dart.mjs",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}


// Based off of https://github.com/pwa-builder/PWABuilder/blob/main/docs/sw.js

/*
  Welcome to our basic Service Worker! This Service Worker offers a basic offline experience
  while also being easily customizeable. You can add in your own code to implement the capabilities
  listed below, or change anything else you would like.


  Need an introduction to Service Workers? Check our docs here: https://docs.pwabuilder.com/#/home/sw-intro
  Want to learn more about how our Service Worker generation works? Check our docs here: https://docs.pwabuilder.com/#/studio/existing-app?id=add-a-service-worker

  Did you know that Service Workers offer many more capabilities than just offline? 
    - Background Sync: https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/advanced-capabilities/06
    - Periodic Background Sync: https://web.dev/periodic-background-sync/
    - Push Notifications: https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/advanced-capabilities/07?id=push-notifications-on-the-web
    - Badges: https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/advanced-capabilities/07?id=application-badges
*/

const HOSTNAME_WHITELIST = [
    self.location.hostname,
    'fonts.gstatic.com',
    'fonts.googleapis.com',
    'cdn.jsdelivr.net'
]

// The Util Function to hack URLs of intercepted requests
const getFixedUrl = (req) => {
    var now = Date.now()
    var url = new URL(req.url)

    // 1. fixed http URL
    // Just keep syncing with location.protocol
    // fetch(httpURL) belongs to active mixed content.
    // And fetch(httpRequest) is not supported yet.
    url.protocol = self.location.protocol

    // 2. add query for caching-busting.
    // Github Pages served with Cache-Control: max-age=600
    // max-age on mutable content is error-prone, with SW life of bugs can even extend.
    // Until cache mode of Fetch API landed, we have to workaround cache-busting with query string.
    // Cache-Control-Bug: https://bugs.chromium.org/p/chromium/issues/detail?id=453190
    if (url.hostname === self.location.hostname) {
        url.search += (url.search ? '&' : '?') + 'cache-bust=' + now
    }
    return url.href
}

/**
 *  @Lifecycle Activate
 *  New one activated when old isnt being used.
 *
 *  waitUntil(): activating ====> activated
 */
self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim())
})

/**
 *  @Functional Fetch
 *  All network requests are being intercepted here.
 *
 *  void respondWith(Promise<Response> r)
 */
self.addEventListener('fetch', event => {
    // Skip some of cross-origin requests, like those for Google Analytics.
    if (HOSTNAME_WHITELIST.indexOf(new URL(event.request.url).hostname) > -1) {
        // Stale-while-revalidate
        // similar to HTTP's stale-while-revalidate: https://www.mnot.net/blog/2007/12/12/stale
        // Upgrade from Jake's to Surma's: https://gist.github.com/surma/eb441223daaedf880801ad80006389f1
        const cached = caches.match(event.request)
        const fixedUrl = getFixedUrl(event.request)
        const fetched = fetch(fixedUrl, { cache: 'no-store' })
        const fetchedCopy = fetched.then(resp => resp.clone())

        // Call respondWith() with whatever we get first.
        // If the fetch fails (e.g disconnected), wait for the cache.
        // If there’s nothing in cache, wait for the fetch.
        // If neither yields a response, return offline pages.
        event.respondWith(
            Promise.race([fetched.catch(_ => cached), cached])
                .then(resp => resp || fetched)
                .catch(_ => { /* eat any errors */ })
        )

        // Update the cache with the version we fetched (only for ok status)
        event.waitUntil(
            Promise.all([fetchedCopy, caches.open('pwa-cache')])
                .then(([response, cache]) => response.ok && cache.put(event.request, response))
                .catch(_ => { /* eat any errors */ })
        )
    }
})

self.addEventListener('message', event => {
    if (event.data === 'cache-all-assets') {
        caches.open('my-cache-v1').then(cache => {
            return cache.addAll([
                'index.html',
                'styles.css',
                'main.js',
                'scrub/13/3999/2738.png',
                'scrub/13/3999/2739.png',
                'scrub/13/3999/2740.png',
                'scrub/13/4000/2738.png',
                'scrub/13/4000/2739.png',
                'scrub/13/4000/2740.png',
                'scrub/14/7999/5476.png',
                'scrub/14/7999/5477.png',
                'scrub/14/7999/5478.png',
                'scrub/14/7999/5479.png',
                'scrub/14/7999/5480.png',
                'scrub/14/8000/5476.png',
                'scrub/14/8000/5477.png',
                'scrub/14/8000/5478.png',
                'scrub/14/8000/5479.png',
                'scrub/14/8000/5480.png',
                'scrub/14/8001/5476.png',
                'scrub/14/8001/5477.png',
                'scrub/14/8001/5478.png',
                'scrub/14/8001/5479.png',
                'scrub/14/8001/5480.png',
                'scrub/15/15999/10952.png',
                'scrub/15/15999/10953.png',
                'scrub/15/15999/10954.png',
                'scrub/15/15999/10955.png',
                'scrub/15/15999/10956.png',
                'scrub/15/15999/10957.png',
                'scrub/15/15999/10958.png',
                'scrub/15/15999/10959.png',
                'scrub/15/15999/10960.png',
                'scrub/15/16000/10952.png',
                'scrub/15/16000/10953.png',
                'scrub/15/16000/10954.png',
                'scrub/15/16000/10955.png',
                'scrub/15/16000/10956.png',
                'scrub/15/16000/10957.png',
                'scrub/15/16000/10958.png',
                'scrub/15/16000/10959.png',
                'scrub/15/16000/10960.png',
                'scrub/15/16001/10952.png',
                'scrub/15/16001/10953.png',
                'scrub/15/16001/10954.png',
                'scrub/15/16001/10955.png',
                'scrub/15/16001/10956.png',
                'scrub/15/16001/10957.png',
                'scrub/15/16001/10958.png',
                'scrub/15/16001/10959.png',
                'scrub/15/16001/10960.png',
                'scrub/15/16002/10952.png',
                'scrub/15/16002/10953.png',
                'scrub/15/16002/10954.png',
                'scrub/15/16002/10955.png',
                'scrub/15/16002/10956.png',
                'scrub/15/16002/10957.png',
                'scrub/15/16002/10958.png',
                'scrub/15/16002/10959.png',
                'scrub/15/16002/10960.png',
                'scrub/16/31999/21905.png',
                'scrub/16/31999/21906.png',
                'scrub/16/31999/21907.png',
                'scrub/16/31999/21908.png',
                'scrub/16/31999/21909.png',
                'scrub/16/31999/21910.png',
                'scrub/16/31999/21911.png',
                'scrub/16/31999/21912.png',
                'scrub/16/31999/21913.png',
                'scrub/16/31999/21914.png',
                'scrub/16/31999/21915.png',
                'scrub/16/31999/21916.png',
                'scrub/16/31999/21917.png',
                'scrub/16/31999/21918.png',
                'scrub/16/31999/21919.png',
                'scrub/16/31999/21920.png',
                'scrub/16/32000/21905.png',
                'scrub/16/32000/21906.png',
                'scrub/16/32000/21907.png',
                'scrub/16/32000/21908.png',
                'scrub/16/32000/21909.png',
                'scrub/16/32000/21910.png',
                'scrub/16/32000/21911.png',
                'scrub/16/32000/21912.png',
                'scrub/16/32000/21913.png',
                'scrub/16/32000/21914.png',
                'scrub/16/32000/21915.png',
                'scrub/16/32000/21916.png',
                'scrub/16/32000/21917.png',
                'scrub/16/32000/21918.png',
                'scrub/16/32000/21919.png',
                'scrub/16/32000/21920.png',
                'scrub/16/32001/21905.png',
                'scrub/16/32001/21906.png',
                'scrub/16/32001/21907.png',
                'scrub/16/32001/21908.png',
                'scrub/16/32001/21909.png',
                'scrub/16/32001/21910.png',
                'scrub/16/32001/21911.png',
                'scrub/16/32001/21912.png',
                'scrub/16/32001/21913.png',
                'scrub/16/32001/21914.png',
                'scrub/16/32001/21915.png',
                'scrub/16/32001/21916.png',
                'scrub/16/32001/21917.png',
                'scrub/16/32001/21918.png',
                'scrub/16/32001/21919.png',
                'scrub/16/32001/21920.png',
                'scrub/16/32002/21905.png',
                'scrub/16/32002/21906.png',
                'scrub/16/32002/21907.png',
                'scrub/16/32002/21908.png',
                'scrub/16/32002/21909.png',
                'scrub/16/32002/21910.png',
                'scrub/16/32002/21911.png',
                'scrub/16/32002/21912.png',
                'scrub/16/32002/21913.png',
                'scrub/16/32002/21914.png',
                'scrub/16/32002/21915.png',
                'scrub/16/32002/21916.png',
                'scrub/16/32002/21917.png',
                'scrub/16/32002/21918.png',
                'scrub/16/32002/21919.png',
                'scrub/16/32002/21920.png',
                'scrub/16/32003/21905.png',
                'scrub/16/32003/21906.png',
                'scrub/16/32003/21907.png',
                'scrub/16/32003/21908.png',
                'scrub/16/32003/21909.png',
                'scrub/16/32003/21910.png',
                'scrub/16/32003/21911.png',
                'scrub/16/32003/21912.png',
                'scrub/16/32003/21913.png',
                'scrub/16/32003/21914.png',
                'scrub/16/32003/21915.png',
                'scrub/16/32003/21916.png',
                'scrub/16/32003/21917.png',
                'scrub/16/32003/21918.png',
                'scrub/16/32003/21919.png',
                'scrub/16/32003/21920.png',
                'scrub/16/32004/21905.png',
                'scrub/16/32004/21906.png',
                'scrub/16/32004/21907.png',
                'scrub/16/32004/21908.png',
                'scrub/16/32004/21909.png',
                'scrub/16/32004/21910.png',
                'scrub/16/32004/21911.png',
                'scrub/16/32004/21912.png',
                'scrub/16/32004/21913.png',
                'scrub/16/32004/21914.png',
                'scrub/16/32004/21915.png',
                'scrub/16/32004/21916.png',
                'scrub/16/32004/21917.png',
                'scrub/16/32004/21918.png',
                'scrub/16/32004/21919.png',
                'scrub/16/32004/21920.png',
                'scrub/16/32005/21905.png',
                'scrub/16/32005/21906.png',
                'scrub/16/32005/21907.png',
                'scrub/16/32005/21908.png',
                'scrub/16/32005/21909.png',
                'scrub/16/32005/21910.png',
                'scrub/16/32005/21911.png',
                'scrub/16/32005/21912.png',
                'scrub/16/32005/21913.png',
                'scrub/16/32005/21914.png',
                'scrub/16/32005/21915.png',
                'scrub/16/32005/21916.png',
                'scrub/16/32005/21917.png',
                'scrub/16/32005/21918.png',
                'scrub/16/32005/21919.png',
                'scrub/16/32005/21920.png',
                'scrub/17/63999/43811.png',
                'scrub/17/63999/43812.png',
                'scrub/17/63999/43813.png',
                'scrub/17/63999/43814.png',
                'scrub/17/63999/43815.png',
                'scrub/17/63999/43816.png',
                'scrub/17/63999/43817.png',
                'scrub/17/63999/43818.png',
                'scrub/17/63999/43819.png',
                'scrub/17/63999/43820.png',
                'scrub/17/63999/43821.png',
                'scrub/17/63999/43822.png',
                'scrub/17/63999/43823.png',
                'scrub/17/63999/43824.png',
                'scrub/17/63999/43825.png',
                'scrub/17/63999/43826.png',
                'scrub/17/63999/43827.png',
                'scrub/17/63999/43828.png',
                'scrub/17/63999/43829.png',
                'scrub/17/63999/43830.png',
                'scrub/17/63999/43831.png',
                'scrub/17/63999/43832.png',
                'scrub/17/63999/43833.png',
                'scrub/17/63999/43834.png',
                'scrub/17/63999/43835.png',
                'scrub/17/63999/43836.png',
                'scrub/17/63999/43837.png',
                'scrub/17/63999/43838.png',
                'scrub/17/63999/43839.png',
                'scrub/17/63999/43840.png',
                'scrub/17/64000/43811.png',
                'scrub/17/64000/43812.png',
                'scrub/17/64000/43813.png',
                'scrub/17/64000/43814.png',
                'scrub/17/64000/43815.png',
                'scrub/17/64000/43816.png',
                'scrub/17/64000/43817.png',
                'scrub/17/64000/43818.png',
                'scrub/17/64000/43819.png',
                'scrub/17/64000/43820.png',
                'scrub/17/64000/43821.png',
                'scrub/17/64000/43822.png',
                'scrub/17/64000/43823.png',
                'scrub/17/64000/43824.png',
                'scrub/17/64000/43825.png',
                'scrub/17/64000/43826.png',
                'scrub/17/64000/43827.png',
                'scrub/17/64000/43828.png',
                'scrub/17/64000/43829.png',
                'scrub/17/64000/43830.png',
                'scrub/17/64000/43831.png',
                'scrub/17/64000/43832.png',
                'scrub/17/64000/43833.png',
                'scrub/17/64000/43834.png',
                'scrub/17/64000/43835.png',
                'scrub/17/64000/43836.png',
                'scrub/17/64000/43837.png',
                'scrub/17/64000/43838.png',
                'scrub/17/64000/43839.png',
                'scrub/17/64000/43840.png',
                'scrub/17/64001/43811.png',
                'scrub/17/64001/43812.png',
                'scrub/17/64001/43813.png',
                'scrub/17/64001/43814.png',
                'scrub/17/64001/43815.png',
                'scrub/17/64001/43816.png',
                'scrub/17/64001/43817.png',
                'scrub/17/64001/43818.png',
                'scrub/17/64001/43819.png',
                'scrub/17/64001/43820.png',
                'scrub/17/64001/43821.png',
                'scrub/17/64001/43822.png',
                'scrub/17/64001/43823.png',
                'scrub/17/64001/43824.png',
                'scrub/17/64001/43825.png',
                'scrub/17/64001/43826.png',
                'scrub/17/64001/43827.png',
                'scrub/17/64001/43828.png',
                'scrub/17/64001/43829.png',
                'scrub/17/64001/43830.png',
                'scrub/17/64001/43831.png',
                'scrub/17/64001/43832.png',
                'scrub/17/64001/43833.png',
                'scrub/17/64001/43834.png',
                'scrub/17/64001/43835.png',
                'scrub/17/64001/43836.png',
                'scrub/17/64001/43837.png',
                'scrub/17/64001/43838.png',
                'scrub/17/64001/43839.png',
                'scrub/17/64001/43840.png',
                'scrub/17/64002/43811.png',
                'scrub/17/64002/43812.png',
                'scrub/17/64002/43813.png',
                'scrub/17/64002/43814.png',
                'scrub/17/64002/43815.png',
                'scrub/17/64002/43816.png',
                'scrub/17/64002/43817.png',
                'scrub/17/64002/43818.png',
                'scrub/17/64002/43819.png',
                'scrub/17/64002/43820.png',
                'scrub/17/64002/43821.png',
                'scrub/17/64002/43822.png',
                'scrub/17/64002/43823.png',
                'scrub/17/64002/43824.png',
                'scrub/17/64002/43825.png',
                'scrub/17/64002/43826.png',
                'scrub/17/64002/43827.png',
                'scrub/17/64002/43828.png',
                'scrub/17/64002/43829.png',
                'scrub/17/64002/43830.png',
                'scrub/17/64002/43831.png',
                'scrub/17/64002/43832.png',
                'scrub/17/64002/43833.png',
                'scrub/17/64002/43834.png',
                'scrub/17/64002/43835.png',
                'scrub/17/64002/43836.png',
                'scrub/17/64002/43837.png',
                'scrub/17/64002/43838.png',
                'scrub/17/64002/43839.png',
                'scrub/17/64002/43840.png',
                'scrub/17/64003/43811.png',
                'scrub/17/64003/43812.png',
                'scrub/17/64003/43813.png',
                'scrub/17/64003/43814.png',
                'scrub/17/64003/43815.png',
                'scrub/17/64003/43816.png',
                'scrub/17/64003/43817.png',
                'scrub/17/64003/43818.png',
                'scrub/17/64003/43819.png',
                'scrub/17/64003/43820.png',
                'scrub/17/64003/43821.png',
                'scrub/17/64003/43822.png',
                'scrub/17/64003/43823.png',
                'scrub/17/64003/43824.png',
                'scrub/17/64003/43825.png',
                'scrub/17/64003/43826.png',
                'scrub/17/64003/43827.png',
                'scrub/17/64003/43828.png',
                'scrub/17/64003/43829.png',
                'scrub/17/64003/43830.png',
                'scrub/17/64003/43831.png',
                'scrub/17/64003/43832.png',
                'scrub/17/64003/43833.png',
                'scrub/17/64003/43834.png',
                'scrub/17/64003/43835.png',
                'scrub/17/64003/43836.png',
                'scrub/17/64003/43837.png',
                'scrub/17/64003/43838.png',
                'scrub/17/64003/43839.png',
                'scrub/17/64003/43840.png',
                'scrub/17/64004/43811.png',
                'scrub/17/64004/43812.png',
                'scrub/17/64004/43813.png',
                'scrub/17/64004/43814.png',
                'scrub/17/64004/43815.png',
                'scrub/17/64004/43816.png',
                'scrub/17/64004/43817.png',
                'scrub/17/64004/43818.png',
                'scrub/17/64004/43819.png',
                'scrub/17/64004/43820.png',
                'scrub/17/64004/43821.png',
                'scrub/17/64004/43822.png',
                'scrub/17/64004/43823.png',
                'scrub/17/64004/43824.png',
                'scrub/17/64004/43825.png',
                'scrub/17/64004/43826.png',
                'scrub/17/64004/43827.png',
                'scrub/17/64004/43828.png',
                'scrub/17/64004/43829.png',
                'scrub/17/64004/43830.png',
                'scrub/17/64004/43831.png',
                'scrub/17/64004/43832.png',
                'scrub/17/64004/43833.png',
                'scrub/17/64004/43834.png',
                'scrub/17/64004/43835.png',
                'scrub/17/64004/43836.png',
                'scrub/17/64004/43837.png',
                'scrub/17/64004/43838.png',
                'scrub/17/64004/43839.png',
                'scrub/17/64004/43840.png',
                'scrub/17/64005/43811.png',
                'scrub/17/64005/43812.png',
                'scrub/17/64005/43813.png',
                'scrub/17/64005/43814.png',
                'scrub/17/64005/43815.png',
                'scrub/17/64005/43816.png',
                'scrub/17/64005/43817.png',
                'scrub/17/64005/43818.png',
                'scrub/17/64005/43819.png',
                'scrub/17/64005/43820.png',
                'scrub/17/64005/43821.png',
                'scrub/17/64005/43822.png',
                'scrub/17/64005/43823.png',
                'scrub/17/64005/43824.png',
                'scrub/17/64005/43825.png',
                'scrub/17/64005/43826.png',
                'scrub/17/64005/43827.png',
                'scrub/17/64005/43828.png',
                'scrub/17/64005/43829.png',
                'scrub/17/64005/43830.png',
                'scrub/17/64005/43831.png',
                'scrub/17/64005/43832.png',
                'scrub/17/64005/43833.png',
                'scrub/17/64005/43834.png',
                'scrub/17/64005/43835.png',
                'scrub/17/64005/43836.png',
                'scrub/17/64005/43837.png',
                'scrub/17/64005/43838.png',
                'scrub/17/64005/43839.png',
                'scrub/17/64005/43840.png',
                'scrub/17/64006/43811.png',
                'scrub/17/64006/43812.png',
                'scrub/17/64006/43813.png',
                'scrub/17/64006/43814.png',
                'scrub/17/64006/43815.png',
                'scrub/17/64006/43816.png',
                'scrub/17/64006/43817.png',
                'scrub/17/64006/43818.png',
                'scrub/17/64006/43819.png',
                'scrub/17/64006/43820.png',
                'scrub/17/64006/43821.png',
                'scrub/17/64006/43822.png',
                'scrub/17/64006/43823.png',
                'scrub/17/64006/43824.png',
                'scrub/17/64006/43825.png',
                'scrub/17/64006/43826.png',
                'scrub/17/64006/43827.png',
                'scrub/17/64006/43828.png',
                'scrub/17/64006/43829.png',
                'scrub/17/64006/43830.png',
                'scrub/17/64006/43831.png',
                'scrub/17/64006/43832.png',
                'scrub/17/64006/43833.png',
                'scrub/17/64006/43834.png',
                'scrub/17/64006/43835.png',
                'scrub/17/64006/43836.png',
                'scrub/17/64006/43837.png',
                'scrub/17/64006/43838.png',
                'scrub/17/64006/43839.png',
                'scrub/17/64006/43840.png',
                'scrub/17/64007/43811.png',
                'scrub/17/64007/43812.png',
                'scrub/17/64007/43813.png',
                'scrub/17/64007/43814.png',
                'scrub/17/64007/43815.png',
                'scrub/17/64007/43816.png',
                'scrub/17/64007/43817.png',
                'scrub/17/64007/43818.png',
                'scrub/17/64007/43819.png',
                'scrub/17/64007/43820.png',
                'scrub/17/64007/43821.png',
                'scrub/17/64007/43822.png',
                'scrub/17/64007/43823.png',
                'scrub/17/64007/43824.png',
                'scrub/17/64007/43825.png',
                'scrub/17/64007/43826.png',
                'scrub/17/64007/43827.png',
                'scrub/17/64007/43828.png',
                'scrub/17/64007/43829.png',
                'scrub/17/64007/43830.png',
                'scrub/17/64007/43831.png',
                'scrub/17/64007/43832.png',
                'scrub/17/64007/43833.png',
                'scrub/17/64007/43834.png',
                'scrub/17/64007/43835.png',
                'scrub/17/64007/43836.png',
                'scrub/17/64007/43837.png',
                'scrub/17/64007/43838.png',
                'scrub/17/64007/43839.png',
                'scrub/17/64007/43840.png',
                'scrub/17/64008/43811.png',
                'scrub/17/64008/43812.png',
                'scrub/17/64008/43813.png',
                'scrub/17/64008/43814.png',
                'scrub/17/64008/43815.png',
                'scrub/17/64008/43816.png',
                'scrub/17/64008/43817.png',
                'scrub/17/64008/43818.png',
                'scrub/17/64008/43819.png',
                'scrub/17/64008/43820.png',
                'scrub/17/64008/43821.png',
                'scrub/17/64008/43822.png',
                'scrub/17/64008/43823.png',
                'scrub/17/64008/43824.png',
                'scrub/17/64008/43825.png',
                'scrub/17/64008/43826.png',
                'scrub/17/64008/43827.png',
                'scrub/17/64008/43828.png',
                'scrub/17/64008/43829.png',
                'scrub/17/64008/43830.png',
                'scrub/17/64008/43831.png',
                'scrub/17/64008/43832.png',
                'scrub/17/64008/43833.png',
                'scrub/17/64008/43834.png',
                'scrub/17/64008/43835.png',
                'scrub/17/64008/43836.png',
                'scrub/17/64008/43837.png',
                'scrub/17/64008/43838.png',
                'scrub/17/64008/43839.png',
                'scrub/17/64008/43840.png',
                'scrub/17/64009/43811.png',
                'scrub/17/64009/43812.png',
                'scrub/17/64009/43813.png',
                'scrub/17/64009/43814.png',
                'scrub/17/64009/43815.png',
                'scrub/17/64009/43816.png',
                'scrub/17/64009/43817.png',
                'scrub/17/64009/43818.png',
                'scrub/17/64009/43819.png',
                'scrub/17/64009/43820.png',
                'scrub/17/64009/43821.png',
                'scrub/17/64009/43822.png',
                'scrub/17/64009/43823.png',
                'scrub/17/64009/43824.png',
                'scrub/17/64009/43825.png',
                'scrub/17/64009/43826.png',
                'scrub/17/64009/43827.png',
                'scrub/17/64009/43828.png',
                'scrub/17/64009/43829.png',
                'scrub/17/64009/43830.png',
                'scrub/17/64009/43831.png',
                'scrub/17/64009/43832.png',
                'scrub/17/64009/43833.png',
                'scrub/17/64009/43834.png',
                'scrub/17/64009/43835.png',
                'scrub/17/64009/43836.png',
                'scrub/17/64009/43837.png',
                'scrub/17/64009/43838.png',
                'scrub/17/64009/43839.png',
                'scrub/17/64009/43840.png',
                'scrub/17/64010/43811.png',
                'scrub/17/64010/43812.png',
                'scrub/17/64010/43813.png',
                'scrub/17/64010/43814.png',
                'scrub/17/64010/43815.png',
                'scrub/17/64010/43816.png',
                'scrub/17/64010/43817.png',
                'scrub/17/64010/43818.png',
                'scrub/17/64010/43819.png',
                'scrub/17/64010/43820.png',
                'scrub/17/64010/43821.png',
                'scrub/17/64010/43822.png',
                'scrub/17/64010/43823.png',
                'scrub/17/64010/43824.png',
                'scrub/17/64010/43825.png',
                'scrub/17/64010/43826.png',
                'scrub/17/64010/43827.png',
                'scrub/17/64010/43828.png',
                'scrub/17/64010/43829.png',
                'scrub/17/64010/43830.png',
                'scrub/17/64010/43831.png',
                'scrub/17/64010/43832.png',
                'scrub/17/64010/43833.png',
                'scrub/17/64010/43834.png',
                'scrub/17/64010/43835.png',
                'scrub/17/64010/43836.png',
                'scrub/17/64010/43837.png',
                'scrub/17/64010/43838.png',
                'scrub/17/64010/43839.png',
                'scrub/17/64010/43840.png',
                'scrub/17/64011/43811.png',
                'scrub/17/64011/43812.png',
                'scrub/17/64011/43813.png',
                'scrub/17/64011/43814.png',
                'scrub/17/64011/43815.png',
                'scrub/17/64011/43816.png',
                'scrub/17/64011/43817.png',
                'scrub/17/64011/43818.png',
                'scrub/17/64011/43819.png',
                'scrub/17/64011/43820.png',
                'scrub/17/64011/43821.png',
                'scrub/17/64011/43822.png',
                'scrub/17/64011/43823.png',
                'scrub/17/64011/43824.png',
                'scrub/17/64011/43825.png',
                'scrub/17/64011/43826.png',
                'scrub/17/64011/43827.png',
                'scrub/17/64011/43828.png',
                'scrub/17/64011/43829.png',
                'scrub/17/64011/43830.png',
                'scrub/17/64011/43831.png',
                'scrub/17/64011/43832.png',
                'scrub/17/64011/43833.png',
                'scrub/17/64011/43834.png',
                'scrub/17/64011/43835.png',
                'scrub/17/64011/43836.png',
                'scrub/17/64011/43837.png',
                'scrub/17/64011/43838.png',
                'scrub/17/64011/43839.png',
                'scrub/17/64011/43840.png',

            ]);
        });
    }
});


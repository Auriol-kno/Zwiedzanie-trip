/* I Was Here — PWA cache. Network-first; offline: cached copy (HTML without query string). */
const KEY='i-was-here-v8-4-20261107';
const CORE=['./','./index.html','./atlas.html','./icon.svg','./icon-180.png','./icon-512.png','./manifest.webmanifest','./assets/atlas.css','./assets/atlas.js','./assets/atlas-light-v5.css','./assets/atlas-illustrated.js','./assets/poland-geography.js','./assets/brand-pin.svg','./assets/brand-atlas.svg','./assets/brand-mark.svg','./assets/brand-mark-flag.svg','./assets/brand-pin-landscape.svg','./assets/app-nav.js','./assets/app-nav.css','./assets/logo-en.svg','./assets/brand-v5.js','./assets/brand-v5.css','./assets/nav4.css','./assets/i18n4.js','./assets/poland-mark.svg','./data/atrakcje.js','./data/atrakcje.json','./data/restauracje.js','./data/restauracje.json','./assets/upgrade3.css','./assets/features3.js','./assets/poland-explorer.js','./region.html','./assets/region.js','./assets/region.css','./data/regiony.js','./data/regiony.json','./assets/atlas-premium.css','./assets/atlas-plans.js','./assets/poland-relief.webp','./assets/place-extras.js','./assets/place-extras.css'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(KEY).then(c=>c.addAll(CORE)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(x=>x!==KEY).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
 const req=e.request,u=new URL(req.url);
 if(req.method!=='GET'||u.origin!==self.location.origin)return;
 const nav=req.mode==='navigate';
 // Strony HTML zapisujemy bez ?lang=…&from=…, żeby jedna kopia działała offline dla każdego wejścia.
 const key=nav?new Request(u.origin+u.pathname):req;
 e.respondWith(fetch(req).then(r=>{
  if(r.ok&&r.type==='basic'){const copy=r.clone();caches.open(KEY).then(c=>c.put(key,copy))}
  return r;
 }).catch(()=>caches.match(key,{ignoreSearch:nav}).then(hit=>hit||(nav?caches.match('./atlas.html'):Response.error()))));
});

/* ILHA DA MAGIA – Service Worker PWA 2026. No intercepta Supabase ni uploads. */
const CACHE='ilha-magia-shell-v2026-11';
const APP='./index.html';
self.addEventListener('install', event=>{
 event.waitUntil(caches.open(CACHE).then(async cache=>{
  try{const r=await fetch(APP,{cache:'reload'});if(r.ok)await cache.put(APP,r)}catch(_){}
 }).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('ilha-magia-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||req.mode!=='navigate'||new URL(req.url).origin!==self.location.origin)return;
 event.respondWith(fetch(req).then(res=>{
  if(res.ok){const copy=res.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(APP,copy)).catch(()=>{}))}return res;
 }).catch(async()=>await caches.match(APP)||Response.error()));
});

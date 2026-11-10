/* ILHA DA MAGIA – PWA Service Worker. Navigation cache + standards-based Web Push events. */
const CACHE='ilha-magia-shell-v2026-11-automatic-v1';
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
/* Las push reales requieren la suscripción del dispositivo y un servidor Web Push con VAPID. */
self.addEventListener('push',event=>{
 let item={};try{item=event.data?.json()||{}}catch{item={}}
 const title=String(item.title||'ILHA DA MAGIA').slice(0,100);
 const body=String(item.body||'Tenés una nueva notificación.').slice(0,400);
 let url='./#notifications';
 try{const candidate=new URL(String(item.url||'./#notifications'),self.location.origin);if(candidate.origin===self.location.origin)url=candidate.href}catch{}
 event.waitUntil(self.registration.showNotification(title,{
  body,icon:'./icon-192.png',badge:'./icon-192.png',tag:String(item.id||'ilha-news'),data:{url},renotify:false
 }));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 event.waitUntil((async()=>{
  const url=event.notification.data?.url||new URL('./#notifications',self.location.origin).href;
  const pages=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  const page=pages.find(x=>{try{return new URL(x.url).origin===self.location.origin}catch{return false}});
  if(page){await page.focus();await page.navigate(url);return}
  await self.clients.openWindow(url);
 })());
});

'use strict';
// Public previews for WhatsApp, Facebook and other link unfurlers.
// This endpoint uses only the Supabase publishable key and public published rows.
const SUPABASE='https://axocuqwjpxsitukxwhju.supabase.co';
const KEY='sb_publishable_DR4hczQye8bLI0kKxwkxWw_hHzyRU9M';
const SITE='https://oficialilham.vercel.app';
const TYPES={place:['places','place'],event:['events','event'],mission:['missions','mission-detail'],offer:['offers','offer-detail']};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safePhoto=x=>{try{const u=new URL(String(x||''));return u.protocol==='https:'?u.href:''}catch{return ''}};
const meta=(key,value)=>`<meta property="${esc(key)}" content="${esc(value)}">`;
module.exports=async function handler(req,res){
 const type=String(req.query.type||'').toLowerCase(),id=String(req.query.id||'');
 if(!TYPES[type]||!UUID.test(id)){res.statusCode=400;res.setHeader('Content-Type','text/plain; charset=utf-8');return res.end('Enlace no válido');}
 const [table,route]=TYPES[type],path=`/#${route}/${encodeURIComponent(id)}`;
 const rest=new URL(`${SUPABASE}/rest/v1/${table}`);
 rest.searchParams.set('select','id,name,description,photo_url,status');rest.searchParams.set('id',`eq.${id}`);rest.searchParams.set('status','eq.published');rest.searchParams.set('limit','1');
 let item=null;
 try{const response=await fetch(rest,{headers:{apikey:KEY,Accept:'application/json'},signal:AbortSignal.timeout(3500)});if(response.ok){const rows=await response.json();item=rows?.[0]||null;}}catch{}
 if(!item){res.statusCode=404;res.setHeader('Content-Type','text/plain; charset=utf-8');return res.end('Publicación no disponible');}
 const title=`${item.name||'Descubrí Florianópolis'} | ILHA DA MAGIA`;
 const desc=(String(item.description||'Descubrí este lugar en ILHA DA MAGIA.').replace(/\s+/g,' ').slice(0,170));
 const pic=safePhoto(item.photo_url)||SITE+'/ilha-share.png';
 const canonical=SITE+'/api/share?type='+encodeURIComponent(type)+'&id='+encodeURIComponent(id);
 const destination=SITE+path;
 res.statusCode=200;res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','public, max-age=60, s-maxage=120, stale-while-revalidate=300');
 return res.end(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}">${meta('og:type','website')}${meta('og:site_name','ILHA DA MAGIA')}${meta('og:title',title)}${meta('og:description',desc)}${meta('og:url',canonical)}${meta('og:image',pic)}<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${esc(pic)}"><link rel="canonical" href="${esc(canonical)}"><meta http-equiv="refresh" content="1;url=${esc(destination)}"><script>location.replace(${JSON.stringify(destination)});</script></head><body style="font-family:system-ui,sans-serif;background:#f3faf8;color:#17454b;padding:32px;text-align:center"><h1>🌴 ILHA DA MAGIA</h1><p>${esc(item.name)}</p><a href="${esc(destination)}">Abrir publicación →</a></body></html>`);
};

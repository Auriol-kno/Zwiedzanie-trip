/* I Was Here 8.6 — Odkrywaj: szlaki tematyczne (historia, zamki, legendy, czarownice, II wojna, nauka…).
 * Dane: data/szlaki.json, wczytywane dynamicznie (fetch) dopiero po otwarciu zakładki — nie obciążają startu Atlasu;
 * service worker zapisuje je w pamięci podręcznej, więc działają też offline.
 * Ilustracje motywów: wektorowe kafelki w stylu logo (kolor motywu, złota ramka, kremowy rysunek), bez filtrów SVG.
 * API: window.IWH_EXPLORE = { load(), art(key,color,size), render(panel, ctx), routesFor(placeId) }. */
(function(){
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const C='#FFF9E8',A='#FFB24A';
// Rysunki 64×64 (kremowa kreska + bursztynowe akcenty). {c} = kolor motywu (do „wycięć”).
const ART={
 crown:'<path d="M15 43 13 23l10 9 9-15 9 15 10-9-2 20Z" fill="'+C+'"/><rect x="15" y="45" width="34" height="5" rx="1.5" fill="'+C+'"/><circle cx="32" cy="16" r="3" fill="'+A+'"/><circle cx="13" cy="22" r="2.6" fill="'+A+'"/><circle cx="51" cy="22" r="2.6" fill="'+A+'"/><circle cx="32" cy="36" r="3" fill="{c}"/><circle cx="22" cy="38" r="2" fill="{c}"/><circle cx="42" cy="38" r="2" fill="{c}"/>',
 castle:'<path d="M8 53c7-6 15-7 24-5s17 1 24 5Z" fill="'+A+'" opacity=".85"/><path d="M17 48V25h3v-4h3v4h2v-4h3v4h2V48ZM36 48V25h3v-4h3v4h2v-4h3v4h2V48ZM28 48V33h8v15Z" fill="'+C+'"/><path d="M30 48v-6a2 2 0 0 1 4 0v6Z" fill="{c}"/><rect x="21" y="31" width="3" height="5" rx="1.5" fill="{c}"/><rect x="40" y="31" width="3" height="5" rx="1.5" fill="{c}"/><path d="M43 21V11l8 3-8 3" fill="'+A+'"/>',
 dragon:'<path d="M27 26 21 11l11 12ZM35 23l-1-14 8 13Z" fill="'+A+'"/><path d="M12 54c0-13 6-22 16-26l12-4 12 2c4 1 5 5 2 7l-8 1 4 3c2 2 0 5-3 4l-7-2c-4 5-6 10-6 15Z" fill="'+C+'"/><path d="M16 42l-6-1 4-4ZM20 34l-5-3 5-2Z" fill="'+C+'"/><circle cx="41" cy="29" r="2" fill="{c}"/><circle cx="51" cy="29" r="1" fill="{c}"/><path d="M54 34c3-1 6 0 8 3-3 0-4 2-7 1Z" fill="'+A+'"/><path d="M27 44c2-3 5-4 8-3" fill="none" stroke="{c}" stroke-width="1.6" stroke-linecap="round"/>',
 witch:'<path d="M45 12a8 8 0 1 0 6 13 7 7 0 0 1-6-13Z" fill="'+A+'"/><path d="M23 41 33 11c2 4 7 6 9 5-3 3-4 7-3 25Z" fill="'+C+'"/><path d="M12 43c7-4 30-5 40 0-9 5-31 5-40 0Z" fill="'+C+'"/><rect x="24" y="37" width="15" height="3.5" rx="1" fill="'+A+'"/><path d="M10 54 48 49" stroke="'+C+'" stroke-width="2.6" stroke-linecap="round"/><path d="M48 49l8-4M48 49l9-1M48 49l8 3" stroke="'+A+'" stroke-width="2.2" stroke-linecap="round"/><circle cx="17" cy="20" r="1.4" fill="'+C+'"/><circle cx="54" cy="36" r="1.2" fill="'+C+'"/>',
 candle:'<circle cx="32" cy="22" r="11" fill="'+A+'" opacity=".22"/><path d="M32 11c5 6 5 12 0 15-5-3-5-9 0-15Z" fill="'+A+'"/><path d="M32 17c2 3 2 6 0 8-2-2-2-5 0-8Z" fill="'+C+'"/><path d="M20 30h24l-3 21H23Z" fill="'+C+'"/><rect x="18" y="28" width="28" height="4" rx="1.5" fill="'+C+'"/><path d="M26 36h12l-1 9H27Z" fill="{c}" opacity=".55"/><path d="M14 54h36" stroke="'+C+'" stroke-width="2.6" stroke-linecap="round"/>',
 orbit:'<ellipse cx="32" cy="32" rx="23" ry="10" transform="rotate(-22 32 32)" fill="none" stroke="'+C+'" stroke-width="2.4"/><circle cx="32" cy="32" r="8" fill="'+A+'"/><path d="M32 20v-4M32 48v-4M20 32h-4M48 32h-4" stroke="'+A+'" stroke-width="2" stroke-linecap="round"/><circle cx="52" cy="23" r="4" fill="'+C+'"/><circle cx="13" cy="40" r="2.6" fill="'+C+'"/><circle cx="14" cy="14" r="1.3" fill="'+C+'"/><circle cx="50" cy="50" r="1.3" fill="'+C+'"/>',
 gear:'<circle cx="30" cy="34" r="13" fill="none" stroke="'+C+'" stroke-width="8" stroke-dasharray="5.1 5.1"/><circle cx="30" cy="34" r="10" fill="'+C+'"/><circle cx="30" cy="34" r="4" fill="{c}"/><circle cx="47" cy="18" r="6" fill="none" stroke="'+A+'" stroke-width="5" stroke-dasharray="3.1 3.2"/><circle cx="47" cy="18" r="4.5" fill="'+A+'"/><circle cx="47" cy="18" r="1.8" fill="{c}"/>',
 mine:'<path d="M18 48 44 20M46 48 20 20" stroke="'+C+'" stroke-width="3.6" stroke-linecap="round"/><path d="M38 15l11 11" stroke="'+C+'" stroke-width="8" stroke-linecap="round"/><path d="M15 26 26 15" stroke="'+C+'" stroke-width="8" stroke-linecap="round"/><path d="M24 50c0-5 4-8 8-8s8 3 8 8Z" fill="'+A+'"/><circle cx="32" cy="38" r="3" fill="'+A+'"/>',
 bison:'<path d="M9 45c0-7 4-11 12-11 6 0 10-7 18-9 8-2 14 3 15 9l2 8c0 2-2 3-4 2l-2-3-1 9h-4v-6H25v6h-4v-6c-5 0-8 3-12 1Z" fill="'+C+'"/><path d="M49 41l-2 6 4-3" fill="'+C+'"/><path d="M47 28c2-3 6-4 8-1" fill="none" stroke="'+A+'" stroke-width="2.4" stroke-linecap="round"/><circle cx="49" cy="34" r="1.5" fill="{c}"/><path d="M9 41c-3 1-4 5-2 8" fill="none" stroke="'+C+'" stroke-width="2.4" stroke-linecap="round"/><path d="M6 55h52" stroke="'+A+'" stroke-width="2.6" stroke-linecap="round"/><path d="M14 22l4-9 4 9ZM20 24l3-7 3 7Z" fill="'+A+'" opacity=".75"/>',
 domes:'<path d="M10 51V36h12v15ZM16 22c-1 5-6 7-6 12v2h12v-2c0-5-5-7-6-12Z" fill="'+C+'"/><path d="M16 16v6" stroke="'+A+'" stroke-width="2"/><path d="M14 18h4" stroke="'+A+'" stroke-width="2"/><path d="M25 51V35h14v16ZM25 35a7 7 0 0 1 14 0Z" fill="'+C+'"/><path d="M34 21a4 4 0 1 0 3 6 3.4 3.4 0 0 1-3-6Z" fill="'+A+'"/><path d="M42 51V33l6-6 6 6v18Z" fill="'+C+'"/><path d="m48 36 2.6 4.5h-5.2Zm0 7-2.6-4.5h5.2Z" fill="{c}"/><path d="M6 54h52" stroke="'+A+'" stroke-width="2.6" stroke-linecap="round"/>',
 globe:'<circle cx="32" cy="30" r="16" fill="none" stroke="'+C+'" stroke-width="2.6"/><ellipse cx="32" cy="30" rx="7" ry="16" fill="none" stroke="'+C+'" stroke-width="2"/><path d="M16 30h32M18.5 22h27M18.5 38h27" stroke="'+C+'" stroke-width="2"/><path d="M12 36c1 9 7 15 16 17M52 36c-1 9-7 15-16 17" fill="none" stroke="'+A+'" stroke-width="2.6" stroke-linecap="round"/><path d="M14 42l-4 1M17 47l-4 2M50 42l4 1M47 47l4 2" stroke="'+A+'" stroke-width="2.2" stroke-linecap="round"/>',
 palace:'<path d="M32 12a5 5 0 0 1 5 5H27a5 5 0 0 1 5-5Z" fill="'+A+'"/><path d="M22 28 32 18l10 10Z" fill="'+C+'"/><rect x="22" y="28" width="20" height="18" fill="'+C+'"/><rect x="10" y="32" width="12" height="14" fill="'+C+'"/><rect x="42" y="32" width="12" height="14" fill="'+C+'"/><path d="M26 31v12M30 31v12M34 31v12M38 31v12" stroke="{c}" stroke-width="2"/><path d="M13 36h6M45 36h6M13 41h6M45 41h6" stroke="{c}" stroke-width="2"/><rect x="8" y="46" width="48" height="3" fill="'+C+'"/><circle cx="14" cy="53" r="3" fill="'+A+'"/><circle cx="32" cy="53" r="3" fill="'+A+'"/><circle cx="50" cy="53" r="3" fill="'+A+'"/>',
 lighthouse:'<path d="M36 19 56 12M36 21l20 5" stroke="'+A+'" stroke-width="2.4" stroke-linecap="round" opacity=".8"/><path d="M27 15h10l-5-5Z" fill="'+C+'"/><rect x="27" y="15" width="10" height="7" rx="1" fill="'+A+'"/><path d="M26 49 28.5 22h7L38 49Z" fill="'+C+'"/><path d="M27.6 31h8.8l.5 5h-9.8ZM26.6 41h10.8l.5 5H26.1Z" fill="{c}"/><path d="M6 52c4-3 8-3 12 0s8 3 12 0 8-3 12 0 8 3 12 0" fill="none" stroke="'+C+'" stroke-width="2.6" stroke-linecap="round"/><path d="M12 57c4-2 8-2 12 0s8 2 12 0 8-2 12 0" fill="none" stroke="'+A+'" stroke-width="2.2" stroke-linecap="round"/>',
 dino:'<path d="M8 47c0-7 7-11 17-11 6 0 10-2 13-9 2-6 6-11 11-10 3 1 4 4 1 6-3 1-4 4-5 9-2 9-6 14-11 16v6h-4v-6h-6v6h-4v-6c-3 0-5 1-8 3-2 1-4 0-4-4Z" fill="'+C+'"/><path d="M8 47c-3 0-5-2-5-5" fill="none" stroke="'+C+'" stroke-width="2.6" stroke-linecap="round"/><circle cx="49" cy="20" r="1.4" fill="{c}"/><circle cx="24" cy="41" r="2.4" fill="'+A+'"/><circle cx="31" cy="38" r="2" fill="'+A+'"/><circle cx="29" cy="44" r="1.6" fill="'+A+'"/><path d="M4 57h56" stroke="'+A+'" stroke-width="2.4" stroke-linecap="round"/>'
};
let seq=0;
function art(key,color,size){
 const id='exg'+(++seq),c=color||'#0B3446',draw=(ART[key]||ART.castle).split('{c}').join(c);
 return '<svg class="ex-art" viewBox="0 0 64 64" width="'+(size||56)+'" height="'+(size||56)+'" aria-hidden="true" focusable="false"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+c+'" stop-opacity=".88"/><stop offset="1" stop-color="'+c+'"/></linearGradient><linearGradient id="'+id+'f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F1D88E"/><stop offset="1" stop-color="#9E7A2E"/></linearGradient></defs>'+
  '<rect x="1.5" y="1.5" width="61" height="61" rx="15" fill="url(#'+id+')" stroke="url(#'+id+'f)" stroke-width="3"/><rect x="5.5" y="5.5" width="53" height="53" rx="11.5" fill="none" stroke="#F1D88E" stroke-opacity=".35" stroke-width="1"/>'+draw+'</svg>';
}

const T={
 pl:{title:'Odkrywaj',intro:'Wybierz motyw zwiedzania: historia, zamki, legendy, czarownice, II wojna światowa, nauka i więcej. Każdy szlak możesz zapisać jako podróż albo plan dnia.',
  featured:'Polecane szlaki',themes:'Motywy zwiedzania',routes:n=>n+' '+(n===1?'szlak':(n>=2&&n<=4)?'szlaki':'szlaków'),back:'← Wszystkie motywy',backTheme:t=>'← '+t,
  stops:n=>n+' '+(n===1?'przystanek':(n%10>=2&&n%10<=4&&(n%100<12||n%100>14))?'przystanki':'przystanków'),km:k=>'ok. '+k+' km',days:d=>d+' '+(d==='1'?'dzień':'dni'),car:'🚗 samochodem',walk:'🚶 pieszo',
  saveTrip:'🧳 Zapisz jako podróż',saveDay:'🗓️ Utwórz plan dnia',maps:'🧭 Trasa w Google Maps',show:'Pokaż',guide:'Przewodnik',
  savedTrip:n=>'Zapisano podróż „'+n+'” w zakładce Plany.',savedDay:n=>'Utworzono plan dnia „'+n+'” w zakładce Plany.',
  loading:'Wczytywanie szlaków…',error:'Nie udało się wczytać szlaków. Sprawdź połączenie z internetem i spróbuj ponownie.',retry:'Spróbuj ponownie',
  search:'Szukasz konkretnego miasta lub województwa? Użyj wyszukiwarki ⌕ w nagłówku mapy.',kmNote:'Dystans liczony w linii prostej × 1,3 — to szacunek.',onRoute:'Na szlaku'},
 en:{title:'Explore',intro:'Pick a sightseeing theme: history, castles, legends, witches, World War II, science and more. You can save any route as a trip or a day plan.',
  featured:'Featured routes',themes:'Sightseeing themes',routes:n=>n+' '+(n===1?'route':'routes'),back:'← All themes',backTheme:t=>'← '+t,
  stops:n=>n+' '+(n===1?'stop':'stops'),km:k=>'about '+k+' km',days:d=>d+' '+(d==='1'?'day':'days'),car:'🚗 by car',walk:'🚶 on foot',
  saveTrip:'🧳 Save as a trip',saveDay:'🗓️ Create a day plan',maps:'🧭 Route in Google Maps',show:'Show',guide:'Guide',
  savedTrip:n=>'Saved the trip “'+n+'” in Plans.',savedDay:n=>'Created the day plan “'+n+'” in Plans.',
  loading:'Loading routes…',error:'Could not load the routes. Check your internet connection and try again.',retry:'Try again',
  search:'Looking for a specific city or province? Use the ⌕ search in the map header.',kmNote:'Distance is the straight line × 1.3 — an estimate.',onRoute:'On the route'}
};
let data=null,loading=null;
function load(){
 if(data)return Promise.resolve(data);
 if(!loading)loading=fetch('./data/szlaki.json').then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).then(j=>{data=j;return j}).catch(e=>{loading=null;throw e});
 return loading;
}
const item=ref=>{const [t,id]=ref.split(':');return {t,id}};
const kmBetween=(a,b)=>{const R=6371,r=Math.PI/180,dl=(b.lat-a.lat)*r,dn=(b.lon-a.lon)*r,q=Math.sin(dl/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(q))};
function routeInfo(r,ctx){
 const pts=r.stops.map(s=>({s,it:item(s.ref),r:ctx.A.resolve(item(s.ref))})).filter(o=>o.r);
 let km=0;for(let i=1;i<pts.length;i++)km+=kmBetween(pts[i-1].r,pts[i].r)*1.3;
 return {pts,km:Math.round(km/10)*10};
}
const theme=id=>data.themes.find(t=>t.id===id);
const L=(o,lang)=>(o&&(o[lang]||o.pl))||{};
let view={kind:'home',id:null};

function routeCard(r,ctx,big){
 const th=theme(r.theme),l=ctx.lang,t=T[l],info=routeInfo(r,ctx);
 return '<button type="button" class="ex-route'+(big?' big':'')+'" data-ex-route="'+esc(r.id)+'" style="--ex:'+esc(th.color)+'">'+art(r.art||th.art,th.color,big?64:48)+
  '<span class="ex-rt"><small>'+esc(L(th,l).name)+'</small><b>'+esc(L(r,l).name)+'</b><em>'+esc(t.stops(info.pts.length)+' · '+(info.km?t.km(info.km)+' · ':'')+t.days(r.days))+'</em></span></button>';
}
function render(p,ctx){
 const l=ctx.lang,t=T[l];
 if(!data){p.innerHTML=ctx.head(t.title)+'<p class="panel-intro" role="status">'+esc(t.loading)+'</p>';
  load().then(()=>{if(ctx.alive())render(p,ctx)}).catch(()=>{if(!ctx.alive())return;p.innerHTML=ctx.head(t.title)+'<p class="empty">'+esc(t.error)+'</p><button type="button" class="ghost-action" data-ex-retry>'+esc(t.retry)+'</button>'});return}
 const want=new URLSearchParams(location.search).get('route');
 if(want&&!render.used){render.used=true;if(data.routes.some(r=>r.id===want))view={kind:'route',id:want}}
 if(view.kind==='route'){const r=data.routes.find(x=>x.id===view.id);if(r)return renderRoute(p,ctx,r);view={kind:'home'}}
 if(view.kind==='theme'){const th=theme(view.id);if(th)return renderTheme(p,ctx,th);view={kind:'home'}}
 p.innerHTML=ctx.head(t.title)+'<p class="panel-intro">'+esc(t.intro)+'</p>'+
  '<h3>'+esc(t.featured)+'</h3><div class="ex-featured">'+data.routes.filter(r=>r.featured).map(r=>routeCard(r,ctx,true)).join('')+'</div>'+
  '<h3>'+esc(t.themes)+'</h3><div class="ex-themes">'+data.themes.map(th=>{const n=data.routes.filter(r=>r.theme===th.id).length;
   return '<button type="button" class="ex-theme" data-ex-theme="'+esc(th.id)+'" style="--ex:'+esc(th.color)+'">'+art(th.art,th.color,52)+'<span><b>'+esc(L(th,l).name)+'</b><small>'+esc(L(th,l).tagline)+'</small><em>'+esc(t.routes(n))+'</em></span></button>'}).join('')+'</div>'+
  '<p class="muted small ex-note">'+esc(t.search)+'</p>';
}
function renderTheme(p,ctx,th){
 const l=ctx.lang,t=T[l];
 p.innerHTML=ctx.head(L(th,l).name)+'<button type="button" class="ex-back" data-ex-home>'+esc(t.back)+'</button>'+
  '<div class="ex-hero" style="--ex:'+esc(th.color)+'">'+art(th.art,th.color,84)+'<div><b>'+esc(L(th,l).tagline)+'</b><p>'+esc(L(th,l).desc)+'</p></div></div>'+
  '<div class="ex-list">'+data.routes.filter(r=>r.theme===th.id).map(r=>routeCard(r,ctx,false)).join('')+'</div>';
}
function renderRoute(p,ctx,r){
 const l=ctx.lang,t=T[l],th=theme(r.theme),info=routeInfo(r,ctx),R=L(r,l);
 const pts=info.pts.map(o=>o.r);
 const maps=pts.length>1?'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(pts[0].lat.toFixed(5)+','+pts[0].lon.toFixed(5))+'&destination='+encodeURIComponent(pts[pts.length-1].lat.toFixed(5)+','+pts[pts.length-1].lon.toFixed(5))+(pts.length>2?'&waypoints='+encodeURIComponent(pts.slice(1,-1).slice(0,8).map(q=>q.lat.toFixed(5)+','+q.lon.toFixed(5)).join('|')):'')+'&travelmode='+(r.mode==='walking'?'walking':'driving'):'';
 p.innerHTML=ctx.head(R.name)+'<button type="button" class="ex-back" data-ex-theme="'+esc(th.id)+'">'+esc(t.backTheme(L(th,l).name))+'</button>'+
  '<div class="ex-hero" style="--ex:'+esc(th.color)+'">'+art(r.art||th.art,th.color,84)+'<div><small class="ex-kicker">'+esc(L(th,l).name)+'</small><b>'+esc(t.stops(info.pts.length)+(info.km?' · '+t.km(info.km):'')+' · '+t.days(r.days)+' · '+(r.mode==='walking'?t.walk:t.car))+'</b></div></div>'+
  '<p class="ex-intro">'+esc(R.intro)+'</p>'+
  '<div class="ex-actions"><button type="button" class="city-action" data-ex-save="trip">'+esc(t.saveTrip)+'</button><button type="button" class="ghost-action" data-ex-save="day">'+esc(t.saveDay)+'</button>'+(maps?'<a class="ghost-action" href="'+maps+'" target="_blank" rel="noopener">'+esc(t.maps)+'</a>':'')+'</div>'+
  '<ol class="ex-stops">'+info.pts.map((o,i)=>{const note=o.s[l]||o.s.pl||'';const href=o.it.t==='city'&&o.it.id==='warsaw'?'./index.html?lang='+l:o.r.href?o.r.href+(o.r.href.includes('?')?'&':'?')+'lang='+l:'';
   return '<li class="plan-item ex-stop"><span class="ex-num" style="--ex:'+esc(th.color)+'">'+(i+1)+'</span><span class="pi-icon" aria-hidden="true">'+o.r.icon+'</span><span class="pi-text"><b>'+esc(o.r.name)+'</b><small>'+esc(o.r.sub||'')+'</small>'+(note?'<small class="ex-stop-note">'+esc(note)+'</small>':'')+'</span><span class="pi-actions"><button type="button" data-show-item=\''+esc(JSON.stringify(o.it))+'\'>'+esc(t.show)+'</button>'+(href?'<a href="'+esc(href)+'">'+esc(t.guide)+'</a>':'')+'</span></li>'}).join('')+'</ol>'+
  '<p class="muted small">'+esc(t.kmNote+' '+((data.note||{})[l]||''))+'</p>';
}
// Zdarzenia w panelu Atlasu (atlas-plans.js przekazuje ctx przy render)
let lastCtx=null;
document.addEventListener('click',e=>{
 if(!e.target.closest('#tabPanel')||!lastCtx)return;const q=s=>e.target.closest(s);let b;
 if(q('[data-ex-retry]')){render(lastCtx.panel,lastCtx);return}
 if(q('[data-ex-home]')){view={kind:'home'};render(lastCtx.panel,lastCtx);lastCtx.panel.scrollTop=0;return}
 if((b=q('[data-ex-theme]'))){view={kind:'theme',id:b.dataset.exTheme};render(lastCtx.panel,lastCtx);lastCtx.panel.scrollTop=0;return}
 if((b=q('[data-ex-route]'))){view={kind:'route',id:b.dataset.exRoute};render(lastCtx.panel,lastCtx);lastCtx.panel.scrollTop=0;return}
 if((b=q('[data-ex-save]'))&&view.kind==='route'){const r=data.routes.find(x=>x.id===view.id),l=lastCtx.lang,t=T[l];if(!r)return;
  const items=routeInfo(r,lastCtx).pts.map(o=>o.it),name=L(r,l).name.split(' — ')[0];
  const pl=lastCtx.addPlan(b.dataset.exSave,name,items,r.mode);if(pl)lastCtx.toast(b.dataset.exSave==='trip'?t.savedTrip(pl.name):t.savedDay(pl.name));return}
});
window.IWH_EXPLORE={load,art,
 render(panel,ctx){ctx.panel=panel;lastCtx=ctx;render(panel,ctx);const h=panel.querySelector('h2');if(h)h.focus()},
 reset(){view={kind:'home'}},
 routesFor(placeId){return load().then(d=>d.routes.filter(r=>r.stops.some(s=>s.ref==='place:'+placeId)))},
 themeOf(id){return data?theme(id):null}};
})();

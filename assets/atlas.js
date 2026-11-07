/* I Was Here — Atlas Polski 5.1. Mapa wektorowa działa także bez sieci. */
(function(){
'use strict';
const $=s=>document.querySelector(s),NS='http://www.w3.org/2000/svg';
const CITIES=[
{id:'warsaw',pl:'Warszawa',en:'Warsaw',lat:52.2297,lon:21.0122,ready:true},
{id:'krakow',pl:'Kraków',en:'Krakow',lat:50.0647,lon:19.945,ready:false},
{id:'gdansk',pl:'Gdańsk',en:'Gdansk',lat:54.352,lon:18.6466,ready:false},
{id:'wroclaw',pl:'Wrocław',en:'Wroclaw',lat:51.1079,lon:17.0385,ready:false},
{id:'poznan',pl:'Poznań',en:'Poznan',lat:52.4064,lon:16.9252,ready:false},
{id:'lodz',pl:'Łódź',en:'Lodz',lat:51.7592,lon:19.455,ready:false},
{id:'szczecin',pl:'Szczecin',en:'Szczecin',lat:53.4285,lon:14.5528,ready:false},
{id:'torun',pl:'Toruń',en:'Torun',lat:53.0138,lon:18.5984,ready:false},
{id:'lublin',pl:'Lublin',en:'Lublin',lat:51.2465,lon:22.5684,ready:false},
{id:'bialystok',pl:'Białystok',en:'Bialystok',lat:53.1325,lon:23.1688,ready:false},
{id:'katowice',pl:'Katowice',en:'Katowice',lat:50.2649,lon:19.0238,ready:false},
{id:'rzeszow',pl:'Rzeszów',en:'Rzeszow',lat:50.0412,lon:21.9991,ready:false},
{id:'olsztyn',pl:'Olsztyn',en:'Olsztyn',lat:53.7784,lon:20.4801,ready:false}
];
const GEO=window.POLAND_GEO;
if(!GEO||GEO.regions.length!==16||GEO.border.length<200)throw new Error('Geografia Polski nie została załadowana');
const BORDER=GEO.border;
const I={
pl:{atlas:'Atlas Polski',subtitle:'13 miast · tysiące historii',headline:'Odkrywaj\npo swojemu.',lead:'Wybierz miasto i ruszaj na spotkanie z niezwykłymi miejscami.',styleAtlas:'Atlas',styleNight:'Noc',styleTerrain:'Teren',choose:'Wybierz miasto',pilot:'Przewodnik dostępny',planned:'W przygotowaniu',explore:'Odkryj Warszawę',unavailable:'Wkrótce',pilotMessage:'184 atrakcje • 18 dzielnic • 36 lokali',plannedMessage:'Ten przewodnik jest w przygotowaniu. Warszawę możesz zwiedzać już teraz.',search:'Szukaj miasta...',zero:'Nie znaleziono miasta',tooltip:'Wróć do mapy Polski',reset:'Pokaż całą Polskę',full:'Pełny ekran',entry:'Mapa Polski',land:'Polska',footer:'Kontur: Natural Earth (public domain)'},
en:{atlas:'Poland Atlas',subtitle:'13 cities · countless stories',headline:'Explore your\nown way.',lead:'Pick a city and discover memorable places and fascinating stories.',styleAtlas:'Atlas',styleNight:'Night',styleTerrain:'Terrain',choose:'Choose a city',pilot:'Guide available',planned:'Coming soon',explore:'Explore Warsaw',unavailable:'Coming soon',pilotMessage:'184 sights • 18 districts • 36 places to eat',plannedMessage:'This city guide is being prepared. You can explore Warsaw today.',search:'Search cities...',zero:'No matching city',tooltip:'Back to Poland map',reset:'Show all of Poland',full:'Full screen',entry:'Map of Poland',land:'Poland',footer:'Outline: Natural Earth (public domain)'}
};
let lang=localStorage.getItem('tubylem_lang')==='en'?'en':'pl';
let style=['atlas','night','terrain'].includes(localStorage.getItem('tubylem_map_style'))?localStorage.getItem('tubylem_map_style'):'atlas';
// Główna mapa w nowej instalacji: wybrany jasny atlas ilustracyjny.
const qs=new URLSearchParams(location.search);if(qs.get('lang')==='en'||qs.get('lang')==='pl')lang=qs.get('lang');
let current=CITIES[0],zoom=1,tx=0,ty=0,drag=null,moved=false;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const project=(lon,lat)=>({x:(lon-12.5)*69,y:(55.25-lat)*104});
const path=a=>a.map((p,i)=>{const c=project(p[0],p[1]);return(i?'L':'M')+c.x.toFixed(2)+' '+c.y.toFixed(2)}).join(' ')+' Z';
const el=(name,attrs,text)=>{const o=document.createElementNS(NS,name);Object.entries(attrs||{}).forEach(([k,v])=>o.setAttribute(k,v));if(text!=null)o.textContent=text;return o};
const svg=$('#polandSvg'),g=el('g',{id:'world'});
svg.innerHTML='<defs><linearGradient id="landGradient" x1="0" y1="0" x2=".9" y2="1"><stop offset="0%" stop-color="#fff9d5"/><stop offset="52%" stop-color="#9acaa3"/><stop offset="100%" stop-color="#758c52"/></linearGradient><filter id="blurShadow"><feGaussianBlur stdDeviation="11"/></filter><filter id="cityGlow"><feGaussianBlur stdDeviation="13"/></filter><clipPath id="polandClip"><path d="'+path(BORDER)+'"/></clipPath><pattern id="mapDots" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".65" fill="#476b62" opacity=".12"/></pattern></defs>';
svg.appendChild(g);
g.appendChild(el('path',{class:'country-shadow',d:path(BORDER),transform:'translate(5,8)'}));
g.appendChild(el('path',{class:'country-base',d:path(BORDER)}));
const clipped=el('g',{'clip-path':'url(#polandClip)'});g.appendChild(clipped);
clipped.appendChild(el('rect',{x:50,y:35,width:825,height:620,fill:'url(#mapDots)'}));
clipped.appendChild(el('path',{class:'atlas-wash',d:path(BORDER)}));
if(window.IWH_ATLAS_ART)window.IWH_ATLAS_ART.decorate({clipped,el,project,path,geo:GEO});
g.appendChild(el('path',{class:'country-border',d:path(BORDER)}));
const labels=[['POMORZE',17.8,54.13],['MAZURY',21.3,53.65],['WIELKOPOLSKA',16.45,52.05],['MAZOWSZE',21.35,52.85],['MAŁOPOLSKA',20.95,49.86]];
const labelLayer=el('g',{id:'regions'});g.appendChild(labelLayer);
const dots=el('g',{id:'cities'});g.appendChild(dots);
function cityText(c){return lang==='en'?c.en:c.pl}
function pointCity(city){
 const p=project(city.lon,city.lat),b=el('g',{class:'city-dot'+(!city.ready?' upcoming':'')+(current.id===city.id?' selected':''),tabindex:'0',role:'button','aria-label':cityText(city),'data-city':city.id,transform:'translate('+p.x.toFixed(1)+' '+p.y.toFixed(1)+')'});
 if(window.IWH_ATLAS_ART){const art=el('g',{class:'city-landmark',transform:'translate(-37,-69)'});art.innerHTML=window.IWH_ATLAS_ART.landmark(city.id);b.appendChild(art)}
 b.appendChild(el('circle',{class:'city-spotlight',r:28}));b.appendChild(el('circle',{class:'city-ring',r:9.8}));b.appendChild(el('circle',{class:'city-core',r:4.5}));b.appendChild(el('circle',{class:'city-hit',r:23}));
 const labelPos={gdansk:[11,23,'start'],szczecin:[12,25,'start'],olsztyn:[12,25,'start'],bialystok:[12,27,'start'],torun:[11,26,'start'],poznan:[12,25,'start'],warsaw:[12,27,'start'],lodz:[11,25,'start'],wroclaw:[12,25,'start'],katowice:[-13,27,'end'],krakow:[13,28,'start'],lublin:[12,27,'start'],rzeszow:[12,27,'start']}[city.id]||[11,25,'start'];
 b.appendChild(el('text',{class:'city-label',x:labelPos[0],y:labelPos[1],'text-anchor':labelPos[2]},cityText(city)));
 b.addEventListener('click',ev=>{ev.stopPropagation();if(!moved)select(city.id)});
 b.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();select(city.id)}});
 return b;
}
function renderMarkers(){
 dots.textContent='';CITIES.forEach(c=>dots.appendChild(pointCity(c)));
 labelLayer.textContent='';labels.forEach(([t,lon,lat])=>{const p=project(lon,lat);const txt=lang==='en'?({'POMORZE':'POMERANIA','MAZURY':'MASURIA','WIELKOPOLSKA':'GREATER POLAND','MAZOWSZE':'MASOVIA','MAŁOPOLSKA':'LESSER POLAND'}[t]):t;labelLayer.appendChild(el('text',{class:'map-regional',x:p.x,y:p.y},txt))});
}
function setTransform(){g.setAttribute('transform','translate('+tx+' '+ty+') scale('+zoom+')')}
// Powiększenie wokół punktu (domyślnie środek viewBox 900×680).
function zoomTo(v,cx=450,cy=340){const old=zoom;zoom=Math.min(2.6,Math.max(.83,v));tx=cx-(cx-tx)*zoom/old;ty=cy-(cy-ty)*zoom/old;setTransform()}
function svgPoint(x,y){const m=svg.getScreenCTM();if(!m)return{x:450,y:340};const p=svg.createSVGPoint();p.x=x;p.y=y;const q=p.matrixTransform(m.inverse());return{x:q.x,y:q.y}}
function reset(){zoom=1;tx=0;ty=0;setTransform()}
function select(id){
 const hit=CITIES.find(c=>c.id===id);if(!hit)return;current=hit;
 const refocus=document.activeElement?.closest?.('.city-dot');
 renderMarkers();renderCard();renderStrip();
 // Przebudowa pinezek usuwa element z fokusem — przywróć go dla klawiatury i VoiceOver.
 if(refocus)dots.querySelector('[data-city="'+id+'"]')?.focus({preventScroll:true});
}
function renderStrip(){
 const strip=$('#cityStrip');strip.innerHTML=CITIES.map(c=>'<button type="button" class="city-chip '+(current.id===c.id?'active':'')+'" data-city-chip="'+c.id+'"><span>'+esc(cityText(c))+'</span><span class="city-state">'+(c.ready?'✦':'·')+'</span></button>').join('');
 const active=strip.querySelector('.active');if(active&&strip.dataset.initialized)active.scrollIntoView({block:'nearest',inline:'nearest'});strip.dataset.initialized='1';
}
function renderCard(){
 $('#cityName').textContent=cityText(current);
 $('#cityDescription').textContent=current.ready?I[lang].pilotMessage:I[lang].plannedMessage;
 $('#cityAction').textContent=current.ready?I[lang].explore:I[lang].unavailable;
 $('#cityAction').disabled=!current.ready;
 $('#cityStatus').textContent=current.ready?I[lang].pilot:I[lang].planned;
}
function localize(){
 document.documentElement.lang=lang;document.body.dataset.style=style;
 const t=I[lang];
 [['atlasEyebrow',t.subtitle],['atlasHeadline',t.headline],['atlasLead',t.lead],['styleAtlas',t.styleAtlas],['styleNight',t.styleNight],['styleTerrain',t.styleTerrain],['citiesTitle',t.choose],['atlasFooter',t.footer]].forEach(([id,txt])=>{const e=$('#'+id);if(e)e.textContent=txt});
 $('#atlasHeadline').style.whiteSpace='pre-line';
 $('#langButton').querySelectorAll('[data-lang]').forEach(x=>x.classList.toggle('on',x.dataset.lang===lang));
 $('#searchInput').placeholder=t.search;
 $('#searchButton').setAttribute('aria-label',t.search);
 $('#resetView').setAttribute('aria-label',t.reset);
 $('#fullscreen').setAttribute('aria-label',t.full);
 $('#fullscreen').title=t.full;
 $('#searchClose').setAttribute('aria-label',lang==='en'?'Close search':'Zamknij wyszukiwarkę');
 $('#polandSvg').setAttribute('aria-label',lang==='en'?'Interactive map of Poland with 13 cities':'Interaktywna mapa Polski z 13 miastami');
 $('#zoomIn').setAttribute('aria-label',lang==='en'?'Zoom in':'Powiększ mapę');
 $('#zoomOut').setAttribute('aria-label',lang==='en'?'Zoom out':'Pomniejsz mapę');
 $('#langButton').setAttribute('aria-label',lang==='en'?'Language: English. Switch to Polish':'Język: polski. Przełącz na angielski');
 $('.brand').setAttribute('aria-label',lang==='en'?'Back to Poland Atlas':'I Was Here — Atlas Polski');
 $('.style-panel').setAttribute('aria-label',lang==='en'?'Map style':'Styl mapy');
 $('.atlas-bottom').setAttribute('aria-label',lang==='en'?'Choose a city':'Wybór miasta');
 document.title='I Was Here — '+(lang==='en'?'Poland Atlas':'Atlas Polski');
 for(const mode of ['atlas','night','terrain']){$('#style'+mode[0].toUpperCase()+mode.slice(1)).classList.toggle('active',style===mode)}
 localStorage.setItem('tubylem_lang',lang);
 localStorage.setItem('tubylem_map_style',style);
 renderMarkers();renderStrip();renderCard();
}
function openCity(){if(!current.ready)return;location.href='./index.html?lang='+encodeURIComponent(lang)+'&from=atlas'}
$('#cityAction').onclick=openCity;
$('#cityStrip').onclick=e=>{const b=e.target.closest('[data-city-chip]');if(b)select(b.dataset.cityChip)};
$('#langButton').onclick=e=>{const pick=e.target.closest('[data-lang]')?.dataset.lang;const next=pick||(lang==='pl'?'en':'pl');if(next===lang&&pick)return;lang=next;localize()};
for(const mode of ['atlas','night','terrain'])$('#style'+mode[0].toUpperCase()+mode.slice(1)).onclick=()=>{style=mode;localize()};
$('#zoomIn').onclick=()=>zoomTo(zoom*1.3);$('#zoomOut').onclick=()=>zoomTo(zoom/1.3);$('#resetView').onclick=reset;
$('#searchButton').onclick=()=>{const sb=$('#searchBox');sb.classList.toggle('open');if(sb.classList.contains('open'))$('#searchInput').focus()};
$('#searchClose').onclick=()=>{$('#searchBox').classList.remove('open');$('#searchInput').value='';document.querySelectorAll('.city-chip').forEach(x=>x.hidden=false)};
$('#searchInput').oninput=e=>{
 const term=e.target.value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 document.querySelectorAll('.city-chip').forEach(b=>{const c=CITIES.find(x=>x.id===b.dataset.cityChip);b.hidden=!c||!([c.pl,c.en].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(term))});
};
$('#fullscreen').onclick=()=>{if(document.fullscreenElement){document.exitFullscreen?.();return}if(document.documentElement.requestFullscreen){document.documentElement.requestFullscreen().catch(()=>alert(lang==='en'?'On iPhone, add this page to your Home Screen for an app-like full screen.':'Na iPhonie dodaj stronę do ekranu początkowego, aby korzystać z pełnoekranowej aplikacji.'))}else{alert(lang==='en'?'On iPhone, add this page to your Home Screen for an app-like full screen.':'Na iPhonie dodaj stronę do ekranu początkowego, aby korzystać z pełnoekranowej aplikacji.')}}
// Przesuwanie jednym palcem / myszą oraz powiększanie dwoma palcami (pinch) na iPhonie.
const touches=new Map();let pinch=null;
const gap=()=>{const [a,b]=[...touches.values()];return Math.hypot(a.x-b.x,a.y-b.y)};
const middle=()=>{const [a,b]=[...touches.values()];return svgPoint((a.x+b.x)/2,(a.y+b.y)/2)};
svg.addEventListener('pointerdown',e=>{
 touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(touches.size===2){pinch={d:gap()||1,z:zoom};drag=null;moved=true;return}
 if(e.target.closest('.city-dot'))return;
 drag={x:e.clientX,y:e.clientY,tx,ty};moved=false;try{svg.setPointerCapture(e.pointerId)}catch(_){}});
svg.addEventListener('pointermove',e=>{
 if(touches.has(e.pointerId))touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pinch&&touches.size===2){const c=middle();zoomTo(pinch.z*gap()/pinch.d,c.x,c.y);return}
 if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>5)moved=true;const rect=svg.getBoundingClientRect();tx=drag.tx+dx*900/rect.width;ty=drag.ty+dy*680/rect.height;setTransform()});
const release=e=>{touches.delete(e.pointerId);if(touches.size<2)pinch=null;drag=null;setTimeout(()=>{moved=false},30)};
svg.addEventListener('pointerup',release);
svg.addEventListener('pointercancel',release);
svg.addEventListener('wheel',e=>{e.preventDefault();const c=svgPoint(e.clientX,e.clientY);zoomTo(zoom*(e.deltaY<0?1.1:.9),c.x,c.y)},{passive:false});
// Safari na iOS wysyła też własne gesty — blokujemy powiększanie całej strony nad mapą.
svg.addEventListener('gesturestart',e=>e.preventDefault());
window.addEventListener('pageshow',()=>{const val=localStorage.getItem('tubylem_lang');if(val&&val!==lang){lang=val;localize()}});
localize();reset();
// Tryb offline działa także dla osób, które otwierają tylko Atlas (start_url PWA).
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
})();
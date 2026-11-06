/* Tu Byłem — Atlas Polski 4.0. Mapa wektorowa działa także bez sieci. */
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
const BORDER=[[15.016996,51.106674],[14.607098,51.745188],[14.685026,52.089947],[14.4376,52.62485],[14.074521,52.981263],[14.353315,53.248171],[14.119686,53.757029],[14.8029,54.050706],[16.363477,54.513159],[17.622832,54.851536],[18.620859,54.682606],[18.696255,54.438719],[19.66064,54.426084],[20.892245,54.312525],[22.731099,54.327537],[23.243987,54.220567],[23.484128,53.912498],[23.527536,53.470122],[23.804935,53.089731],[23.799199,52.691099],[23.199494,52.486977],[23.508002,52.023647],[23.527071,51.578454],[24.029986,50.705407],[23.922757,50.424881],[23.426508,50.308506],[22.51845,49.476774],[22.776419,49.027395],[22.558138,49.085738],[21.607808,49.470107],[20.887955,49.328772],[20.415839,49.431453],[19.825023,49.217125],[19.320713,49.571574],[18.909575,49.435846],[18.853144,49.49623],[18.392914,49.988629],[17.649445,50.049038],[17.554567,50.362146],[16.868769,50.473974],[16.719476,50.215747],[16.176253,50.422607],[16.238627,50.697733],[15.490972,50.78473],[15.016996,51.106674]];
const I={
pl:{atlas:'Atlas Polski',subtitle:'13 miast · tysiące historii',headline:'Odkrywaj\npo swojemu.',lead:'Wybierz miasto i ruszaj na spotkanie z niezwykłymi miejscami.',styleAtlas:'Atlas',styleNight:'Noc',styleTerrain:'Teren',choose:'Wybierz miasto',pilot:'Przewodnik dostępny',planned:'W przygotowaniu',explore:'Odkryj Warszawę',unavailable:'Wkrótce',pilotMessage:'184 atrakcje • 18 dzielnic • 36 lokali',plannedMessage:'Ten przewodnik jest w przygotowaniu. Warszawę możesz zwiedzać już teraz.',search:'Szukaj miasta...',zero:'Nie znaleziono miasta',tooltip:'Wróć do mapy Polski',reset:'Pokaż całą Polskę',full:'Pełny ekran',entry:'Mapa Polski',land:'Polska',footer:'Kontur: Natural Earth (public domain)'},
en:{atlas:'Poland Atlas',subtitle:'13 cities · countless stories',headline:'Explore your\nown way.',lead:'Pick a city and discover memorable places and fascinating stories.',styleAtlas:'Atlas',styleNight:'Night',styleTerrain:'Terrain',choose:'Choose a city',pilot:'Guide available',planned:'Coming soon',explore:'Explore Warsaw',unavailable:'Coming soon',pilotMessage:'184 sights • 18 districts • 36 places to eat',plannedMessage:'This city guide is being prepared. You can explore Warsaw today.',search:'Search cities...',zero:'No matching city',tooltip:'Back to Poland map',reset:'Show all of Poland',full:'Full screen',entry:'Map of Poland',land:'Poland',footer:'Outline: Natural Earth (public domain)'}
};
let lang=localStorage.getItem('tubylem_lang')==='en'?'en':'pl';
let style=['atlas','night','terrain'].includes(localStorage.getItem('tubylem_map_style'))?localStorage.getItem('tubylem_map_style'):'atlas';
const qs=new URLSearchParams(location.search);if(qs.get('lang')==='en'||qs.get('lang')==='pl')lang=qs.get('lang');
let current=CITIES[0],zoom=1,tx=0,ty=0,drag=null,moved=false;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const project=(lon,lat)=>({x:(lon-13.3)*75,y:(55.5-lat)*95});
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
const forests=[[[14.5,53.6],[17.9,54],[18.2,52.6],[15.1,52.3]],[[21.6,54.1],[23.3,54],[23.6,52.1],[22.1,52.9]],[[21.4,51.3],[23.6,51.5],[22.3,49.7],[20.8,50]],[[16.3,51.3],[19.2,51.9],[18.9,50.6],[16.8,50.5]]];
forests.forEach(f=>clipped.appendChild(el('path',{class:'forest',d:path(f)})));
for(let i=0;i<16;i++){let y=85+i*36;clipped.appendChild(el('path',{class:'contour',d:'M 70 '+y+' C 180 '+(y-44)+' 280 '+(y+39)+' 390 '+(y+8)+' S 610 '+(y+45)+' 800 '+(y-8)}))}
clipped.appendChild(el('path',{class:'mountain',d:'M 260 535 C 360 515 425 576 515 560 S 655 535 760 566'}));
clipped.appendChild(el('path',{class:'mountain',d:'M 260 556 C 390 535 470 596 600 578 S 670 580 760 597'}));
const v=[[19.95,50.05],[20.3,50.45],[21.1,50.95],[21.5,51.45],[21.0,52.23],[20.5,52.85],[19.9,53.25],[18.7,53.75],[18.65,54.34]];
const coords=v.map(a=>project(a[0],a[1]));const rivD='M'+coords[0].x+' '+coords[0].y+coords.slice(1).map(c=>' L'+c.x.toFixed(1)+' '+c.y.toFixed(1)).join('');
clipped.appendChild(el('path',{class:'river',d:rivD}));
clipped.appendChild(el('path',{class:'river-detail',d:rivD}));
[[20.6,53.8],[21.2,53.9],[21.7,53.95],[20.9,54.0],[22.1,54.07]].forEach(p=>{const c=project(...p);clipped.appendChild(el('ellipse',{class:'lake',cx:c.x,cy:c.y,rx:14,ry:4,transform:'rotate(-20 '+c.x+' '+c.y+')'}))});
g.appendChild(el('path',{class:'country-border',d:path(BORDER)}));
const labels=[['POMORZE',17.8,54.13],['MAZURY',21.3,53.65],['WIELKOPOLSKA',16.45,52.05],['MAZOWSZE',21.35,52.85],['MAŁOPOLSKA',20.95,49.86]];
const labelLayer=el('g',{id:'regions'});g.appendChild(labelLayer);
const dots=el('g',{id:'cities'});g.appendChild(dots);
function cityText(c){return lang==='en'?c.en:c.pl}
function pointCity(city){
 const p=project(city.lon,city.lat),b=el('g',{class:'city-dot'+(!city.ready?' upcoming':'')+(current.id===city.id?' selected':''),tabindex:'0',role:'button','aria-label':cityText(city),'data-city':city.id,transform:'translate('+p.x.toFixed(1)+' '+p.y.toFixed(1)+')'});
 b.appendChild(el('circle',{class:'city-spotlight',r:28}));b.appendChild(el('circle',{class:'city-ring',r:9.8}));b.appendChild(el('circle',{class:'city-core',r:4.5}));b.appendChild(el('circle',{class:'city-hit',r:23}));
 let dx=(city.id==='szczecin'||city.id==='poznan'||city.id==='gdansk'||city.id==='wroclaw')?12:12,dy=(city.id==='gdansk'||city.id==='olsztyn'||city.id==='bialystok')?25:-15;
 if(city.id==='lodz'||city.id==='torun')dy=25;
 b.appendChild(el('text',{class:'city-label',x:dx,y:dy},cityText(city)));
 b.addEventListener('click',ev=>{ev.stopPropagation();if(!moved)select(city.id)});
 b.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();select(city.id)}});
 return b;
}
function renderMarkers(){
 dots.textContent='';CITIES.forEach(c=>dots.appendChild(pointCity(c)));
 labelLayer.textContent='';labels.forEach(([t,lon,lat])=>{const p=project(lon,lat);const txt=lang==='en'?({'POMORZE':'POMERANIA','MAZURY':'MASURIA','WIELKOPOLSKA':'GREATER POLAND','MAZOWSZE':'MASOVIA','MAŁOPOLSKA':'LESSER POLAND'}[t]):t;labelLayer.appendChild(el('text',{class:'map-regional',x:p.x,y:p.y},txt))});
}
function setTransform(){g.setAttribute('transform','translate('+tx+' '+ty+') scale('+zoom+')')}
function zoomTo(v){const old=zoom;zoom=Math.min(2.6,Math.max(.83,v));tx=450-(450-tx)*zoom/old;ty=325-(325-ty)*zoom/old;setTransform()}
function reset(){zoom=1;tx=0;ty=0;setTransform()}
function select(id){
 const hit=CITIES.find(c=>c.id===id);if(!hit)return;current=hit;
 renderMarkers();renderCard();renderStrip();
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
 [['atlasTitle',t.atlas],['atlasSubtitle',t.subtitle],['atlasEyebrow',t.subtitle],['atlasHeadline',t.headline],['atlasLead',t.lead],['styleAtlas',t.styleAtlas],['styleNight',t.styleNight],['styleTerrain',t.styleTerrain],['citiesTitle',t.choose],['atlasFooter',t.footer]].forEach(([id,txt])=>{const e=$('#'+id);if(e)e.textContent=txt});
 $('#atlasHeadline').style.whiteSpace='pre-line';
 $('#langButton').textContent=lang.toUpperCase();
 $('#searchInput').placeholder=t.search;
 $('#searchButton').setAttribute('aria-label',t.search);
 $('#resetView').setAttribute('aria-label',t.reset);
 $('#fullscreen').setAttribute('aria-label',t.full);
 $('#fullscreen').title=t.full;
 document.title=lang==='en'?'Tu Byłem — Explore Poland':'Tu Byłem — Atlas Polski';
 for(const mode of ['atlas','night','terrain']){$('#style'+mode[0].toUpperCase()+mode.slice(1)).classList.toggle('active',style===mode)}
 localStorage.setItem('tubylem_lang',lang);
 localStorage.setItem('tubylem_map_style',style);
 renderMarkers();renderStrip();renderCard();
}
function openCity(){if(!current.ready)return;location.href='./index.html?lang='+encodeURIComponent(lang)+'&from=atlas'}
$('#cityAction').onclick=openCity;
$('#cityStrip').onclick=e=>{const b=e.target.closest('[data-city-chip]');if(b)select(b.dataset.cityChip)};
$('#langButton').onclick=()=>{lang=lang==='pl'?'en':'pl';localize()};
for(const mode of ['atlas','night','terrain'])$('#style'+mode[0].toUpperCase()+mode.slice(1)).onclick=()=>{style=mode;localize()};
$('#zoomIn').onclick=()=>zoomTo(zoom*1.3);$('#zoomOut').onclick=()=>zoomTo(zoom/1.3);$('#resetView').onclick=reset;
$('#searchButton').onclick=()=>{const sb=$('#searchBox');sb.classList.toggle('open');if(sb.classList.contains('open'))$('#searchInput').focus()};
$('#searchClose').onclick=()=>{$('#searchBox').classList.remove('open');$('#searchInput').value='';document.querySelectorAll('.city-chip').forEach(x=>x.hidden=false)};
$('#searchInput').oninput=e=>{
 const term=e.target.value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 document.querySelectorAll('.city-chip').forEach(b=>{const c=CITIES.find(x=>x.id===b.dataset.cityChip);b.hidden=!c||!([c.pl,c.en].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(term))});
};
$('#fullscreen').onclick=()=>{if(document.fullscreenElement){document.exitFullscreen?.();return}if(document.documentElement.requestFullscreen){document.documentElement.requestFullscreen().catch(()=>alert(lang==='en'?'On iPhone, add this page to your Home Screen for an app-like full screen.':'Na iPhonie dodaj stronę do ekranu początkowego, aby korzystać z pełnoekranowej aplikacji.'))}else{alert(lang==='en'?'On iPhone, add this page to your Home Screen for an app-like full screen.':'Na iPhonie dodaj stronę do ekranu początkowego, aby korzystać z pełnoekranowej aplikacji.')}}
svg.addEventListener('pointerdown',e=>{if(e.target.closest('.city-dot'))return;drag={x:e.clientX,y:e.clientY,tx,ty};moved=false;svg.setPointerCapture?.(e.pointerId)});
svg.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>5)moved=true;const rect=svg.getBoundingClientRect();tx=drag.tx+dx*900/rect.width;ty=drag.ty+dy*680/rect.height;setTransform()});
svg.addEventListener('pointerup',()=>{drag=null;setTimeout(()=>{moved=false},30)});
svg.addEventListener('pointercancel',()=>{drag=null});
svg.addEventListener('wheel',e=>{e.preventDefault();zoomTo(zoom*(e.deltaY<0?1.1:.9))},{passive:false});
window.addEventListener('pageshow',()=>{const val=localStorage.getItem('tubylem_lang');if(val&&val!==lang){lang=val;localize()}});
localize();reset();
})();
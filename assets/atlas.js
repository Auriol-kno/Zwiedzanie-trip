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
const REG=window.IWH_REGIONS||{regions:[],places:[]};
// Teksty województw (Atlas 6.0). Miejsca regionalne mają własne pola PL/EN w data/regiony.json.
const IR={
pl:{provinces:'Województwa',province:'Województwo',guide:'Przewodnik regionu',partial:'Częściowo dostępny',planned:'W przygotowaniu',exploreRegion:'Zwiedzaj region',explore:'Zwiedzaj',soon:'Wkrótce',plannedText:'Przewodnik po tym województwie jest w przygotowaniu.',town:'Miejscowość',cityGuide:'pełny przewodnik',
 count:(n,f)=>n+' '+(n===1?f[0]:(n%10>=2&&n%10<=4&&(n%100<12||n%100>14))?f[1]:f[2]),sights:['atrakcja','atrakcje','atrakcji'],towns:['miejscowość','miejscowości','miejscowości']},
en:{provinces:'Provinces',province:'Province',guide:'Regional guide',partial:'Partly available',planned:'Coming soon',exploreRegion:'Explore the region',explore:'Explore',soon:'Coming soon',plannedText:'A guide to this province is being prepared.',town:'Town',cityGuide:'full city guide',
 count:(n,f)=>n+' '+(n===1?f[0]:f[1]),sights:['sight','sights'],towns:['town','towns']}
};
const I={
pl:{atlas:'Atlas Polski',subtitle:'13 miast · 16 województw',headline:'Odkrywaj\npo swojemu.',lead:'Wybierz miasto albo województwo i odkrywaj niezwykłe miejsca.',styleAtlas:'Atlas',styleNight:'Noc',styleTerrain:'Teren',choose:'Wybierz miasto',pilot:'Przewodnik dostępny',planned:'W przygotowaniu',explore:'Odkryj Warszawę',unavailable:'Wkrótce',pilotMessage:'184 atrakcje • 18 dzielnic • 36 lokali',plannedMessage:'Ten przewodnik jest w przygotowaniu. Warszawę możesz zwiedzać już teraz.',search:'Szukaj miasta...',zero:'Nie znaleziono miasta',tooltip:'Wróć do mapy Polski',reset:'Pokaż całą Polskę',full:'Pełny ekran',entry:'Mapa Polski',land:'Polska',footer:'Kontur: Natural Earth (public domain)'},
en:{atlas:'Poland Atlas',subtitle:'13 cities · 16 provinces',headline:'Explore your\nown way.',lead:'Pick a city or a province and discover memorable places.',styleAtlas:'Atlas',styleNight:'Night',styleTerrain:'Terrain',choose:'Choose a city',pilot:'Guide available',planned:'Coming soon',explore:'Explore Warsaw',unavailable:'Coming soon',pilotMessage:'184 sights • 18 districts • 36 places to eat',plannedMessage:'This city guide is being prepared. You can explore Warsaw today.',search:'Search cities...',zero:'No matching city',tooltip:'Back to Poland map',reset:'Show all of Poland',full:'Full screen',entry:'Map of Poland',land:'Poland',footer:'Outline: Natural Earth (public domain)'}
};
let lang=localStorage.getItem('tubylem_lang')==='en'?'en':'pl';
let style=['atlas','night','terrain'].includes(localStorage.getItem('tubylem_map_style'))?localStorage.getItem('tubylem_map_style'):'atlas';
// Główna mapa w nowej instalacji: wybrany jasny atlas ilustracyjny.
const qs=new URLSearchParams(location.search);if(qs.get('lang')==='en'||qs.get('lang')==='pl')lang=qs.get('lang');
let current=CITIES[0],zoom=1,tx=0,ty=0,drag=null,moved=false;
// mode: 'city' (13 miast), 'region' (województwo) lub 'town' (miejscowość z atrakcjami w województwie)
let mode='city',region=null,town=null;
const MAXZ=5;
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
// Warstwa województw: przezroczyste pola do dotknięcia, przyciemnienie reszty kraju i obrys wybranego.
const regionLayer=el('g',{id:'provinces'});g.appendChild(regionLayer);
const focusLayer=el('g',{id:'provinceFocus'});g.appendChild(focusLayer);
const geoOf=r=>GEO.regions.find(x=>x.name===r.geo);
REG.regions.forEach(r=>{const geo=geoOf(r);if(geo)regionLayer.appendChild(el('path',{class:'region-hit','data-region':r.id,d:path(geo.coords)}))});
const labels=[['POMORZE',17.8,54.13],['MAZURY',21.3,53.65],['WIELKOPOLSKA',16.45,52.05],['MAZOWSZE',21.35,52.85],['MAŁOPOLSKA',20.95,49.86]];
const labelLayer=el('g',{id:'regions'});g.appendChild(labelLayer);
const dots=el('g',{id:'cities'});g.appendChild(dots);
const townLayer=el('g',{id:'towns'});g.appendChild(townLayer);
function cityText(c){return lang==='en'?c.en:c.pl}
function pointCity(city){
 const p=project(city.lon,city.lat),b=el('g',{class:'city-dot'+(!city.ready?' upcoming':'')+(current.id===city.id?' selected':''),tabindex:'0',role:'button','aria-label':cityText(city),'data-city':city.id,'data-x':p.x.toFixed(1),'data-y':p.y.toFixed(1),transform:'translate('+p.x.toFixed(1)+' '+p.y.toFixed(1)+')'});
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
 if(mode!=='city'&&region){dots.querySelectorAll('.city-dot').forEach(d=>d.classList.toggle('outside',!region.cities.includes(d.dataset.city)));requestAnimationFrame(setTransform)}
 labelLayer.textContent='';labels.forEach(([t,lon,lat])=>{const p=project(lon,lat);const txt=lang==='en'?({'POMORZE':'POMERANIA','MAZURY':'MASURIA','WIELKOPOLSKA':'GREATER POLAND','MAZOWSZE':'MASOVIA','MAŁOPOLSKA':'LESSER POLAND'}[t]):t;labelLayer.appendChild(el('text',{class:'map-regional',x:p.x,y:p.y},txt))});
}
function setTransform(){g.setAttribute('transform','translate('+tx+' '+ty+') scale('+zoom+')');
 // W widoku województwa pinezki mają stały rozmiar na ekranie (px), niezależnie od powiększenia i szerokości telefonu.
 if(mode==='city'&&!townLayer.firstChild){dots.querySelectorAll('.city-dot').forEach(d=>d.setAttribute('transform','translate('+d.dataset.x+' '+d.dataset.y+')'));return}
 const r=svg.getBoundingClientRect(),u=Math.min(r.width/900,r.height/680)||1,k=(1/(zoom*u)).toFixed(4);
 townLayer.querySelectorAll('.town-pin').forEach(p=>p.setAttribute('transform','translate('+p.dataset.x+' '+p.dataset.y+') scale('+k+')'));
 layoutTownLabels(u);
 dots.querySelectorAll('.city-dot').forEach(d=>d.setAttribute('transform','translate('+d.dataset.x+' '+d.dataset.y+') scale('+(mode==='city'?1:k*.62)+')'));
}
// Powiększenie wokół punktu (domyślnie środek viewBox 900×680).
function zoomTo(v,cx=450,cy=340){const old=zoom;zoom=Math.min(MAXZ,Math.max(.83,v));tx=cx-(cx-tx)*zoom/old;ty=cy-(cy-ty)*zoom/old;setTransform()}
function svgPoint(x,y){const m=svg.getScreenCTM();if(!m)return{x:450,y:340};const p=svg.createSVGPoint();p.x=x;p.y=y;const q=p.matrixTransform(m.inverse());return{x:q.x,y:q.y}}
function reset(){zoom=1;tx=0;ty=0;setTransform()}
// Płynne przejście widoku (np. do województwa); bez animacji przy prefers-reduced-motion.
function animateTo(z,x,y){
 const from={z:zoom,x:tx,y:ty},t0=performance.now(),D=matchMedia('(prefers-reduced-motion: reduce)').matches?0:420;
 const step=now=>{const k=D?1:Math.min(1,(now-t0)/D),e=1-Math.pow(1-k,3);zoom=from.z+(z-from.z)*e;tx=from.x+(x-from.x)*e;ty=from.y+(y-from.y)*e;setTransform();if(k<1)requestAnimationFrame(step)};
 requestAnimationFrame(step);
}
// Widoczny fragment mapy (pod nagłówkiem, nad dolnym panelem) w jednostkach viewBox.
function viewWindow(){
 const top=$('.atlas-top').getBoundingClientRect().bottom,bottom=$('.atlas-bottom').getBoundingClientRect().top,r=svg.getBoundingClientRect();
 const a=svgPoint(r.left+12,Math.max(r.top,top)+8),b=svgPoint(r.right-60,Math.min(r.bottom,bottom)-8);
 return{x0:Math.max(0,a.x),y0:Math.max(0,a.y),x1:Math.min(900,b.x),y1:Math.min(680,b.y)};
}
function focusRegionView(r){
 const geo=geoOf(r);if(!geo)return;
 const pts=geo.coords.map(p=>project(p[0],p[1])),xs=pts.map(p=>p.x),ys=pts.map(p=>p.y);
 const bx0=Math.min(...xs),bx1=Math.max(...xs),by0=Math.min(...ys),by1=Math.max(...ys),w=viewWindow();
 const vw=Math.max(80,w.x1-w.x0),vh=Math.max(80,w.y1-w.y0);
 const z=Math.min(MAXZ,Math.max(1,.9*Math.min(vw/(bx1-bx0),vh/(by1-by0))));
 animateTo(z,(w.x0+w.x1)/2-z*(bx0+bx1)/2,(w.y0+w.y1)/2-z*(by0+by1)/2);
}
const regionName=r=>lang==='en'?r.en:r.pl;
const placesOf=id=>REG.places.filter(p=>p.region===id);
function townsOf(id){
 const map=new Map();placesOf(id).forEach(p=>{const t=map.get(p.town)||{name:p.town,places:[]};t.places.push(p);map.set(p.town,t)});
 return [...map.values()].map(t=>({...t,lat:t.places.reduce((a,p)=>a+p.lat,0)/t.places.length,lon:t.places.reduce((a,p)=>a+p.lon,0)/t.places.length}))
  .sort((a,b)=>b.places.length-a.places.length||a.name.localeCompare(b.name,'pl'));
}
function renderFocus(){
 focusLayer.textContent='';townLayer.textContent='';
 document.body.dataset.focus=mode==='city'?'':'region';
 dots.querySelectorAll('.city-dot').forEach(d=>d.classList.toggle('outside',mode!=='city'&&!!region&&!region.cities.includes(d.dataset.city)));
 regionLayer.querySelectorAll('.region-hit').forEach(p=>p.classList.toggle('active',!!region&&mode!=='city'&&p.dataset.region===region.id));
 if(!region||mode==='city')return;
 const geo=geoOf(region);if(!geo)return;
 focusLayer.appendChild(el('path',{class:'region-dim',d:path(BORDER)+' '+path(geo.coords),'fill-rule':'evenodd'}));
 focusLayer.appendChild(el('path',{class:'region-glow',d:path(geo.coords)}));
 focusLayer.appendChild(el('path',{class:'region-outline',d:path(geo.coords)}));
 const midLon=geo.coords.reduce((a,c)=>a+c[0],0)/geo.coords.length;
 const ordered=townsOf(region.id).sort((a,b)=>(b.name===town)-(a.name===town));
 ordered.forEach(t=>{
  const p=project(t.lon,t.lat),left=t.lon>midLon+.45;
  const pin=el('g',{class:'town-pin'+(town===t.name?' selected':''),tabindex:'0',role:'button','data-town':t.name,'data-x':p.x.toFixed(1),'data-y':p.y.toFixed(1),'aria-label':t.name+', '+IR[lang].count(t.places.length,IR[lang].sights)});
  pin.appendChild(el('circle',{class:'town-hit',r:21}));
  pin.appendChild(el('circle',{class:'town-ring',r:8.5}));
  pin.appendChild(el('text',{class:'town-count',y:3.8,'text-anchor':'middle'},String(t.places.length)));
  pin.appendChild(el('text',{class:'town-label',x:left?-13:13,y:4.5,'text-anchor':left?'end':'start'},t.name));
  pin.addEventListener('click',ev=>{ev.stopPropagation();if(!moved)selectTown(t.name)});
  pin.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();selectTown(t.name)}});
  // Ważniejsze miejscowości rysowane na końcu, czyli na wierzchu.
  townLayer.insertBefore(pin,townLayer.firstChild);
 });
 setTransform();
}
// Podpisy miejscowości bez nakładania: pierwszeństwo mają wybrana i te z większą liczbą atrakcji.
function layoutTownLabels(u){
 const boxes=[];
 [...townLayer.querySelectorAll('.town-pin')].reverse().forEach(pin=>{
  const label=pin.querySelector('.town-label');if(!label)return;
  const sx=(+pin.dataset.x*zoom+tx)*u,sy=(+pin.dataset.y*zoom+ty)*u,w=label.textContent.length*7.4+6,left=label.getAttribute('text-anchor')==='end';
  const box={x0:left?sx-13-w:sx-10,x1:left?sx+10:sx+13+w,y0:sy-11,y1:sy+11};
  const hit=boxes.some(b=>box.x0<b.x1&&box.x1>b.x0&&box.y0<b.y1&&box.y1>b.y0);
  const show=pin.classList.contains('selected')||!hit;
  label.style.display=show?'':'none';if(show)boxes.push(box);
 });
}
function selectRegion(id,{fly=true}={}){
 const r=REG.regions.find(x=>x.id===id);if(!r)return;
 region=r;town=null;mode='region';
 renderFocus();renderCard();renderRegionStrip();renderStrip();
 if(fly)focusRegionView(r);
}
function selectTown(name){
 if(!region)return;town=name;mode='town';
 const refocus=document.activeElement?.closest?.('.town-pin');
 renderFocus();renderCard();
 if(refocus)townLayer.querySelector('[data-town="'+CSS.escape(name)+'"]')?.focus({preventScroll:true});
}
function clearRegion(){mode='city';region=null;town=null;renderFocus();renderCard();renderRegionStrip();renderStrip()}
function renderRegionStrip(){
 const strip=$('#regionStrip');if(!strip)return;
 const list=[...REG.regions].sort((a,b)=>regionName(a).localeCompare(regionName(b),lang));
 strip.innerHTML='<span class="strip-label">'+esc(IR[lang].provinces)+'</span>'+list.map(r=>'<button type="button" class="city-chip region-chip '+(region&&mode!=='city'&&region.id===r.id?'active':'')+'" data-region-chip="'+r.id+'" aria-pressed="'+(region&&mode!=='city'&&region.id===r.id)+'"><span>'+esc(regionName(r))+'</span><span class="city-state">'+(r.status==='guide'?'✦':r.status==='partial'?'◐':'·')+'</span></button>').join('');
 const active=strip.querySelector('.active');if(active&&strip.dataset.initialized)active.scrollIntoView({block:'nearest',inline:'nearest'});strip.dataset.initialized='1';
}
const regionUrl=extra=>'./region.html?region='+encodeURIComponent(region.id)+'&lang='+encodeURIComponent(lang)+(extra||'');
// Karta województwa / miejscowości w dolnym panelu.
function renderRegionCard(){
 const t=IR[lang],places=placesOf(region.id),towns=townsOf(region.id),box=$('#cardTowns');
 const cities=CITIES.filter(c=>region.cities.includes(c.id));
 if(mode==='town'){
  const tw=towns.find(x=>x.name===town);
  $('#cityName').textContent=town;
  $('#cityDescription').textContent=t.count(tw.places.length,t.sights)+' · '+regionName(region)+' · '+tw.places.slice(0,3).map(p=>p.name[lang]).join(', ')+(tw.places.length>3?'…':'');
  $('#cityStatus').textContent=t.town;
  $('#cityAction').textContent=t.explore+' '+town;$('#cityAction').disabled=false;
 }else{
  $('#cityName').textContent=regionName(region);
  $('#cityStatus').textContent=region.status==='guide'?t.guide:region.status==='partial'?t.partial:t.planned;
  $('#cityDescription').textContent=places.length?t.count(places.length,t.sights)+' · '+t.count(towns.length,t.towns)+(cities.some(c=>c.ready)?' · '+cities.filter(c=>c.ready).map(cityText).join(', ')+' — '+t.cityGuide:''):t.plannedText;
  $('#cityAction').textContent=places.length?t.exploreRegion:t.soon;$('#cityAction').disabled=!places.length;
 }
 box.hidden=false;
 box.innerHTML=cities.map(c=>'<button type="button" class="town-chip city" data-card-city="'+c.id+'">'+esc(cityText(c))+(c.ready?' ✦':'')+'</button>').join('')+
  towns.map(x=>'<button type="button" class="town-chip'+(x.name===town?' active':'')+'" data-card-town="'+esc(x.name)+'">'+esc(x.name)+' <small>'+x.places.length+'</small></button>').join('');
 if(!box.innerHTML)box.hidden=true;
}
function select(id){
 const hit=CITIES.find(c=>c.id===id);if(!hit)return;current=hit;
 if(mode!=='city'){mode='city';region=null;town=null;renderFocus();renderRegionStrip()}
 const refocus=document.activeElement?.closest?.('.city-dot');
 renderMarkers();renderCard();renderStrip();
 // Przebudowa pinezek usuwa element z fokusem — przywróć go dla klawiatury i VoiceOver.
 if(refocus)dots.querySelector('[data-city="'+id+'"]')?.focus({preventScroll:true});
}
function renderStrip(){
 const strip=$('#cityStrip');strip.innerHTML=CITIES.map(c=>'<button type="button" class="city-chip '+(mode==='city'&&current.id===c.id?'active':'')+'" data-city-chip="'+c.id+'"><span>'+esc(cityText(c))+'</span><span class="city-state">'+(c.ready?'✦':'·')+'</span></button>').join('');
 const active=strip.querySelector('.active');if(active&&strip.dataset.initialized)active.scrollIntoView({block:'nearest',inline:'nearest'});strip.dataset.initialized='1';
}
function renderCard(){
 $('#citiesTitle').textContent=mode==='city'?I[lang].choose:IR[lang].province;
 if(mode!=='city'&&region){renderRegionCard();return}
 $('#cardTowns').hidden=true;$('#cardTowns').textContent='';
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
 $('#polandSvg').setAttribute('aria-label',lang==='en'?'Interactive map of Poland with 13 cities and 16 provinces':'Interaktywna mapa Polski z 13 miastami i 16 województwami');
 $('#regionStrip').setAttribute('aria-label',IR[lang].provinces);
 $('#zoomIn').setAttribute('aria-label',lang==='en'?'Zoom in':'Powiększ mapę');
 $('#zoomOut').setAttribute('aria-label',lang==='en'?'Zoom out':'Pomniejsz mapę');
 $('#langButton').setAttribute('aria-label',lang==='en'?'Language: English. Switch to Polish':'Język: polski. Przełącz na angielski');
 $('.brand').setAttribute('aria-label',lang==='en'?'Back to Poland Atlas':'I Was Here — Atlas Polski');
 $('.style-panel').setAttribute('aria-label',lang==='en'?'Map style':'Styl mapy');
 $('.atlas-bottom').setAttribute('aria-label',lang==='en'?'Choose a city or province':'Wybór miasta lub województwa');
 document.title='I Was Here — '+(lang==='en'?'Poland Atlas':'Atlas Polski');
 for(const mode of ['atlas','night','terrain']){$('#style'+mode[0].toUpperCase()+mode.slice(1)).classList.toggle('active',style===mode)}
 localStorage.setItem('tubylem_lang',lang);
 localStorage.setItem('tubylem_map_style',style);
 renderMarkers();renderStrip();renderRegionStrip();renderFocus();renderCard();
}
function openCity(){
 if(mode==='town'&&region){location.href=regionUrl('&town='+encodeURIComponent(town));return}
 if(mode==='region'&&region){if(placesOf(region.id).length)location.href=regionUrl();return}
 if(!current.ready)return;location.href='./index.html?lang='+encodeURIComponent(lang)+'&from=atlas'}
$('#cityAction').onclick=openCity;
$('#regionStrip').onclick=e=>{const b=e.target.closest('[data-region-chip]');if(!b)return;if(mode!=='city'&&region&&region.id===b.dataset.regionChip&&!town){clearRegion();reset();return}selectRegion(b.dataset.regionChip)};
$('#cardTowns').onclick=e=>{const c=e.target.closest('[data-card-city]'),t=e.target.closest('[data-card-town]');if(c)select(c.dataset.cardCity);else if(t)selectTown(t.dataset.cardTown)};
$('#cityStrip').onclick=e=>{const b=e.target.closest('[data-city-chip]');if(b)select(b.dataset.cityChip)};
$('#langButton').onclick=e=>{const pick=e.target.closest('[data-lang]')?.dataset.lang;const next=pick||(lang==='pl'?'en':'pl');if(next===lang&&pick)return;lang=next;localize()};
for(const mode of ['atlas','night','terrain'])$('#style'+mode[0].toUpperCase()+mode.slice(1)).onclick=()=>{style=mode;localize()};
$('#zoomIn').onclick=()=>zoomTo(zoom*1.3);$('#zoomOut').onclick=()=>zoomTo(zoom/1.3);$('#resetView').onclick=()=>{if(mode!=='city')clearRegion();reset()};
$('#searchButton').onclick=()=>{const sb=$('#searchBox');sb.classList.toggle('open');if(sb.classList.contains('open'))$('#searchInput').focus()};
$('#searchClose').onclick=()=>{$('#searchBox').classList.remove('open');$('#searchInput').value='';document.querySelectorAll('.city-chip').forEach(x=>x.hidden=false)};
$('#searchInput').oninput=e=>{
 const term=e.target.value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 document.querySelectorAll('[data-city-chip]').forEach(b=>{const c=CITIES.find(x=>x.id===b.dataset.cityChip);b.hidden=!c||!norm([c.pl,c.en].join(' ')).includes(term)});
 // Województwo pasuje także po nazwie miejscowości z atrakcjami (np. „Sandomierz” → Świętokrzyskie).
 document.querySelectorAll('[data-region-chip]').forEach(b=>{const r=REG.regions.find(x=>x.id===b.dataset.regionChip);b.hidden=!r||!norm([r.pl,r.en,...placesOf(r.id).map(p=>p.town)].join(' ')).includes(term)});
};
$('#fullscreen').onclick=()=>{if(document.fullscreenElement){document.exitFullscreen?.();return}if(document.documentElement.requestFullscreen){document.documentElement.requestFullscreen().catch(()=>alert(lang==='en'?'On iPhone, add this page to your Home Screen for an app-like full screen.':'Na iPhonie dodaj stronę do ekranu początkowego, aby korzystać z pełnoekranowej aplikacji.'))}else{alert(lang==='en'?'On iPhone, add this page to your Home Screen for an app-like full screen.':'Na iPhonie dodaj stronę do ekranu początkowego, aby korzystać z pełnoekranowej aplikacji.')}}
// Przesuwanie jednym palcem / myszą oraz powiększanie dwoma palcami (pinch) na iPhonie.
const touches=new Map();let pinch=null;
const gap=()=>{const [a,b]=[...touches.values()];return Math.hypot(a.x-b.x,a.y-b.y)};
const middle=()=>{const [a,b]=[...touches.values()];return svgPoint((a.x+b.x)/2,(a.y+b.y)/2)};
svg.addEventListener('pointerdown',e=>{
 touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(touches.size===2){pinch={d:gap()||1,z:zoom};drag=null;moved=true;return}
 if(e.target.closest('.city-dot,.town-pin'))return;
 drag={x:e.clientX,y:e.clientY,tx,ty};moved=false;try{svg.setPointerCapture(e.pointerId)}catch(_){}});
svg.addEventListener('pointermove',e=>{
 if(touches.has(e.pointerId))touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pinch&&touches.size===2){const c=middle();zoomTo(pinch.z*gap()/pinch.d,c.x,c.y);return}
 if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>5)moved=true;const rect=svg.getBoundingClientRect();tx=drag.tx+dx*900/rect.width;ty=drag.ty+dy*680/rect.height;setTransform()});
const release=e=>{
 // Krótkie dotknięcie województwa (bez przesuwania) wybiera je i przybliża mapę.
 if(drag&&!moved&&!pinch&&e.type==='pointerup'){const hit=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('.region-hit');if(hit&&!(region&&mode!=='city'&&region.id===hit.dataset.region))selectRegion(hit.dataset.region)}
 touches.delete(e.pointerId);if(touches.size<2)pinch=null;drag=null;setTimeout(()=>{moved=false},30)};
svg.addEventListener('pointerup',release);
svg.addEventListener('pointercancel',release);
svg.addEventListener('wheel',e=>{e.preventDefault();const c=svgPoint(e.clientX,e.clientY);zoomTo(zoom*(e.deltaY<0?1.1:.9),c.x,c.y)},{passive:false});
// Safari na iOS wysyła też własne gesty — blokujemy powiększanie całej strony nad mapą.
svg.addEventListener('gesturestart',e=>e.preventDefault());
window.addEventListener('pageshow',()=>{const val=localStorage.getItem('tubylem_lang');if(val&&val!==lang){lang=val;localize()}});
localize();reset();
// Kontrolki mapy zawsze nad dolnym panelem (jego wysokość zależy od karty i języka).
const bottomPanel=$('.atlas-bottom'),syncBottom=()=>$('#atlasApp').style.setProperty('--bottom-h',bottomPanel.offsetHeight+'px');
syncBottom();if(window.ResizeObserver)new ResizeObserver(syncBottom).observe(bottomPanel);addEventListener('resize',()=>{syncBottom();setTransform()});
// Głębokie linki: atlas.html?region=swietokrzyskie (np. powrót z przewodnika regionu).
if(qs.get('region')&&REG.regions.some(r=>r.id===qs.get('region')))requestAnimationFrame(()=>selectRegion(qs.get('region')));
// Tryb offline działa także dla osób, które otwierają tylko Atlas (start_url PWA).
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
})();
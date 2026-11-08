/* I Was Here — Atlas Polski 7.0.
 * Interaktywna mapa SVG z prawdziwą geometrią (Natural Earth 1:10m) i cieniowanym reliefem (Terrain Tiles),
 * w projekcji równoodległościowej 52°N (bez rozciągania kraju). Działa bez sieci (pamięć PWA).
 * Moduł planów (zakładki, plan podróży, plan dnia, wspomnienia, profil): assets/atlas-plans.js. */
(function(){
'use strict';
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s)),NS='http://www.w3.org/2000/svg';
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
{id:'kielce',pl:'Kielce',en:'Kielce',lat:50.8661,lon:20.6286,ready:false},
{id:'olsztyn',pl:'Olsztyn',en:'Olsztyn',lat:53.7784,lon:20.4801,ready:false}
];
// Krótkie, redakcyjne opisy miast (fakty powszechnie znane). Ilustracja miasta pełni rolę zdjęcia.
const CITY_INFO={
warsaw:['Stolica Polski: odbudowane Stare Miasto (UNESCO), Łazienki Królewskie i nowoczesne muzea.','Poland’s capital: the rebuilt Old Town (UNESCO), Royal Łazienki and modern museums.'],
krakow:['Dawna stolica królewska z Wawelem i średniowiecznym Rynkiem; Stare Miasto na liście UNESCO.','The former royal capital with Wawel Hill and a medieval Main Square; its Old Town is a UNESCO site.'],
gdansk:['Hanzeatyckie miasto nad Motławą: Długi Targ, Żuraw i Europejskie Centrum Solidarności.','A Hanseatic city on the Motława: the Long Market, the Crane and the European Solidarity Centre.'],
wroclaw:['Miasto na wyspach Odry: Ostrów Tumski, Rynek z ratuszem i Hala Stulecia (UNESCO).','A city on the islands of the Oder: Ostrów Tumski, the Market Square and the Centennial Hall (UNESCO).'],
poznan:['Stary Rynek z ratuszem i koziołkami oraz Ostrów Tumski — kolebka państwa polskiego.','The Old Market with its town hall and goats, and Ostrów Tumski — a cradle of the Polish state.'],
lodz:['Miasto włókiennicze: ulica Piotrkowska, Manufaktura i fabryczna architektura z cegły.','A textile city: Piotrkowska Street, Manufaktura and red-brick factory architecture.'],
szczecin:['Portowe miasto nad Odrą: Wały Chrobrego i Zamek Książąt Pomorskich.','A port city on the Oder: the Chrobry Embankment and the Pomeranian Dukes’ Castle.'],
torun:['Gotyckie Stare Miasto na liście UNESCO i miejsce urodzenia Mikołaja Kopernika.','A Gothic Old Town on the UNESCO list and the birthplace of Nicolaus Copernicus.'],
lublin:['Stare Miasto z Bramą Krakowską i zamek z kaplicą Świętej Trójcy pełną średniowiecznych fresków.','An Old Town with the Kraków Gate and a castle whose Holy Trinity Chapel is full of medieval frescoes.'],
bialystok:['Pałac Branickich, zwany „Wersalem Podlasia”, i brama do Puszczy Białowieskiej.','The Branicki Palace, known as the “Versailles of Podlasie”, and a gateway to Białowieża Forest.'],
katowice:['Stolica Górnego Śląska: Spodek, Strefa Kultury i robotniczy Nikiszowiec.','The capital of Upper Silesia: the Spodek arena, the Culture Zone and historic Nikiszowiec.'],
rzeszow:['Kameralny Rynek z podziemną trasą turystyczną i baza wypadowa w Bieszczady.','A compact Market Square with an underground tourist route and a base for the Bieszczady.'],
kielce:['Stolica regionu świętokrzyskiego: Pałac Biskupów Krakowskich, rezerwaty geologiczne Kadzielnia i Wietrznia oraz bliskość Gór Świętokrzyskich.','The capital of the Świętokrzyskie region: the Kraków Bishops’ Palace, the Kadzielnia and Wietrznia geological reserves and the nearby Holy Cross Mountains.'],
olsztyn:['Stolica Warmii: gotycki zamek związany z Kopernikiem i jeziora w granicach miasta.','The capital of Warmia: a Gothic castle linked to Copernicus and lakes within the city.']
};
const GEO=window.POLAND_GEO;
if(!GEO||GEO.regions.length!==16||GEO.border.length<200)throw new Error('Geografia Polski nie została załadowana');
const BORDER=GEO.border;
const REG=window.IWH_REGIONS||{regions:[],places:[]};
const plural=(n,f)=>n+' '+(n===1?f[0]:(n%10>=2&&n%10<=4&&(n%100<12||n%100>14))?f[1]:f[2]);
// Jeden słownik interfejsu Atlasu (PL/EN). Teksty planów są w atlas-plans.js.
const T={
pl:{atlas:'Atlas Polski',tagline:'Odkrywaj Polskę · Zbieraj miejsca · Twórz wspomnienia',choose:'Wybierz miasto',province:'Województwo',provinces:'Województwa',town:'Miejscowość',
 pilot:'Przewodnik dostępny',planned:'W przygotowaniu',guide:'Przewodnik regionu',partial:'Częściowo dostępny',explore:'Odkryj Warszawę',unavailable:'Przewodnik wkrótce',seeRegion:'Zobacz województwo',
 pilotMessage:'184 atrakcje • 18 dzielnic • 36 lokali',plannedText:'Przewodnik po tym województwie jest w przygotowaniu.',exploreRegion:'Zwiedzaj region',exploreTown:'Zwiedzaj',soon:'Wkrótce',cityGuide:'pełny przewodnik',
 count:n=>plural(n,['atrakcja','atrakcje','atrakcji']),towns:n=>plural(n,['miejscowość','miejscowości','miejscowości']),
 search:'Szukaj miast, województw, miejscowości…',searchLabel:'Szukaj',closeSearch:'Zamknij wyszukiwarkę',reset:'Pokaż całą Polskę',home:'Polska',zoomIn:'Powiększ mapę',zoomOut:'Pomniejsz mapę',
 layers:'Warstwy',layerBorders:'Granice województw',layerNames:'Nazwy województw',layerRelief:'Relief terenu',layerTowns:'Miejscowości i atrakcje',layerLandmarks:'Ilustracje miast',
 styleTitle:'Styl mapy',styleAtlas:'Atlas',styleLight:'Jasny',styleNight:'Noc',styleTerrain:'Teren',mapControls:'Sterowanie mapą',
 addTrip:'Podróż',addDay:'Plan dnia',addTripA:'Dodaj do planu podróży',addDayA:'Dodaj do planu dnia',visited:'Byłem tu',unvisit:'Odwiedzone',close:'Zamknij',morePlaces:n=>'i '+n+' więcej w przewodniku regionu',
 stVisited:'Odwiedzone',stPlanned:'W planie',stNone:'Nieodwiedzone',
 svg:'Interaktywna mapa Polski z 14 miastami i 16 województwami',bottom:'Wybór miasta lub województwa',brand:'I Was Here — Atlas Polski',langLabel:'Język: polski. Przełącz na angielski',
 footer:'Natural Earth · Terrain Tiles (SRTM, EU-DEM © Copernicus)',tabs:['Mapa Polski','Plan podróży','Mój plan dnia','Wspomnienia','Profil'],nav:'Menu główne',km:'km',addPlace:'Dodaj do planu dnia'},
en:{atlas:'Poland Atlas',tagline:'Explore Poland · Collect places · Create memories',choose:'Choose a city',province:'Province',provinces:'Provinces',town:'Town',
 pilot:'Guide available',planned:'Coming soon',guide:'Regional guide',partial:'Partly available',explore:'Explore Warsaw',unavailable:'Guide coming soon',seeRegion:'View the province',
 pilotMessage:'184 sights • 18 districts • 36 places to eat',plannedText:'A guide to this province is being prepared.',exploreRegion:'Explore the region',exploreTown:'Explore',soon:'Coming soon',cityGuide:'full city guide',
 count:n=>n+' '+(n===1?'sight':'sights'),towns:n=>n+' '+(n===1?'town':'towns'),
 search:'Search cities, provinces, towns…',searchLabel:'Search',closeSearch:'Close search',reset:'Show all of Poland',home:'Poland',zoomIn:'Zoom in',zoomOut:'Zoom out',
 layers:'Layers',layerBorders:'Province borders',layerNames:'Province names',layerRelief:'Terrain relief',layerTowns:'Towns and places',layerLandmarks:'Landmark illustrations',
 styleTitle:'Map style',styleAtlas:'Atlas',styleLight:'Light',styleNight:'Night',styleTerrain:'Terrain',mapControls:'Map controls',
 addTrip:'Trip',addDay:'Day plan',addTripA:'Add to a trip plan',addDayA:'Add to a day plan',visited:'I was here',unvisit:'Visited',close:'Close',morePlaces:n=>'and '+n+' more in the regional guide',
 stVisited:'Visited',stPlanned:'Planned',stNone:'Not visited',
 svg:'Interactive map of Poland with 14 cities and 16 provinces',bottom:'Choose a city or province',brand:'I Was Here — Poland Atlas',langLabel:'Language: English. Switch to Polish',
 footer:'Natural Earth · Terrain Tiles (SRTM, EU-DEM © Copernicus)',tabs:['Map of Poland','Trip plan','My day plan','Memories','Profile'],nav:'Main menu',km:'km',addPlace:'Add to day plan'}
};
const STYLES=['atlas','light','night','terrain'];
const store={get(k,f){try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?f:v}catch(e){return f}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let lang=(()=>{try{return localStorage.getItem('tubylem_lang')==='en'?'en':'pl'}catch(e){return 'pl'}})();
let style=(()=>{try{const v=localStorage.getItem('tubylem_map_style');return STYLES.includes(v)?v:'atlas'}catch(e){return 'atlas'}})();
const qs=new URLSearchParams(location.search);if(qs.get('lang')==='en'||qs.get('lang')==='pl')lang=qs.get('lang');
const layers=Object.assign({borders:true,names:true,relief:true,towns:true,landmarks:true},store.get('iwh_layers',{}));
let current=CITIES[0],zoom=1,tx=0,ty=0,drag=null,moved=false,sheetOpen=false;
// mode: 'city' (14 miast), 'region' (województwo) lub 'town' (miejscowość z atrakcjami w województwie)
let mode='city',region=null,town=null;
const MAXZ=6,MINZ=.45;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const P=GEO.projection||{lon0:12.5,x0:0,lat0:55.25,kx:69,ky:104,kmPerUnit:1.07};
const project=(lon,lat)=>({x:P.x0+(lon-P.lon0)*P.kx,y:(P.lat0-lat)*P.ky});
const path=a=>a.map((p,i)=>{const c=project(p[0],p[1]);return(i?'L':'M')+c.x.toFixed(2)+' '+c.y.toFixed(2)}).join(' ')+' Z';
const line=a=>a.map((p,i)=>{const c=project(p[0],p[1]);return(i?'L':'M')+c.x.toFixed(1)+' '+c.y.toFixed(1)}).join(' ');
const el=(name,attrs,text)=>{const o=document.createElementNS(NS,name);Object.entries(attrs||{}).forEach(([k,v])=>o.setAttribute(k,v));if(text!=null)o.textContent=text;return o};
const t=()=>T[lang];

// ---------- budowa mapy (warstwy od dołu)
const svg=$('#polandSvg'),g=el('g',{id:'world'});
svg.innerHTML='<defs><linearGradient id="landGradient" x1="0" y1="0" x2=".9" y2="1"><stop offset="0%" stop-color="#fff9d5"/><stop offset="52%" stop-color="#9acaa3"/><stop offset="100%" stop-color="#758c52"/></linearGradient>'+
 '<linearGradient id="slabEdge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9893f"/><stop offset="1" stop-color="#6b3a1c"/></linearGradient>'+
 '<radialGradient id="softLight" cx="35%" cy="25%" r="80%"><stop offset="0" stop-color="#fff6d8" stop-opacity=".22"/><stop offset=".55" stop-color="#fff6d8" stop-opacity="0"/><stop offset="1" stop-color="#061f2c" stop-opacity=".28"/></radialGradient>'+
 '<filter id="blurShadow"><feGaussianBlur stdDeviation="11"/></filter><filter id="cityGlow"><feGaussianBlur stdDeviation="13"/></filter>'+
 '<clipPath id="polandClip"><path d="'+path(BORDER)+'"/></clipPath><pattern id="mapDots" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".65" fill="#476b62" opacity=".12"/></pattern></defs>';
svg.appendChild(g);
const neighbourLayer=el('g',{id:'neighbours'});g.appendChild(neighbourLayer);
(GEO.neighbours||[]).forEach(n=>n.polys.forEach(r=>neighbourLayer.appendChild(el('path',{class:'neighbour',d:path(r)}))));
// Efekt „płyty” jak w atlasie 3D: ciemny spód i ciepła krawędź pod lądem (tanie, bez filtrów).
g.appendChild(el('path',{class:'country-shadow',d:path(BORDER),transform:'translate(5,8)'}));
g.appendChild(el('path',{class:'country-slab',d:path(BORDER),transform:'translate(0,5.5)'}));
g.appendChild(el('path',{class:'country-base',d:path(BORDER)}));
const clipped=el('g',{'clip-path':'url(#polandClip)'});g.appendChild(clipped);
clipped.appendChild(el('rect',{class:'map-dots',x:0,y:0,width:900,height:680,fill:'url(#mapDots)'}));
clipped.appendChild(el('path',{class:'atlas-wash',d:path(BORDER)}));
// Relief: raster z prawdziwych danych wysokościowych w tej samej projekcji; brak pliku = czytelna mapa 2D.
const relief=el('image',{class:'relief',href:'./assets/poland-relief.webp',x:0,y:0,width:900,height:680,preserveAspectRatio:'none'});
relief.addEventListener('error',()=>{document.body.dataset.relief='missing'});
clipped.appendChild(relief);
if(window.IWH_ATLAS_ART)window.IWH_ATLAS_ART.decorate({clipped,el,project,path,geo:GEO});
clipped.appendChild(el('rect',{class:'soft-light',x:0,y:0,width:900,height:680,fill:'url(#softLight)'}));
// Granice województw: halo + jasna linia; grubość i krycie zależą od powiększenia (zmienne CSS ustawiane w setTransform).
const provLayer=el('g',{id:'provinceLines'});g.appendChild(provLayer);
GEO.regions.forEach(r=>{provLayer.appendChild(el('path',{class:'prov-halo',d:path(r.coords)}));provLayer.appendChild(el('path',{class:'prov-line',d:path(r.coords)}))});
g.appendChild(el('path',{class:'country-border',d:path(BORDER)}));
g.appendChild(el('path',{class:'country-rim',d:path(BORDER)}));
// Pola do dotknięcia województw, przyciemnienie reszty kraju i obrys wybranego.
const regionLayer=el('g',{id:'provinces'});g.appendChild(regionLayer);
const focusLayer=el('g',{id:'provinceFocus'});g.appendChild(focusLayer);
const geoOf=r=>GEO.regions.find(x=>x.name===r.geo);
REG.regions.forEach(r=>{const geo=geoOf(r);if(geo)regionLayer.appendChild(el('path',{class:'region-hit','data-region':r.id,d:path(geo.coords)}))});
const labelLayer=el('g',{id:'regions'});g.appendChild(labelLayer);
const dots=el('g',{id:'cities'});g.appendChild(dots);
const townLayer=el('g',{id:'towns'});g.appendChild(townLayer);

const cityText=c=>lang==='en'?c.en:c.pl;
const regionName=r=>lang==='en'?r.en:r.pl;
const regionOfCity=id=>REG.regions.find(r=>r.cities.includes(id));
const placesOf=id=>REG.places.filter(p=>p.region===id);
const cityTownPlaces=c=>{const r=regionOfCity(c.id);return r?placesOf(r.id).filter(p=>p.town===c.pl):[]};
function townsOf(id){
 const map=new Map();placesOf(id).forEach(p=>{const x=map.get(p.town)||{name:p.town,region:id,places:[]};x.places.push(p);map.set(p.town,x)});
 return [...map.values()].map(x=>({...x,lat:x.places.reduce((a,p)=>a+p.lat,0)/x.places.length,lon:x.places.reduce((a,p)=>a+p.lon,0)/x.places.length}))
  .sort((a,b)=>b.places.length-a.places.length||a.name.localeCompare(b.name,'pl'));
}
const PLANS=window.IWH_PLANS;
function cityStatus(id){
 if(PLANS&&PLANS.isVisited({t:'city',id}))return 'visited';
 if(PLANS&&PLANS.isPlanned({t:'city',id}))return 'planned';
 return 'none';
}

// ---------- pinezki miast (stały rozmiar na ekranie, status odwiedzin)
function pointCity(city){
 const p=project(city.lon,city.lat),st=cityStatus(city.id);
 const b=el('g',{class:'city-dot st-'+st+(!city.ready?' upcoming':'')+(current.id===city.id&&mode==='city'&&sheetOpen?' selected':''),tabindex:'0',role:'button',
  'aria-label':cityText(city)+', '+(st==='visited'?t().stVisited:st==='planned'?t().stPlanned:t().stNone),'data-city':city.id,'data-x':p.x.toFixed(1),'data-y':p.y.toFixed(1)});
 if(window.IWH_ATLAS_ART){const art=el('g',{class:'city-landmark',transform:'translate(-37,-86)'});art.innerHTML=window.IWH_ATLAS_ART.landmark(city.id,{name:cityText(city),visited:!!(PLANS&&PLANS.isVisited({t:'city',id:city.id}))});b.appendChild(art)}
 b.appendChild(el('ellipse',{class:'pin-shadow',cx:0,cy:1,rx:7,ry:2.6}));
 b.appendChild(el('path',{class:'pin',d:'M0 0C-3-6-9-10-9-16a9 9 0 0 1 18 0c0 6-6 10-9 16Z'}));
 b.appendChild(el('circle',{class:'pin-dot',cx:0,cy:-16,r:3.6}));
 if(st!=='none')b.appendChild(el('text',{class:'pin-mark',x:0,y:-12.6,'text-anchor':'middle'},st==='visited'?'✓':'★'));
 b.appendChild(el('circle',{class:'city-hit',cx:0,cy:-12,r:22}));
 const left=city.id==='katowice'||city.id==='szczecin';
 const label=el('g',{class:'city-label-pill',transform:'translate('+(left?-12:12)+' -10)'});
 const name=cityText(city),w=Math.round(name.length*6.6+14);
 label.appendChild(el('rect',{x:left?-w:0,y:-9,width:w,height:18,rx:9}));
 label.appendChild(el('text',{class:'city-label',x:left?-w/2:w/2,y:3.9,'text-anchor':'middle'},name));
 b.appendChild(label);
 b.addEventListener('click',ev=>{ev.stopPropagation();if(!moved)select(city.id)});
 b.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();select(city.id)}});
 return b;
}
function renderMarkers(){
 dots.textContent='';CITIES.forEach(c=>dots.appendChild(pointCity(c)));
 if(mode!=='city'&&region)dots.querySelectorAll('.city-dot').forEach(d=>d.classList.toggle('outside',!region.cities.includes(d.dataset.city)));
 labelLayer.textContent='';
 REG.regions.forEach(r=>{const geo=geoOf(r);if(!geo)return;const c=project(...(geo.label||geo.coords[0]));
  const gl=el('g',{class:'region-name','data-region':r.id,'data-x':c.x.toFixed(1),'data-y':c.y.toFixed(1)});
  gl.appendChild(el('text',{'text-anchor':'middle',y:4},regionName(r).replace(/ \(.*\)$/,'')));labelLayer.appendChild(gl)});
 requestAnimationFrame(setTransform);
}
// ---------- przekształcenia i styl zależny od powiększenia
// 8.6.4 — płynna mapa: w trakcie gestu (przesuwanie, pinch, kółko, animacja) przesuwamy i skalujemy gotową warstwę
// <svg> transformacją CSS (kompozycja na GPU, bez przerysowania tysięcy ścieżek, filtrów i podpisów). Pełne
// przerysowanie (commit → setTransform) następuje raz, po zakończeniu ruchu. box = prostokąt mapy bez transformacji CSS.
let box=null,cz=1,ctx=0,cty=0,pv=0,commitT=0;
// Transformację nakładamy na kontener .atlas-map, a nie na sam <svg>: granice i rzeki mają vector-effect:non-scaling-stroke,
// więc zmiana transformacji samego <svg> wymuszałaby ich ponowne rysowanie w każdej klatce.
const wrap=svg.parentNode;
function measure(){const r=svg.getBoundingClientRect(),w=wrap.getBoundingClientRect();box={left:r.left,top:r.top,W:r.width||svg.clientWidth||900,H:r.height||svg.clientHeight||680,ax:r.left-w.left,ay:r.top-w.top};return box}
function unitPx(){const b=box||measure();return Math.min(b.W/900,b.H/680)||1}
function preview(){
 if(pv)return;pv=requestAnimationFrame(()=>{pv=0;const b=box||measure(),u=unitPx(),ox=(b.W-900*u)/2,oy=(b.H-680*u)/2,sc=zoom/cz,dx=(tx-ctx*sc)*u,dy=(ty-cty*sc)*u;
  if(Math.abs(sc-1)<1e-4&&Math.abs(dx)<.05&&Math.abs(dy)<.05){wrap.style.transform='';return}
  svg.classList.add('moving');wrap.classList.add('moving');wrap.style.transform='translate3d('+((b.ax+ox)*(1-sc)+dx).toFixed(2)+'px,'+((b.ay+oy)*(1-sc)+dy).toFixed(2)+'px,0) scale('+sc.toFixed(5)+')';
  // Bardzo duża zmiana w jednym geście: odśwież pełny rysunek od razu (inaczej obraz byłby rozmyty albo z pustymi krawędziami).
  if(sc>3||sc<.4||Math.abs(dx)>b.W*.6||Math.abs(dy)>b.H*.6)commit();
  // Gdy palce się zatrzymają, dorysuj ostry obraz także w trakcie gestu.
  else if(touches.size)commitSoon(260);});
}
function commit(){if(pv){cancelAnimationFrame(pv);pv=0}clearTimeout(commitT);setTransform()}
function commitSoon(ms){clearTimeout(commitT);commitT=setTimeout(commit,ms)}
function setTransform(){
 if(pv){cancelAnimationFrame(pv);pv=0}wrap.style.transform='';wrap.classList.remove('moving');svg.classList.remove('moving');measure();cz=zoom;ctx=tx;cty=ty;
 g.setAttribute('transform','translate('+tx.toFixed(2)+' '+ty.toFixed(2)+') scale('+zoom.toFixed(4)+')');
 const u=unitPx(),k=1/(zoom*u),z=zoom;
 // Granice: delikatne w widoku kraju, wyraźniejsze przy zbliżeniu (płynna interpolacja).
 const f=Math.min(1,Math.max(0,(z-1)/2.2));
 svg.style.setProperty('--prov-w',(.75+f*1.65).toFixed(2)+'px');
 svg.style.setProperty('--prov-o',(.5+f*.45).toFixed(2));
 svg.style.setProperty('--river-k',(.8+Math.min(1,(z-1)/3)*.9).toFixed(2));
 const nameO=Math.min(1,Math.max(0,(z-1.3)/.45));svg.style.setProperty('--names-o',nameO.toFixed(2));
 const townO=mode!=='city'?1:Math.min(1,Math.max(0,(z-2.3)/.5));svg.style.setProperty('--towns-o',townO.toFixed(2));
 townLayer.style.pointerEvents=townO>.4?'':'none';
 const ks=k.toFixed(4);
 dots.querySelectorAll('.city-dot').forEach(d=>d.setAttribute('transform','translate('+d.dataset.x+' '+d.dataset.y+') scale('+(mode==='city'?ks:(k*.85).toFixed(4))+')'));
 dots.querySelectorAll('.city-landmark').forEach(l=>l.setAttribute('transform','translate(-37,-86) scale('+Math.min(1.35,.62+.18*z).toFixed(3)+') translate(0,0)'));
 labelLayer.querySelectorAll('.region-name').forEach(l=>l.setAttribute('transform','translate('+l.dataset.x+' '+l.dataset.y+') scale('+ks+')'));
 townLayer.querySelectorAll('.town-pin').forEach(p=>p.setAttribute('transform','translate('+p.dataset.x+' '+p.dataset.y+') scale('+ks+')'));
 layoutTownLabels(u,layoutCityLabels());
 // Ilustracje miast: na telefonie dopiero po przybliżeniu (czytelność widoku całego kraju).
 svg.style.setProperty('--lm-o',(box.W>=640?1:Math.min(1,Math.max(0,(z-1.45)/.35))).toFixed(2));
 updateScale(u);
}
// Podpisy miast bez nakładania: wybrane i miasta z przewodnikiem mają pierwszeństwo. Podpis przechodzi na drugą
// stronę pinezki, gdy wychodzi poza ekran albo trafia na przyciski; jeśli nigdzie się nie mieści — chowa się.
function layoutCityLabels(){
 const m=svg.getScreenCTM();if(!m)return [];
 const sc=(x,y)=>({x:m.e+(x*zoom+tx)*m.a,y:m.f+(y*zoom+ty)*m.d});
 const W=innerWidth,top=$('.atlas-top').getBoundingClientRect().bottom-8,bottom=$('.atlas-bottom').getBoundingClientRect().top;
 const obstacles=['.map-controls','#resetView'].map(q=>$(q)).filter(Boolean).map(e=>e.getBoundingClientRect()).map(r=>({x0:r.left,x1:r.right,y0:r.top,y1:r.bottom}));
 const ds=[...dots.querySelectorAll('.city-dot')].sort((a,b)=>(b.classList.contains('selected')-a.classList.contains('selected'))||(a.classList.contains('upcoming')-b.classList.contains('upcoming')));
 const pins=ds.map(d=>{const c=sc(+d.dataset.x,+d.dataset.y);return{x0:c.x-10,x1:c.x+10,y0:c.y-27,y1:c.y+2,id:d.dataset.city}});
 const placed=[],over=(a,b)=>a.x0<b.x1&&a.x1>b.x0&&a.y0<b.y1&&a.y1>b.y0;
 ds.forEach(d=>{
  const pill=d.querySelector('.city-label-pill');if(!pill||d.classList.contains('outside')||d.classList.contains('merged'))return;
  const r=pill.querySelector('rect'),txt=pill.querySelector('text'),w=+r.getAttribute('width'),c=sc(+d.dataset.x,+d.dataset.y);
  const pref=d.dataset.side||(d.dataset.city==='katowice'||d.dataset.city==='szczecin'?'left':'right');
  const fits=side=>{const box=side==='left'?{x0:c.x-12-w,x1:c.x-12,y0:c.y-19,y1:c.y-1}:side==='top'?{x0:c.x-w/2,x1:c.x+w/2,y0:c.y-50,y1:c.y-31}:side==='bottom'?{x0:c.x-w/2,x1:c.x+w/2,y0:c.y+4,y1:c.y+22}:{x0:c.x+12,x1:c.x+12+w,y0:c.y-19,y1:c.y-1};
   const ok=box.x0>=4&&box.x1<=W-4&&box.y0>=top&&box.y1<=bottom&&!placed.some(b=>over(box,b))&&!obstacles.some(b=>over(box,b))&&!pins.some(p=>p.id!==d.dataset.city&&over(box,p));return ok?box:null};
  let side=pref,box=fits(pref);if(!box){side=pref==='left'?'right':'left';box=fits(side)}if(!box){side='bottom';box=fits('bottom')}if(!box){side='top';box=fits('top')}
  if(!box&&d.classList.contains('selected')){side=pref;box={x0:0,x1:0,y0:0,y1:0}}
  pill.style.display=box?'':'none';if(!box)return;placed.push(box);
  pill.dataset.side=side;pill.setAttribute('transform',side==='top'?'translate('+(-w/2)+' -40)':side==='bottom'?'translate('+(-w/2)+' 13)':'translate('+(side==='left'?-12:12)+' -10)');r.setAttribute('x',side==='left'?-w:0);txt.setAttribute('x',side==='left'?-w/2:w/2);
 });
 return placed.concat(pins);
}
// Podziałka z prawdziwej skali projekcji (1 jednostka ≈ kmPerUnit km).
function updateScale(u){
 const kmPerPx=(P.kmPerUnit||1.07)/(zoom*u),nice=[5,10,20,25,50,100,150,200,300];
 const km=nice.find(n=>n/kmPerPx>=56)||300;
 $('#scaleBar').style.width=Math.round(km/kmPerPx)+'px';$('#scaleText').textContent=km+' '+t().km;
}
function zoomTo(v,cx=450,cy=340,live){const old=zoom;zoom=Math.min(MAXZ,Math.max(MINZ,v));tx=cx-(cx-tx)*zoom/old;ty=cy-(cy-ty)*zoom/old;if(live)preview();else setTransform()}
function svgPoint(x,y){const b=box||measure(),u=unitPx();return{x:(x-b.left-(b.W-900*u)/2)/u,y:(y-b.top-(b.H-680*u)/2)/u}}
function reset(){zoom=1;tx=0;ty=0;setTransform()}
let anim=0;
function animateTo(z,x,y){
 const from={z:zoom,x:tx,y:ty},t0=performance.now(),D=matchMedia('(prefers-reduced-motion: reduce)').matches?0:460,id=++anim;
 const step=now=>{if(id!==anim)return;const k=D?1:Math.min(1,(now-t0)/D),e=1-Math.pow(1-k,3);zoom=from.z+(z-from.z)*e;tx=from.x+(x-from.x)*e;ty=from.y+(y-from.y)*e;if(k<1){preview();requestAnimationFrame(step)}else commit()};
 requestAnimationFrame(step);
}
// Widoczny fragment mapy (pod nagłówkiem, nad dolnym panelem) w jednostkach viewBox.
function viewWindow(){
 const top=$('.atlas-top').getBoundingClientRect().bottom,bottom=$('.atlas-bottom').getBoundingClientRect().top,b0=box||measure(),r={left:b0.left,top:b0.top,right:b0.left+b0.W,bottom:b0.top+b0.H,width:b0.W};
 const a=svgPoint(r.left+10,Math.max(r.top,top)+4),b=svgPoint(r.right-(r.width<600?10:64),Math.min(r.bottom,bottom)-30);
 return{x0:a.x,y0:a.y,x1:b.x,y1:b.y};
}
function fitBox(bx0,by0,bx1,by1,maxZ,fill){
 const w=viewWindow(),vw=Math.max(80,w.x1-w.x0),vh=Math.max(80,w.y1-w.y0);
 const z=Math.min(maxZ||MAXZ,Math.max(MINZ,(fill||.9)*Math.min(vw/(bx1-bx0),vh/(by1-by0))));
 animateTo(z,(w.x0+w.x1)/2-z*(bx0+bx1)/2,(w.y0+w.y1)/2-z*(by0+by1)/2);
}
const COUNTRY_BOX=(()=>{const pts=BORDER.map(p=>project(p[0],p[1]));return[Math.min(...pts.map(p=>p.x)),Math.min(...pts.map(p=>p.y)),Math.max(...pts.map(p=>p.x)),Math.max(...pts.map(p=>p.y))]})();
// Powrót do całej Polski: animowany, niezależnie od otwartego regionu, miasta czy zakładki.
function home(){closeSheet({keepView:true});if(PLANS)PLANS.close();fitBox(...COUNTRY_BOX,1.6,.97)}
function focusRegionView(r){
 const geo=geoOf(r);if(!geo)return;
 const pts=geo.coords.map(p=>project(p[0],p[1])),xs=pts.map(p=>p.x),ys=pts.map(p=>p.y);
 fitBox(Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys));
}
function renderFocus(){
 focusLayer.textContent='';townLayer.textContent='';
 document.body.dataset.focus=mode==='city'?'':'region';
 dots.querySelectorAll('.city-dot').forEach(d=>d.classList.toggle('outside',mode!=='city'&&!!region&&!region.cities.includes(d.dataset.city)));
 regionLayer.querySelectorAll('.region-hit').forEach(p=>p.classList.toggle('active',!!region&&mode!=='city'&&p.dataset.region===region.id));
 labelLayer.querySelectorAll('.region-name').forEach(l=>l.classList.toggle('active',!!region&&mode!=='city'&&l.dataset.region===region.id));
 if(region&&mode!=='city'){
  const geo=geoOf(region);
  if(geo){
   focusLayer.appendChild(el('path',{class:'region-dim',d:path(BORDER)+' '+path(geo.coords),'fill-rule':'evenodd'}));
   focusLayer.appendChild(el('path',{class:'region-glow',d:path(geo.coords)}));
   focusLayer.appendChild(el('path',{class:'region-outline',d:path(geo.coords)}));
  }
 }
 // Miejscowości: wybranego województwa, a przy dużym zbliżeniu — wszystkich województw z danymi.
 const cityTown=tw=>{const r=REG.regions.find(x=>x.id===tw.region);return r?CITIES.find(c=>r.cities.includes(c.id)&&c.pl===tw.name):null};
 // Miejscowość o nazwie miasta z Atlasu (np. Kraków) nie dubluje pinezki: w widoku kraju zostaje pinezka miasta,
 // a w widoku województwa — pinezka miejscowości z liczbą atrakcji.
 const inRegion=!!(region&&mode!=='city');
 const list=inRegion?townsOf(region.id):REG.regions.filter(r=>r.status!=='planned').flatMap(r=>townsOf(r.id)).filter(tw=>!cityTown(tw));
 dots.querySelectorAll('.city-dot').forEach(d=>d.classList.toggle('merged',inRegion&&townsOf(region.id).some(tw=>{const c=cityTown(tw);return c&&c.id===d.dataset.city})));
 const ordered=list.sort((a,b)=>(b.name===town)-(a.name===town)||b.places.length-a.places.length);
 ordered.forEach(tw=>{
  const reg=REG.regions.find(r=>r.id===tw.region),geo=reg&&geoOf(reg),midLon=geo?geo.coords.reduce((a,c)=>a+c[0],0)/geo.coords.length:tw.lon;
  const p=project(tw.lon,tw.lat),left=tw.lon>midLon+.45;
  const pin=el('g',{class:'town-pin'+(town===tw.name?' selected':''),tabindex:'0',role:'button','data-town':tw.name,'data-region':tw.region,'data-x':p.x.toFixed(1),'data-y':p.y.toFixed(1),'aria-label':tw.name+', '+t().count(tw.places.length)});
  pin.appendChild(el('circle',{class:'town-hit',r:21}));
  pin.appendChild(el('circle',{class:'town-ring',r:8.5}));
  pin.appendChild(el('text',{class:'town-count',y:3.6,'text-anchor':'middle'},String(tw.places.length)));
  pin.appendChild(el('text',{class:'town-label',x:left?-13:13,y:4.5,'text-anchor':left?'end':'start'},tw.name));
  pin.addEventListener('click',ev=>{ev.stopPropagation();if(!moved)selectTown(tw.name,tw.region)});
  pin.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();selectTown(tw.name,tw.region)}});
  townLayer.insertBefore(pin,townLayer.firstChild);
 });
 setTransform();
}
// Podpisy miejscowości bez nakładania: pierwszeństwo mają wybrana i te z większą liczbą atrakcji.
function layoutTownLabels(u,taken){
 // Współrzędne ekranu (jak w podpisach miast); podpisy miast mają pierwszeństwo przed miejscowościami.
 const m=svg.getScreenCTM();if(!m)return;
 const boxes=[...(taken||[])];
 [...townLayer.querySelectorAll('.town-pin')].reverse().forEach(pin=>{
  const label=pin.querySelector('.town-label');if(!label)return;
  const sx=m.e+(+pin.dataset.x*zoom+tx)*m.a,sy=m.f+(+pin.dataset.y*zoom+ty)*m.d,w=label.textContent.length*7.4+6,left=label.getAttribute('text-anchor')==='end';
  const box={x0:left?sx-13-w:sx-10,x1:left?sx+10:sx+13+w,y0:sy-11,y1:sy+11};
  const hit=boxes.some(b=>box.x0<b.x1&&box.x1>b.x0&&box.y0<b.y1&&box.y1>b.y0);
  const show=pin.classList.contains('selected')||!hit;
  label.style.display=show?'':'none';if(show)boxes.push(box);
 });
}
// ---------- wybór: miasto / województwo / miejscowość
function selectRegion(id,{fly=true}={}){
 const r=REG.regions.find(x=>x.id===id);if(!r)return;
 region=r;town=null;mode='region';openSheet();
 renderFocus();renderCard();renderRegionStrip();renderStrip();
 if(fly)requestAnimationFrame(()=>focusRegionView(r));
}
function selectTown(name,regionId){
 if(regionId&&(!region||region.id!==regionId)){region=REG.regions.find(r=>r.id===regionId);if(!region)return;renderRegionStrip()}
 if(!region)return;town=name;mode='town';openSheet();
 const refocus=document.activeElement?.closest?.('.town-pin');
 renderFocus();renderCard();renderStrip();
 if(refocus)townLayer.querySelector('[data-town="'+CSS.escape(name)+'"]')?.focus({preventScroll:true});
}
function clearRegion(){mode='city';region=null;town=null;renderFocus();renderCard();renderRegionStrip();renderStrip()}
function select(id){
 const hit=CITIES.find(c=>c.id===id);if(!hit)return;current=hit;
 if(mode!=='city'){mode='city';region=null;town=null;renderFocus();renderRegionStrip()}
 const refocus=document.activeElement?.closest?.('.city-dot');
 openSheet();renderMarkers();renderCard();renderStrip();
 if(refocus)dots.querySelector('[data-city="'+id+'"]')?.focus({preventScroll:true});
}
function openSheet(){sheetOpen=true;$('#placeSheet').hidden=false;document.body.dataset.sheet='open'}
function closeSheet({keepView}={}){
 sheetOpen=false;$('#placeSheet').hidden=true;document.body.dataset.sheet='';
 if(mode!=='city'){mode='city';region=null;town=null;renderFocus();renderRegionStrip()}
 renderMarkers();renderStrip();renderCard();
 if(!keepView){} // widok mapy zostaje; do całej Polski wraca przycisk z zarysem kraju
}
function renderRegionStrip(){
 const strip=$('#regionStrip');
 const list=[...REG.regions].sort((a,b)=>regionName(a).localeCompare(regionName(b),lang));
 strip.innerHTML='<span class="strip-label">'+esc(t().provinces)+'</span>'+list.map(r=>'<button type="button" class="city-chip region-chip '+(region&&mode!=='city'&&region.id===r.id?'active':'')+'" data-region-chip="'+r.id+'" aria-pressed="'+(!!region&&mode!=='city'&&region.id===r.id)+'"><span>'+esc(regionName(r))+'</span><span class="city-state">'+(r.status==='guide'?'✦':r.status==='partial'?'◐':'·')+'</span></button>').join('');
 const active=strip.querySelector('.active');if(active&&strip.dataset.initialized)active.scrollIntoView({block:'nearest',inline:'nearest'});strip.dataset.initialized='1';
}
function renderStrip(){
 const strip=$('#cityStrip');
 strip.innerHTML=CITIES.map(c=>{const st=cityStatus(c.id);return '<button type="button" class="city-chip st-'+st+' '+(mode==='city'&&sheetOpen&&current.id===c.id?'active':'')+'" data-city-chip="'+c.id+'"><span>'+esc(cityText(c))+'</span><span class="city-state">'+(st==='visited'?'✓':st==='planned'?'★':c.ready?'✦':'·')+'</span></button>'}).join('');
 const active=strip.querySelector('.active');if(active&&strip.dataset.initialized)active.scrollIntoView({block:'nearest',inline:'nearest'});strip.dataset.initialized='1';
}
const regionUrl=extra=>'./region.html?region='+encodeURIComponent(region.id)+'&lang='+encodeURIComponent(lang)+(extra||'');
function currentItem(){
 if(mode==='town'&&region)return{t:'town',region:region.id,name:town};
 if(mode==='region'&&region)return{t:'region',id:region.id};
 return{t:'city',id:current.id};
}
function badge(item){
 const v=PLANS&&PLANS.isVisited(item),p=PLANS&&PLANS.isPlanned(item),b=$('#sheetBadge');
 b.className='status-badge '+(v?'st-visited':p?'st-planned':'st-none');b.textContent=v?t().stVisited:p?t().stPlanned:t().stNone;
 const tv=$('#toggleVisited');tv.setAttribute('aria-pressed',String(!!v));$('#visitedLabel').textContent=v?t().unvisit:t().visited;tv.setAttribute('aria-label',v?t().unvisit:t().visited);
}
function renderPlaces(list,max){
 const ul=$('#sheetPlaces');
 if(!list||!list.length){ul.hidden=true;ul.textContent='';return}
 ul.hidden=false;max=max||8;
 ul.innerHTML=list.slice(0,max).map(p=>'<li><a href="'+regionUrlFor(p)+'"><span aria-hidden="true">'+p.icon+'</span><span><b>'+esc(p.name[lang])+'</b><small>'+esc(p.town)+' · ✦ '+p.visitValue+'/5</small></span></a><button type="button" class="mini-add" data-add-place="'+p.id+'" aria-label="'+esc(t().addPlace+': '+p.name[lang])+'">＋</button></li>').join('')+(list.length>max?'<li class="more">'+esc(t().morePlaces(list.length-max))+'</li>':'');
}
const regionUrlFor=p=>'./region.html?region='+encodeURIComponent(p.region)+'&lang='+lang+'&town='+encodeURIComponent(p.town)+'&place='+encodeURIComponent(p.id);
function renderCard(){
 const x=t();
 $('#citiesTitle').textContent=mode==='city'?x.choose:x.province;
 const box=$('#cardTowns'),thumb=$('#sheetThumb');
 if(mode!=='city'&&region){
  const places=placesOf(region.id),towns=townsOf(region.id),cities=CITIES.filter(c=>region.cities.includes(c.id));
  thumb.innerHTML='<img src="./assets/poland-mark.svg" alt="" width="46" height="44">';
  if(mode==='town'){
   const tw=towns.find(q=>q.name===town);
   $('#cityName').textContent=town;
   $('#cityDescription').textContent=x.count(tw.places.length)+' · '+regionName(region);
   $('#cityStatus').textContent=x.town;
   $('#cityAction').textContent=x.exploreTown+' '+town;$('#cityAction').disabled=false;
   renderPlaces(tw.places);
  }else{
   $('#cityName').textContent=regionName(region);
   $('#cityStatus').textContent=region.status==='guide'?x.guide:region.status==='partial'?x.partial:x.planned;
   $('#cityDescription').textContent=places.length?x.count(places.length)+' · '+x.towns(towns.length)+(cities.some(c=>c.ready)?' · '+cities.filter(c=>c.ready).map(cityText).join(', ')+' — '+x.cityGuide:''):x.plannedText;
   $('#cityAction').textContent=places.length?x.exploreRegion:x.soon;$('#cityAction').disabled=!places.length;
   renderPlaces([...places].sort((a,b)=>b.visitValue-a.visitValue),3);
  }
  box.hidden=false;
  box.innerHTML=cities.filter(c=>!towns.some(q=>q.name===c.pl)).map(c=>'<button type="button" class="town-chip city" data-card-city="'+c.id+'">'+esc(cityText(c))+(c.ready?' ✦':'')+'</button>').join('')+
   towns.map(q=>'<button type="button" class="town-chip'+(q.name===town?' active':'')+'" data-card-town="'+esc(q.name)+'">'+esc(q.name)+' <small>'+q.places.length+'</small></button>').join('');
  if(!box.innerHTML)box.hidden=true;
  badge(currentItem());return;
 }
 box.hidden=true;box.textContent='';renderPlaces(null);
 thumb.innerHTML=window.IWH_ATLAS_ART?'<svg viewBox="0 -6 80 62" aria-hidden="true">'+window.IWH_ATLAS_ART.landmark(current.id,{name:cityText(current),visited:!!(PLANS&&PLANS.isVisited({t:'city',id:current.id}))})+'</svg>':'';
 $('#cityName').textContent=cityText(current);
 const info=CITY_INFO[current.id];
 $('#cityDescription').textContent=(info?info[lang==='en'?1:0]:'')+(current.ready?' '+x.pilotMessage+'.':'');
 const reg=regionOfCity(current.id);
 if(current.ready){$('#cityAction').textContent=x.explore;$('#cityAction').disabled=false}
 else if(cityTownPlaces(current).length){$('#cityAction').textContent=x.exploreTown+' '+cityText(current);$('#cityAction').disabled=false;$('#cityStatus').textContent=x.guide}
 else if(reg&&reg.status!=='planned'){$('#cityAction').textContent=x.seeRegion;$('#cityAction').disabled=false}
 else{$('#cityAction').textContent=x.unavailable;$('#cityAction').disabled=true}
 if(!cityTownPlaces(current).length)$('#cityStatus').textContent=current.ready?x.pilot:x.planned;
 badge(currentItem());
}
function applyLayers(){
 Object.entries(layers).forEach(([k,v])=>{document.body.classList.toggle('no-'+k,!v);const i=$('[data-layer="'+k+'"]');if(i)i.checked=!!v});
 store.set('iwh_layers',layers);
}
function localize(){
 const x=t();
 document.documentElement.lang=lang;document.body.dataset.style=style;
 const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
 set('atlasTagline',x.tagline);set('atlasFooter',x.footer);set('layersTitle',x.layers);set('layerBorders',x.layerBorders);set('layerNames',x.layerNames);set('layerRelief',x.layerRelief);
 set('layerTowns',x.layerTowns);set('layerLandmarks',x.layerLandmarks);set('styleTitle',x.styleTitle);set('styleAtlas',x.styleAtlas);set('styleLight',x.styleLight);set('styleNight',x.styleNight);set('styleTerrain',x.styleTerrain);
 set('addTripLabel',x.addTrip);set('addDayLabel',x.addDay);$('#addTrip').setAttribute('aria-label',x.addTripA);$('#addDay').setAttribute('aria-label',x.addDayA);
 $('#langButton').querySelectorAll('[data-lang]').forEach(s=>s.classList.toggle('on',s.dataset.lang===lang));
 $('#langButton').setAttribute('aria-label',x.langLabel);
 $('#searchInput').placeholder=x.search;$('#searchInput').setAttribute('aria-label',x.searchLabel);
 $('#searchButton').setAttribute('aria-label',x.search);$('#searchClose').setAttribute('aria-label',x.closeSearch);
 {const f=$('#atlasFloat');if(f){f.title=x.reset;f.setAttribute('aria-label',x.reset);f.href='./atlas.html?lang='+lang}}
 $('#zoomIn').setAttribute('aria-label',x.zoomIn);$('#zoomOut').setAttribute('aria-label',x.zoomOut);
 $('#layersButton').setAttribute('aria-label',x.layers);$('.map-controls').setAttribute('aria-label',x.mapControls);
 $('#sheetClose').setAttribute('aria-label',x.close);
 $('#polandSvg').setAttribute('aria-label',x.svg);$('#regionStrip').setAttribute('aria-label',x.provinces);
 $('.brand').setAttribute('aria-label',x.brand);$('.atlas-bottom').setAttribute('aria-label',x.bottom);$('.tabbar').setAttribute('aria-label',x.nav);
 document.title='I Was Here — '+x.atlas;
 STYLES.forEach(m=>{const b=$('#style'+m[0].toUpperCase()+m.slice(1));b.classList.toggle('active',style===m);b.setAttribute('aria-pressed',String(style===m))});
 try{localStorage.setItem('tubylem_lang',lang);localStorage.setItem('tubylem_map_style',style)}catch(e){}
 renderMarkers();renderStrip();renderRegionStrip();renderFocus();renderCard();
 if(PLANS)PLANS.refresh();
}
// ---------- zdarzenia interfejsu
function openCity(){
 if(mode==='town'&&region){location.href=regionUrl('&town='+encodeURIComponent(town));return}
 if(mode==='region'&&region){if(placesOf(region.id).length)location.href=regionUrl();return}
 if(current.ready){location.href='./index.html?lang='+encodeURIComponent(lang)+'&from=atlas';return}
 const reg=regionOfCity(current.id),own=cityTownPlaces(current);
 // Miasto z atrakcjami w przewodniku regionu (np. Kraków → Małopolskie) otwiera przewodnik od razu dla tego miasta.
 if(reg&&own.length){location.href='./region.html?region='+encodeURIComponent(reg.id)+'&lang='+encodeURIComponent(lang)+'&town='+encodeURIComponent(current.pl);return}
 if(reg&&reg.status!=='planned')selectRegion(reg.id);
}
$('#cityAction').onclick=openCity;
$('#sheetClose').onclick=()=>closeSheet();
$('#addTrip').onclick=()=>PLANS&&PLANS.pick('trip',currentItem());
$('#addDay').onclick=()=>PLANS&&PLANS.pick('day',currentItem());
$('#toggleVisited').onclick=()=>{if(PLANS){PLANS.toggleVisited(currentItem())}};
$('#sheetPlaces').onclick=e=>{const b=e.target.closest('[data-add-place]');if(b&&PLANS){e.preventDefault();PLANS.pick('day',{t:'place',id:b.dataset.addPlace})}};
$('#regionStrip').onclick=e=>{const b=e.target.closest('[data-region-chip]');if(!b)return;if(mode!=='city'&&region&&region.id===b.dataset.regionChip&&!town){closeSheet();home();return}selectRegion(b.dataset.regionChip)};
$('#cardTowns').onclick=e=>{const c=e.target.closest('[data-card-city]'),tw=e.target.closest('[data-card-town]');if(c)select(c.dataset.cardCity);else if(tw)selectTown(tw.dataset.cardTown)};
$('#cityStrip').onclick=e=>{const b=e.target.closest('[data-city-chip]');if(b)select(b.dataset.cityChip)};
$('#langButton').onclick=e=>{const pick=e.target.closest('[data-lang]')?.dataset.lang;const next=pick||(lang==='pl'?'en':'pl');if(next===lang&&pick)return;lang=next;localize()};
STYLES.forEach(m=>$('#style'+m[0].toUpperCase()+m.slice(1)).onclick=()=>{style=m;localize()});
$('#zoomIn').onclick=()=>zoomTo(zoom*1.3);$('#zoomOut').onclick=()=>zoomTo(zoom/1.3);
$('#layersButton').onclick=()=>{const p=$('#layersPanel'),open=p.hidden;p.hidden=!open;$('#layersButton').setAttribute('aria-expanded',String(open))};
$('#layersPanel').onchange=e=>{const i=e.target.closest('[data-layer]');if(!i)return;layers[i.dataset.layer]=i.checked;applyLayers()};
document.addEventListener('click',e=>{const p=$('#layersPanel');if(!p.hidden&&!e.target.closest('#layersPanel,#layersButton')){p.hidden=true;$('#layersButton').setAttribute('aria-expanded','false')}});
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(!$('#layersPanel').hidden){$('#layersPanel').hidden=true;$('#layersButton').focus();return}if(sheetOpen)closeSheet()});
$('#searchButton').onclick=()=>{const sb=$('#searchBox');sb.classList.toggle('open');$('#searchButton').setAttribute('aria-expanded',String(sb.classList.contains('open')));if(sb.classList.contains('open'))$('#searchInput').focus()};
$('#searchClose').onclick=()=>{$('#searchBox').classList.remove('open');$('#searchButton').setAttribute('aria-expanded','false');$('#searchInput').value='';$$('.city-chip').forEach(x=>x.hidden=false)};
$('#searchInput').oninput=e=>{
 const norm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase(),term=norm(e.target.value);
 $$('[data-city-chip]').forEach(b=>{const c=CITIES.find(x=>x.id===b.dataset.cityChip);b.hidden=!c||!norm([c.pl,c.en].join(' ')).includes(term)});
 // Województwo pasuje także po nazwie miejscowości z atrakcjami (np. „Sandomierz” → Świętokrzyskie).
 $$('[data-region-chip]').forEach(b=>{const r=REG.regions.find(x=>x.id===b.dataset.regionChip);b.hidden=!r||!norm([r.pl,r.en,...placesOf(r.id).map(p=>p.town)].join(' ')).includes(term)});
};
// Przesuwanie jednym palcem / myszą oraz powiększanie dwoma palcami (pinch) na iPhonie.
const touches=new Map();let pinch=null;
const gap=()=>{const [a,b]=[...touches.values()];return Math.hypot(a.x-b.x,a.y-b.y)};
const middle=()=>{const [a,b]=[...touches.values()];return svgPoint((a.x+b.x)/2,(a.y+b.y)/2)};
svg.addEventListener('pointerdown',e=>{
 anim++;touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(touches.size===2){pinch={d:gap()||1,z:zoom};drag=null;moved=true;return}
 if(e.target.closest('.city-dot,.town-pin'))return;
 drag={x:e.clientX,y:e.clientY,tx,ty};moved=false;try{svg.setPointerCapture(e.pointerId)}catch(_){}});
svg.addEventListener('pointermove',e=>{
 if(touches.has(e.pointerId))touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pinch&&touches.size===2){const c=middle();zoomTo(pinch.z*gap()/pinch.d,c.x,c.y,true);return}
 if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>5)moved=true;const u=unitPx();tx=drag.tx+dx/u;ty=drag.ty+dy/u;preview()});
const release=e=>{
 // Krótkie dotknięcie województwa (bez przesuwania) wybiera je i przybliża mapę.
 if(drag&&!moved&&!pinch&&e.type==='pointerup'){const hit=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('.region-hit');if(hit&&!(region&&mode!=='city'&&region.id===hit.dataset.region))selectRegion(hit.dataset.region)}
 touches.delete(e.pointerId);if(touches.size<2)pinch=null;const wasLive=!!pv||svg.classList.contains('moving');drag=null;if(wasLive&&!touches.size)commit();setTimeout(()=>{moved=false},30)};
svg.addEventListener('pointerup',release);
svg.addEventListener('pointercancel',release);
svg.addEventListener('wheel',e=>{e.preventDefault();anim++;const c=svgPoint(e.clientX,e.clientY);zoomTo(zoom*Math.exp(-Math.max(-60,Math.min(60,e.deltaY))*.004),c.x,c.y,true);commitSoon(140)},{passive:false});
// Safari na iOS wysyła też własne gesty — blokujemy powiększanie całej strony nad mapą.
svg.addEventListener('gesturestart',e=>e.preventDefault());
window.addEventListener('pageshow',()=>{let val=null;try{val=localStorage.getItem('tubylem_lang')}catch(e){}if(val&&val!==lang&&(val==='pl'||val==='en')){lang=val;localize()}});
window.addEventListener('storage',e=>{if(e.key==='tubylem_lang'&&(e.newValue==='pl'||e.newValue==='en')&&e.newValue!==lang){lang=e.newValue;localize()}});

// ---------- API dla modułu planów
window.IWH_ATLAS={
 lang:()=>lang,setLang:v=>{if(v!==lang&&(v==='pl'||v==='en')){lang=v;localize()}},
 style:()=>style,setStyle:v=>{if(STYLES.includes(v)){style=v;localize()}},styles:STYLES,
 resolve(item){
  if(item.t==='city'){const c=CITIES.find(x=>x.id===item.id);if(!c)return null;const r=regionOfCity(c.id);return{name:cityText(c),sub:r?regionName(r):'',icon:'📍',lat:c.lat,lon:c.lon,minutes:180}}
  if(item.t==='region'){const r=REG.regions.find(x=>x.id===item.id);if(!r)return null;const geo=geoOf(r);return{name:regionName(r),sub:t().province,icon:'🗺️',lat:geo&&geo.label?geo.label[1]:52,lon:geo&&geo.label?geo.label[0]:19,minutes:240}}
  if(item.t==='town'){const tw=townsOf(item.region).find(x=>x.name===item.name);const r=REG.regions.find(x=>x.id===item.region);if(!tw)return null;return{name:tw.name,sub:(r?regionName(r)+' · ':'')+t().count(tw.places.length),icon:'🏘️',lat:tw.lat,lon:tw.lon,minutes:120}}
  if(item.t==='place'){const p=REG.places.find(x=>x.id===item.id);if(!p)return null;return{name:p.name[lang],sub:p.town,icon:p.icon,lat:p.lat,lon:p.lon,minutes:p.time,href:regionUrlFor(p)}}
  return null;
 },
 show(item){
  if(item.t==='city')select(item.id);
  else if(item.t==='region')selectRegion(item.id);
  else if(item.t==='town')selectTown(item.name,item.region);
  else if(item.t==='place'){const p=REG.places.find(x=>x.id===item.id);if(p){selectTown(p.town,p.region);const c=project(p.lon,p.lat);fitBox(c.x-25,c.y-18,c.x+25,c.y+18,4.5)}}
 },
 cities:()=>CITIES.map(c=>({id:c.id,name:cityText(c)})),
 changed(){renderMarkers();renderStrip();if(sheetOpen)renderCard()},
 home
};
if(PLANS)PLANS.init(window.IWH_ATLAS);
// Logo zawsze widoczne: kliknięcie pokazuje całą Polskę (zamyka kartę i zakładki), bez przeładowania strony.
// 8.5: pływająca mapka Polski (na środku u góry, zawsze widoczna) — jedyny przycisk powrotu do całego kraju.
$('#atlasFloat').addEventListener('click',e=>{e.preventDefault();if(mode!=='city')clearRegion();home()});

applyLayers();localize();reset();
// Kontrolki mapy zawsze nad dolnym panelem (jego wysokość zależy od karty i języka).
const bottomPanel=$('.atlas-bottom'),syncBottom=()=>{$('#atlasApp').style.setProperty('--bottom-h',bottomPanel.offsetHeight+'px');requestAnimationFrame(layoutCityLabels)};
syncBottom();if(window.ResizeObserver)new ResizeObserver(syncBottom).observe(bottomPanel);addEventListener('resize',()=>{syncBottom();setTransform()});
requestAnimationFrame(()=>{syncBottom();if(!qs.get('region'))fitBox(...COUNTRY_BOX,1.6,.97)});
// Głębokie linki: atlas.html?region=swietokrzyskie (np. powrót z przewodnika regionu).
if(qs.get('region')&&REG.regions.some(r=>r.id===qs.get('region')))requestAnimationFrame(()=>selectRegion(qs.get('region')));
// Tryb offline działa także dla osób, które otwierają tylko Atlas (start_url PWA).
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
})();

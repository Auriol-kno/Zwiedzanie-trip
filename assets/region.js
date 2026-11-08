/* I Was Here 6.0 — przewodnik regionu: lista atrakcji, mapa, filtry miejscowości i kategorii,
 * zapisane miejsca, pieczątki „Byłem tu” i szacunkowy plan dnia. Dane: data/regiony.json (generowane do data/regiony.js).
 * Czasy przejazdu to szacunki z odległości w linii prostej — nie są to rozkłady ani nawigacja na żywo. */
(function(){
'use strict';
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
const DB=window.IWH_REGIONS;
const qs=new URLSearchParams(location.search);
const readStore=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?f:v}catch(e){return f}};
const writeStore=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
let lang=(qs.get('lang')==='en'||qs.get('lang')==='pl')?qs.get('lang'):(()=>{try{return localStorage.getItem('tubylem_lang')==='en'?'en':'pl'}catch(e){return 'pl'}})();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const T={
pl:{eyebrow:'Województwo · przewodnik regionu',eyebrowPartial:'Województwo · częściowo dostępne',lead:n=>'Wybierz miejscowość lub temat, zapisuj miejsca i ułóż plan dnia. '+n+' starannie wybranych miejsc do zwiedzania.',
 sights:'Atrakcje',towns:'Miejscowości',stamps:'Twoje pieczątki',saved:'Zapisane',map:'Mapa',fit:'⌖ Cały region',all:'Wszystkie',search:'Szukaj w regionie',searchPh:'np. zamek, jaskinia, Sandomierz…',
 plan:'Plan dnia',planSub:'Szacunkowa trasa z wybranej miejscowości',start:'Start',clock:'Godzina startu',hours:'Czas zwiedzania',car:'Samochód',transit:'Komunikacja',walkMode:'Pieszo',addDay:'🗓️ Do planu dnia',addTrip:'🧳 Do podróży',inDay:n=>'✓ W planie dnia: '+n,inTrip:n=>'✓ W podróży: '+n,defDay:'Plan dnia',defTrip:'Moja podróż',filters:'Co pokazać na mapie?',filtersSub:'Wybierz miejscowość i rodzaje miejsc — mapa i lista zmienią się razem',walkNote:'Wycieczka piesza: tempo ok. 4,5 km/h, tylko miejsca do ok. 6 km od miejscowości startowej. ',
 planNote:'Czasy przejazdu są szacowane z odległości (bez korków i rozkładów). Godziny otwarcia i ceny sprawdź na stronie obiektu przed wyjazdem.',
 planEmpty:'Brak miejsc pasujących do filtrów. Zmień kategorię lub wydłuż czas.',places:'Miejsca do zwiedzania',count:(n)=>n+' '+(n===1?'miejsce':(n%10>=2&&n%10<=4&&(n%100<12||n%100>14))?'miejsca':'miejsc'),
 empty:'Brak miejsc dla wybranych filtrów.',visit:'wizyta',drive:'dojazd',walk:'spacer',value:'Warto odwiedzić',valueNote:'ocena redakcyjna, nie Google',time:'Czas na miejscu',town:'Miejscowość',
 save:'♡ Zapisz',unsave:'♥ Zapisane',stamp:'✣ Zdobądź pieczątkę',unstamp:'✓ Pieczątka zdobyta',history:'📜 Historia miejsca',onRoutes:'Na szlakach tematycznych',route:'🧭 Prowadź',site:'🌐 Strona obiektu',google:'🔎 Szukaj w Google Maps',listen:'🔊 Posłuchaj',
 approx:'Położenie na mapie jest orientacyjne. Godziny otwarcia, ceny i dostępność potwierdź u organizatora.',osm:'Położenie według OpenStreetMap (© współtwórcy OpenStreetMap, ODbL). Godziny otwarcia, ceny i dostępność potwierdź u organizatora.',close:'Zamknij',mapOffline:'Mapa wymaga połączenia z internetem. Lista miejsc i plan dnia działają dalej.',
 notFound:'Nie znaleziono przewodnika dla tego regionu.',backAtlas:'Wróć do Atlasu Polski',noGuide:'Przewodnik po tym województwie jest w przygotowaniu.',
 cityGuide:'pełny przewodnik miejski',cityOpen:'Otwórz przewodnik',navMap:'Mapa',navPlan:'Plan dnia',navPlaces:'Miejsca',
 footer:'I Was Here 8.3 • redakcyjna selekcja miejsc, stan: listopad 2026. Ocena 1–5 jest redakcyjna, nie pochodzi z Google. Położenie większości miejsc według OpenStreetMap (© współtwórcy OpenStreetMap, ODbL), pozostałe orientacyjne. Granice: Natural Earth · Mapa © OpenStreetMap.',
 title:'Przewodnik regionu',atlas:'Cała mapa Polski',back:'Pokaż całą mapę Polski',langLabel:'Język: polski. Przełącz na angielski',min:'min',h:'godz.'},
en:{eyebrow:'Province · regional guide',eyebrowPartial:'Province · partly available',lead:n=>'Pick a town or a theme, save places and build a day plan. '+n+' carefully selected places to visit.',
 sights:'Sights',towns:'Towns',stamps:'Your stamps',saved:'Saved',map:'Map',fit:'⌖ Whole region',all:'All',search:'Search this region',searchPh:'e.g. castle, cave, Sandomierz…',
 plan:'Day plan',planSub:'Estimated route from the chosen town',start:'Start',clock:'Start time',hours:'Sightseeing time',car:'Car',transit:'Public transport',walkMode:'Walk',addDay:'🗓️ Add to day plan',addTrip:'🧳 Add to trip',inDay:n=>'✓ In day plan: '+n,inTrip:n=>'✓ In trip: '+n,defDay:'Day plan',defTrip:'My trip',filters:'What to show on the map',filtersSub:'Pick a town and the types of places — the map and the list update together',walkNote:'Walking tour: about 4.5 km/h, only places within about 6 km of the starting town. ',
 planNote:'Travel times are estimated from distance (no traffic or timetables). Check opening hours and prices on the venue’s website before you go.',
 planEmpty:'No places match the filters. Change the category or allow more time.',places:'Places to visit',count:n=>n+' '+(n===1?'place':'places'),
 empty:'No places match the selected filters.',visit:'visit',drive:'drive',walk:'walk',value:'Worth visiting',valueNote:'editorial rating, not Google',time:'Time on site',town:'Town',
 save:'♡ Save',unsave:'♥ Saved',stamp:'✣ Collect the stamp',unstamp:'✓ Stamp collected',history:'📜 History of the place',onRoutes:'On themed routes',route:'🧭 Directions',site:'🌐 Official website',google:'🔎 Search in Google Maps',listen:'🔊 Listen',
 approx:'The map position is approximate. Please confirm opening hours, prices and access with the venue.',osm:'Position from OpenStreetMap (© OpenStreetMap contributors, ODbL). Please confirm opening hours, prices and access with the venue.',close:'Close',mapOffline:'The map needs an internet connection. The list and the day plan still work.',
 notFound:'No guide was found for this region.',backAtlas:'Back to the Poland Atlas',noGuide:'A guide to this province is being prepared.',
 cityGuide:'full city guide',cityOpen:'Open the guide',navMap:'Map',navPlan:'Day plan',navPlaces:'Places',
 footer:'I Was Here 8.3 • editorial selection of places, as of November 2026. The 1–5 rating is editorial, not from Google. Most positions come from OpenStreetMap (© OpenStreetMap contributors, ODbL); the rest are approximate. Borders: Natural Earth · Map © OpenStreetMap.',
 title:'Regional guide',atlas:'Whole map of Poland',back:'Show the whole map of Poland',langLabel:'Language: English. Switch to Polish',min:'min',h:'h'}
};
const CITY={warsaw:{pl:'Warszawa',en:'Warsaw',url:'./index.html',icon:'🏛️',pl2:'184 atrakcje · 18 dzielnic',en2:'184 sights · 18 districts'}};

const region=DB&&DB.regions.find(r=>r.id===(qs.get('region')||'swietokrzyskie'));
const all=region?DB.places.filter(p=>p.region===region.id):[];
const CATS=DB?DB.categories:{};
const towns=[...new Set(all.map(p=>p.town))].sort((a,b)=>all.filter(p=>p.town===b).length-all.filter(p=>p.town===a).length||a.localeCompare(b,'pl'));
const state={town:towns.includes(qs.get('town'))?qs.get('town'):'all',cats:[],search:'',onlyFav:false,mode:qs.get('town')?'walking':'driving',hours:6,clock:'10:00',start:null};
let favs=readStore('iwh_region_favs',[]),visited=readStore('iwh_region_visited',[]);
const t=()=>T[lang];
const name=p=>p.name[lang]||p.name.pl;
const desc=p=>p.desc[lang]||p.desc.pl;
const catLabel=c=>CATS[c]?CATS[c][0]+' '+(lang==='en'?CATS[c][2]:CATS[c][1]):c;

const km=(a,b)=>{const R=6371,r=Math.PI/180,dl=(b.lat-a.lat)*r,dn=(b.lon-a.lon)*r,q=Math.sin(dl/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(q))};
// Szacunek: droga ≈ 1,3 × odległość w linii prostej; krótkie odcinki pieszo.
function leg(a,b){const d=km(a,b)*1.3;if(d<1.6||state.mode==='walking')return{mins:Math.max(3,Math.round(d/4.5*60)),kind:'walk',km:d};
 return state.mode==='transit'?{mins:Math.round(d/35*60+12),kind:'drive',km:d}:{mins:Math.round(d/55*60+6),kind:'drive',km:d}}
const townCenter=tn=>{const ps=all.filter(p=>p.town===tn);return{lat:ps.reduce((a,p)=>a+p.lat,0)/ps.length,lon:ps.reduce((a,p)=>a+p.lon,0)/ps.length}};
const fmtClock=m=>String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(Math.round(m%60)).padStart(2,'0');
const fmtDur=m=>m>=60?Math.floor(m/60)+' '+t().h+(m%60?' '+(m%60)+' '+t().min:''):m+' '+t().min;
const norm=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();

function filtered(){
 const q=norm(state.search);
 return all.filter(p=>(state.town==='all'||p.town===state.town)&&(!state.cats.length||state.cats.some(c=>p.cats.includes(c)))&&(!state.onlyFav||favs.includes(p.id))&&
  (!q||norm([p.name.pl,p.name.en,p.town,p.desc[lang]].join(' ')).includes(q))).sort((a,b)=>b.visitValue-a.visitValue||a.town.localeCompare(b.town,'pl'));
}

// ---------- mapa (Leaflet; bez sieci zostaje lista)
let map=null,layer=null;
function initMap(){
 if(typeof L==='undefined'){$('#rMap').innerHTML='<div class="map-offline">'+esc(t().mapOffline)+'</div>';return}
 map=L.map('rMap',{zoomControl:true,scrollWheelZoom:false});
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap'}).addTo(map);
 const geo=window.POLAND_GEO&&window.POLAND_GEO.regions.find(g=>g.name===region.geo);
 if(geo)L.polygon(geo.coords.map(c=>[c[1],c[0]]),{color:'#244f40',weight:2.5,fillColor:'#244f40',fillOpacity:.04,dashArray:'6 5',interactive:false}).addTo(map);
 layer=L.layerGroup().addTo(map);
}
function renderMap(){
 if(!map)return;layer.clearLayers();
 const list=filtered();
 list.forEach(p=>{const m=L.marker([p.lat,p.lon],{icon:L.divIcon({className:'',html:'<div class="r-pin'+(favs.includes(p.id)?' saved':'')+'"><span>'+p.icon+'</span></div>',iconSize:[30,30],iconAnchor:[15,30]}),title:name(p)});
  m.on('click',()=>openDetail(p.id));m.bindTooltip(name(p)+' · '+p.town,{direction:'top',offset:[0,-26]});layer.addLayer(m)});
 fit(list);
}
function fit(list){if(!map)return;const pts=(list&&list.length?list:all).map(p=>[p.lat,p.lon]);if(pts.length)map.fitBounds(pts,{padding:[34,34],maxZoom:14})}

// ---------- widok
function renderTexts(){
 const x=t();
 document.documentElement.lang=lang;
 document.title='I Was Here — '+(region?(lang==='en'?region.en:region.pl):x.title);
 $('#langRegion').querySelectorAll('[data-lang]').forEach(s=>s.classList.toggle('on',s.dataset.lang===lang));
 $('#langRegion').setAttribute('aria-label',x.langLabel);
 const home=$('#atlasFloat');home.href='./atlas.html?lang='+lang; // logo zawsze pokazuje całą Polskęhome.setAttribute('aria-label',x.back);home.title=x.atlas;
 const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
 set('savedLabel',x.saved);set('statPlacesLabel',x.sights);set('statTownsLabel',x.towns);set('statStampsLabel',x.stamps);set('mapTitle',x.map);set('fitMap',x.fit);
 set('searchLabel',x.search);$('#rSearch').placeholder=x.searchPh;set('planTitle',x.plan);set('planSub',x.planSub);set('planStartLabel',x.start);set('planClockLabel',x.clock);
 set('planHoursLabel',x.hours);set('modeCar',x.car);set('modeTransit',x.transit);set('modeWalk',x.walkMode);set('filtersTitle',x.filters);set('filtersSub',x.filtersSub);set('placesTitle',x.places);set('rFooter',x.footer);
 set('navMap',x.navMap);set('navPlan',x.navPlan);set('navPlaces',x.navPlaces);$('#dClose').setAttribute('aria-label',x.close);
 if(!region)return;
 set('rEyebrow',region.status==='partial'?x.eyebrowPartial:x.eyebrow);
 set('rTitle',lang==='en'?region.en:region.pl);
 set('rLead',x.lead(all.length));
 set('statPlaces',all.length);set('statTowns',towns.length);
 renderArt();
}
// 8.4 — malowany motyw głównego miasta województwa w nagłówku (te same ilustracje co w Atlasie)
const ART_CITY={dolnoslaskie:'wroclaw','kujawsko-pomorskie':'torun',lubelskie:'lublin',lubuskie:'',lodzkie:'lodz',malopolskie:'krakow',mazowieckie:'warsaw',opolskie:'',podkarpackie:'rzeszow',podlaskie:'bialystok',pomorskie:'gdansk',slaskie:'katowice',swietokrzyskie:'kielce','warminsko-mazurskie':'olsztyn',wielkopolskie:'poznan',zachodniopomorskie:'szczecin'};
function renderArt(){const box=$('#rArt'),A=window.IWH_ATLAS_ART,c=region&&ART_CITY[region.id];if(!box||!A||!c){if(box)box.hidden=true;return}A.paintDefs();box.innerHTML='<svg viewBox="0 -6 80 62">'+A.landmark(c)+'</svg>'}
function renderStats(){$('#statStamps').textContent=all.filter(p=>visited.includes(p.id)).length+' / '+all.length}
function renderCityLinks(){
 const box=$('#cityLinks');
 box.innerHTML=(region.cities||[]).filter(c=>CITY[c]).map(c=>{const k=CITY[c];return '<a class="city-link" href="'+k.url+'?lang='+lang+'&from=region"><span>'+k.icon+'</span><div><b>'+esc(k[lang])+' — '+esc(t().cityGuide)+' ✦</b><small>'+esc(lang==='en'?k.en2:k.pl2)+' · '+esc(t().cityOpen)+' →</small></div></a>'}).join('');
}
function renderChips(){
 $('#townChips').innerHTML=['all',...towns].map(tn=>'<button type="button" class="chip'+(state.town===tn?' selected':'')+'" data-town="'+esc(tn)+'" aria-pressed="'+(state.town===tn)+'">'+(tn==='all'?'📍 '+esc(t().all):esc(tn)+' <small>'+all.filter(p=>p.town===tn).length+'</small>')+'</button>').join('');
 const used=Object.keys(CATS).filter(c=>all.some(p=>p.cats.includes(c)));
 $('#catChips').innerHTML=used.map(c=>'<button type="button" class="chip'+(state.cats.includes(c)?' selected':'')+'" data-cat="'+c+'" aria-pressed="'+state.cats.includes(c)+'">'+esc(catLabel(c))+'</button>').join('');
}
function card(p){
 const fav=favs.includes(p.id);
 return '<article class="place'+(visited.includes(p.id)?' visited':'')+'"><div class="thumb" aria-hidden="true">'+p.icon+'</div><div class="body"><button type="button" class="open" data-open="'+p.id+'">'+
  '<div class="cat">'+esc(p.town)+' · '+esc(p.cats.map(c=>CATS[c]?(lang==='en'?CATS[c][2]:CATS[c][1]):c).join(' · '))+'</div><h3>'+esc(name(p))+'</h3><p>'+esc(desc(p))+'</p>'+
  '<div class="meta"><span>⏱ '+fmtDur(p.time)+'</span><span>✦ '+esc(t().value)+': '+p.visitValue+'/5</span></div></button></div>'+
  '<button type="button" class="fav" data-fav="'+p.id+'" aria-pressed="'+fav+'" aria-label="'+esc((fav?t().unsave:t().save).replace(/^[♡♥] /,''))+': '+esc(name(p))+'">'+(fav?'♥':'♡')+'</button></article>';
}
function renderList(){
 const list=filtered();
 $('#placesCount').textContent=t().count(list.length)+(state.town!=='all'?' · '+state.town:'');
 $('#placeList').innerHTML=list.length?list.map(card).join(''):'<div class="empty">'+esc(t().empty)+'</div>';
 $('#savedBtn').setAttribute('aria-pressed',String(state.onlyFav));
}
function renderPlanStart(){
 const sel=$('#planStart'),cur=state.start||(state.town!=='all'?state.town:towns[0]);
 sel.innerHTML=towns.map(tn=>'<option value="'+esc(tn)+'"'+(tn===cur?' selected':'')+'>'+esc(tn)+'</option>').join('');
 state.start=cur;
}
// Zachłanny plan: najbliższe ciekawe miejsce, dopóki mieści się w czasie. Wybór premiuje ocenę redakcyjną.
function buildPlan(){
 const c0=townCenter(state.start);
 const cand=all.filter(p=>(state.mode!=='walking'||km(c0,p)<=6)&&(!state.cats.length||state.cats.some(c=>p.cats.includes(c)))&&(!state.onlyFav||favs.includes(p.id)));
 const limit=state.hours*60,[hh,mm]=state.clock.split(':').map(Number);let clock=hh*60+mm,used=0,at=townCenter(state.start),out=[];const left=new Set(cand.map(p=>p.id));
 while(left.size&&out.length<10){
  let best=null;
  for(const id of left){const p=cand.find(x=>x.id===id),l=leg(at,p),cost=l.mins+p.time;if(used+cost>limit)continue;
   const score=p.visitValue*22-l.mins*(state.town!=='all'&&p.town===state.town?.4:1);if(!best||score>best.score)best={p,l,score,cost}}
  if(!best)break;
  out.push({p:best.p,leg:best.l,arrive:clock+best.l.mins});clock+=best.cost;used+=best.cost;at=best.p;left.delete(best.p.id);
 }
 return{out,used};
}
function renderPlan(){
 const x=t(),{out,used}=buildPlan();
 $('#planHoursValue').textContent=state.hours+' '+x.h;
 $('#planNote').textContent=(state.mode==='walking'?x.walkNote:'')+x.planNote;
 $$('#planMode button').forEach(b=>b.classList.toggle('active',b.dataset.mode===state.mode));
 $('#planList').innerHTML=out.length?out.map((s,i)=>'<li><span class="n">'+(i+1)+'</span><button type="button" data-open="'+s.p.id+'"><b>'+esc(name(s.p))+'</b><small>'+esc(s.p.town)+' · '+fmtClock(s.arrive)+'–'+fmtClock(s.arrive+s.p.time)+' · '+x.visit+' '+fmtDur(s.p.time)+'</small><small>'+(s.leg.kind==='walk'?'🚶 '+x.walk:(state.mode==='transit'?'🚌 ':'🚗 ')+x.drive)+' ~'+fmtDur(s.leg.mins)+' · '+s.leg.km.toFixed(1)+' km</small></button></li>').join(''):'<li class="empty">'+esc(x.planEmpty)+'</li>';
 const a=$('#planMaps');
 if(out.length){const o=townCenter(state.start),pts=out.map(s=>s.p.lat+','+s.p.lon),dest=pts.pop();
  a.href='https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(o.lat.toFixed(5)+','+o.lon.toFixed(5))+'&destination='+encodeURIComponent(dest)+(pts.length?'&waypoints='+encodeURIComponent(pts.join('|')):'')+'&travelmode='+(state.mode==='transit'?'transit':state.mode==='walking'?'walking':'driving');
  a.removeAttribute('aria-disabled');a.textContent='🧭 Google Maps · '+fmtDur(used)}else{a.href='#';a.setAttribute('aria-disabled','true');a.textContent='🧭 Google Maps'}
}
function renderAll(){renderTexts();renderStats();renderCityLinks();renderChips();renderList();renderPlanStart();renderPlan();renderMap()}

// ---------- szczegóły
let lastFocus=null;
function openDetail(id){
 const p=all.find(x=>x.id===id);if(!p)return;const x=t(),fav=favs.includes(id),seen=visited.includes(id);lastFocus=document.activeElement;
 const dir='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(p.lat+','+p.lon);
 const search='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(p.name.pl+', '+p.town);
 $('#dBody').innerHTML='<div class="big" aria-hidden="true">'+p.icon+'</div><div class="eyebrow" style="color:var(--accent)">'+esc(p.town)+' · '+esc(p.cats.map(catLabel).join(' · '))+'</div><h2 id="dTitle">'+esc(name(p))+'</h2>'+
  (lang==='en'&&p.name.en!==p.name.pl?'<div class="subheading">'+esc(p.name.pl)+'</div>':'')+'<p>'+esc(desc(p))+'</p>'+'<div id="dHist"></div>'+(window.IWH_EXTRAS?IWH_EXTRAS.wikiHTML(p,lang):'')+'<div id="dRoutes"></div>'+
  '<div class="facts"><div><small>'+esc(x.time)+'</small><b>'+fmtDur(p.time)+'</b></div><div><small>'+esc(x.value)+'</small><b>'+p.visitValue+'/5</b> <small style="display:inline">('+esc(x.valueNote)+')</small></div></div>'+
  '<div class="actions"><button type="button" class="btn secondary" data-fav="'+id+'" aria-pressed="'+fav+'">'+esc(fav?x.unsave:x.save)+'</button><button type="button" class="btn '+(seen?'secondary':'accent')+'" data-stamp="'+id+'" aria-pressed="'+seen+'">'+esc(seen?x.unstamp:x.stamp)+'</button>'+
  '<a class="btn" href="'+dir+'" target="_blank" rel="noopener">'+esc(x.route)+'</a>'+(p.url?'<a class="btn secondary" href="'+esc(p.url)+'" target="_blank" rel="noopener">'+esc(x.site)+'</a>':'<a class="btn secondary" href="'+search+'" target="_blank" rel="noopener">'+esc(x.google)+'</a>')+
  ('speechSynthesis' in window?'<button type="button" class="btn secondary" data-speak="'+id+'">'+esc(x.listen)+'</button>':'')+
  '<button type="button" class="btn secondary" data-addplan="day" data-id="'+id+'">'+esc(planLabel('day',id))+'</button><button type="button" class="btn secondary" data-addplan="trip" data-id="'+id+'">'+esc(planLabel('trip',id))+'</button>'+
  // 8.5: notatki i zdjęcia dopiero po zdobyciu pieczątki (jak w Warszawie)
  (seen&&window.IWH_EXTRAS?IWH_EXTRAS.journal.button('reg:'+id,name(p)+' · '+p.town,p.icon,lang):'')+'</div>'+
  '<div class="warn">'+esc(p.coordinateStatus==='osm'?x.osm:x.approx)+'</div>';
 $('#detail').classList.add('show');document.body.style.overflow='hidden';$('#dClose').focus();window.IWH_EXTRAS?.journal.counts($('#dBody'));
 detailExtras(p);
}
// 8.6 — rozszerzona historia miejsca (data/historia/<region>.json, wczytywana dynamicznie) i szlaki tematyczne z Odkrywaj
const HIST={},HDATA={};
function loadHistory(rid){if(!HIST[rid])HIST[rid]=fetch('./data/historia/'+encodeURIComponent(rid)+'.json').then(r=>r.ok?r.json():null).catch(()=>{delete HIST[rid];return null}).then(j=>{if(j)HDATA[rid]=j;return j});return HIST[rid]}
function historyOf(p){const h=HDATA[p.region];return h&&h.places?h.places[p.id]:null}
function detailExtras(p){
 const x=t();
 loadHistory(p.region).then(h=>{const box=$('#dHist');const e=h&&h.places&&h.places[p.id];if(!box||!e||$('#dTitle')?.textContent!==name(p))return;
  const paras=e[lang]||e.pl;box.innerHTML='<section class="place-history" aria-labelledby="dHistT"><h3 id="dHistT">'+esc(x.history)+'</h3>'+paras.map(q=>'<p>'+esc(q)+'</p>').join('')+'<small>'+esc((h.note&&(h.note[lang]||h.note.pl))||'')+'</small></section>'});
 if(window.IWH_EXPLORE)IWH_EXPLORE.routesFor(p.id).then(rs=>{const box=$('#dRoutes');if(!box||!rs.length||$('#dTitle')?.textContent!==name(p))return;
  box.innerHTML='<div class="place-routes"><span class="place-routes-label">'+esc(x.onRoutes)+'</span>'+rs.map(r=>{const th=IWH_EXPLORE.themeOf(r.theme)||{};return '<a href="./atlas.html?tab=explore&route='+encodeURIComponent(r.id)+'&lang='+lang+'">'+IWH_EXPLORE.art(r.art||th.art,th.color,30)+esc((r[lang]||r.pl).name.split(' — ')[0])+'</a>'}).join('')+'</div>'}).catch(()=>{});
}
// 8.5 — dodanie punktu do planu dnia / podróży Atlasu (iwh_days / iwh_trips, ten sam format co atlas-plans.js)
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function planWith(kind,id){return readStore(kind==='day'?'iwh_days':'iwh_trips',[]).find(pl=>Array.isArray(pl.items)&&pl.items.some(i=>i.t==='place'&&i.id===id))}
function planLabel(kind,id){const pl=planWith(kind,id),x=t();return pl?(kind==='day'?x.inDay(pl.name):x.inTrip(pl.name)):(kind==='day'?x.addDay:x.addTrip)}
function addToPlan(kind,id){
 if(planWith(kind,id))return;const key=kind==='day'?'iwh_days':'iwh_trips',all=readStore(key,[]),x=t();
 let pl=kind==='day'?all.filter(p=>!p.date||p.date>=today()).sort((a,b)=>(a.date||'').localeCompare(b.date||''))[0]:all[0];
 if(!pl){pl={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),name:kind==='day'?x.defDay:x.defTrip,created:new Date().toISOString(),items:[]};if(kind==='day'){pl.date=today();pl.start='09:00'}all.unshift(pl)}
 pl.items.push({t:'place',id});writeStore(key,all);
}
function closeDetail(){$('#detail').classList.remove('show');document.body.style.overflow='';if(window.speechSynthesis)speechSynthesis.cancel();lastFocus?.focus?.()}
function toggle(listName,id){
 const list=listName==='fav'?favs:visited,next=list.includes(id)?list.filter(x=>x!==id):[...list,id];
 if(listName==='fav'){favs=next;writeStore('iwh_region_favs',favs)}else{visited=next;writeStore('iwh_region_visited',visited)}
 renderStats();renderList();renderMap();renderPlan();if($('#detail').classList.contains('show'))openDetail(id);
}

// ---------- zdarzenia
document.addEventListener('click',e=>{
 const o=e.target.closest('[data-open]');if(o){openDetail(o.dataset.open);return}
 const f=e.target.closest('[data-fav]');if(f){toggle('fav',f.dataset.fav);return}
 const s=e.target.closest('[data-stamp]');if(s){toggle('stamp',s.dataset.stamp);return}
 const ap=e.target.closest('[data-addplan]');if(ap){addToPlan(ap.dataset.addplan,ap.dataset.id);ap.textContent=planLabel(ap.dataset.addplan,ap.dataset.id);return}
 const sp=e.target.closest('[data-speak]');if(sp&&window.speechSynthesis){const p=all.find(x=>x.id===sp.dataset.speak);speechSynthesis.cancel();const hi=historyOf(p);const u=new SpeechSynthesisUtterance(name(p)+'. '+desc(p)+(hi?' '+(hi[lang]||hi.pl).join(' '):''));u.lang=lang==='en'?'en-GB':'pl-PL';u.rate=.95;speechSynthesis.speak(u);return}
 const tn=e.target.closest('[data-town]');if(tn){state.town=tn.dataset.town;if(state.town!=='all')state.start=state.town;renderChips();renderList();renderPlanStart();renderPlan();renderMap();return}
 const c=e.target.closest('[data-cat]');if(c){const k=c.dataset.cat;state.cats=state.cats.includes(k)?state.cats.filter(x=>x!==k):[...state.cats,k];renderChips();renderList();renderPlan();renderMap();return}
 const j=e.target.closest('[data-jump]');if(j){document.getElementById(j.dataset.jump).scrollIntoView({behavior:'smooth',block:'start'});$$('.bottom-nav button').forEach(b=>b.classList.toggle('active',b===j));if(j.dataset.jump==='mapSection'&&map)setTimeout(()=>map.invalidateSize(),350)}
});
$('#detail').addEventListener('click',e=>{if(e.target.id==='detail')closeDetail()});
$('#dClose').onclick=closeDetail;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#detail').classList.contains('show'))closeDetail()});
$('#savedBtn').onclick=()=>{state.onlyFav=!state.onlyFav;renderList();renderPlan();renderMap()};
$('#fitMap').onclick=()=>fit(filtered());
$('#rSearch').oninput=e=>{state.search=e.target.value.trim();renderList();renderMap()};
$('#planStart').onchange=e=>{state.start=e.target.value;renderPlan()};
$('#planClock').onchange=e=>{state.clock=e.target.value||'10:00';renderPlan()};
$('#planHours').oninput=e=>{state.hours=+e.target.value;renderPlan()};
$('#planMode').onclick=e=>{const b=e.target.closest('[data-mode]');if(b){state.mode=b.dataset.mode;renderPlan()}};
$('#langRegion').onclick=e=>{const pick=e.target.closest('[data-lang]')?.dataset.lang;const next=pick||(lang==='pl'?'en':'pl');if(next===lang&&pick)return;lang=next;try{localStorage.setItem('tubylem_lang',lang)}catch(_){}renderAll()};
document.addEventListener('iwh-stamps-change',()=>{visited=readStore('iwh_region_visited',[]);renderStats();renderList();renderMap();renderPlan()});
window.addEventListener('storage',e=>{if(e.key==='tubylem_lang'&&(e.newValue==='pl'||e.newValue==='en')&&e.newValue!==lang){lang=e.newValue;renderAll()}});

// ---------- start
try{localStorage.setItem('tubylem_lang',lang)}catch(_){}
if(!region||!all.length){
 renderTexts();
 const msg=region?t().noGuide:t().notFound;
 document.querySelector('.app').innerHTML=document.querySelector('.top').outerHTML+'<section class="hero"><h1>'+esc(region?(lang==='en'?region.en:region.pl):'I Was Here')+'</h1><p>'+esc(msg)+'</p></section><p style="text-align:center;margin:24px 0"><a class="btn" href="./atlas.html?lang='+lang+'">'+esc(t().backAtlas)+'</a></p>';
 document.querySelector('#appNav')?.remove();
 return;
}
initMap();renderAll();
if(qs.get('place'))openDetail(qs.get('place'));
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
})();

/* I Was Here 8.16 — planer podróży „dzień po dniu” (planer.html).
 * Kreator: miasto → długość (liczba dni albo daty) → zainteresowania (bardzo interesuje / polecaj / nie polecaj),
 * tempo i transport → pytanie o plan dzień po dniu → postęp → mapa z trasami w kolorach dni,
 * przełącznik dni, „Pokaż wszystkie”, „Optymalizuj trasę”, edycja, Google Maps, zapis do Planów Atlasu.
 * Wszystko liczy się lokalnie w przeglądarce, bez AI i bez kluczy API: wybór miejsc według redakcyjnej
 * wartości wizyty 1–5 i zainteresowań, grupowanie w dni (k-średnich), kolejność (najbliższy sąsiad + 2-opt).
 * Czasy przejść są szacunkiem (odległość w linii prostej × 1,3), a nie trasą po ulicach.
 * Dane: data/planer.json (tools/build_planner_data.py) albo window.IWH_PLANNER_DATA (podgląd jednoplikowy).
 * Mapa: Leaflet + OSM, gdy jest window.L; w przeciwnym razie własna mapa SVG (bez podkładu ulic). */
(function(root){
'use strict';

/* ================= SILNIK (czyste funkcje, testowane w tools/test_planner.js) ================= */
const RAD=Math.PI/180;
function km(a,b){const dl=(b.lat-a.lat)*RAD,dn=(b.lon-a.lon)*RAD,h=Math.sin(dl/2)**2+Math.cos(a.lat*RAD)*Math.cos(b.lat*RAD)*Math.sin(dn/2)**2;return 12742*Math.asin(Math.sqrt(h))}
const MODES={walking:{kmh:4.5,detour:1.3,over:0},driving:{kmh:28,detour:1.35,over:8},transit:{kmh:15,detour:1.3,over:7}};
function leg(a,b,mode){const m=MODES[mode]||MODES.walking,d=km(a,b)*m.detour;return{km:d,min:Math.max(2,Math.round(d/m.kmh*60+(d>0.15?m.over:0)))}}
const TEMPO={calm:240,normal:360,full:480};
const NEAR_KM=40;

function poolFor(data,cityName,need){
 const city=data.cities.find(c=>c.name===cityName);if(!city)return[];
 const own=data.places.filter(p=>p.town===cityName);
 if(own.length>=need)return own.map(p=>Object.assign({near:false},p));
 const extra=data.places.filter(p=>p.town!==cityName&&km(city,p)<=NEAR_KM).sort((a,b)=>km(city,a)-km(city,b));
 return own.map(p=>Object.assign({near:false},p)).concat(extra.slice(0,need-own.length).map(p=>Object.assign({near:true},p)));
}
function score(p,prefs){
 const no=prefs.no||[],top=prefs.top||[];
 if(!p.cats.length?false:(no.includes(p.cats[0])||p.cats.every(c=>no.includes(c))))return -1;
 let s=p.v*10;for(const c of p.cats)if(top.includes(c))s+=14;
 return s-(p.near?6:0)+p.min/1000;
}
/* k-średnich z deterministycznym startem (najdalszy punkt), potem wyrównanie obciążenia dni */
function cluster(pts,k,budget){
 k=Math.max(1,Math.min(k,pts.length));
 const cs=[pts[0]];
 while(cs.length<k){let best=null,bd=-1;for(const p of pts){const d=Math.min(...cs.map(c=>km(c,p)));if(d>bd){bd=d;best=p}}cs.push(best)}
 let cent=cs.map(c=>({lat:c.lat,lon:c.lon})),asg=new Array(pts.length).fill(0);
 for(let it=0;it<20;it++){
  asg=pts.map(p=>{let bi=0,bd=1e9;cent.forEach((c,i)=>{const d=km(c,p);if(d<bd){bd=d;bi=i}});return bi});
  cent=cent.map((c,i)=>{const m=pts.filter((_,j)=>asg[j]===i);return m.length?{lat:m.reduce((s,p)=>s+p.lat,0)/m.length,lon:m.reduce((s,p)=>s+p.lon,0)/m.length}:c});
 }
 const load=i=>pts.reduce((s,p,j)=>s+(asg[j]===i?p.min+20:0),0),count=i=>asg.filter(a=>a===i).length;
 for(let guard=0;guard<200;guard++){
  let over=-1;for(let i=0;i<k;i++)if(load(i)>budget*1.15&&count(i)>1&&(over<0||load(i)>load(over)))over=i;
  const empty=[...Array(k).keys()].find(i=>count(i)===0);
  if(over<0&&empty===undefined)break;
  const src=over>=0?over:[...Array(k).keys()].sort((a,b)=>count(b)-count(a))[0];
  if(count(src)<2)break;
  // przenieś punkt z przeciążonego dnia do dnia, którego środek jest najbliżej i który ma miejsce
  let mv=-1,to=-1,bd=1e9;
  pts.forEach((p,j)=>{if(asg[j]!==src)return;for(let i=0;i<k;i++){if(i===src)continue;if(empty!==undefined&&over<0&&i!==empty)continue;if(load(i)+p.min+20>budget*1.15&&count(i)>0)continue;const d=km(cent[i],p)-km(cent[src],p);if(d<bd){bd=d;mv=j;to=i}}});
  if(mv<0)break;asg[mv]=to;
 }
 return [...Array(k).keys()].map(i=>pts.filter((_,j)=>asg[j]===i)).filter(g=>g.length);
}
function pathLen(seq){let s=0;for(let i=1;i<seq.length;i++)s+=km(seq[i-1],seq[i]);return s} // km: czas przejścia jest do niej proporcjonalny
function order(stops,mode,optimize){
 if(!optimize)return stops.slice().sort((a,b)=>b.v-a.v||a.id.localeCompare(b.id));
 if(stops.length<3)return stops.slice();
 let best=null,bl=1e9;
 for(const start of stops){const left=stops.filter(s=>s!==start),seq=[start];while(left.length){const last=seq[seq.length-1];let bi=0;left.forEach((p,i)=>{if(km(last,p)<km(last,left[bi]))bi=i});seq.push(left.splice(bi,1)[0])}const l=pathLen(seq,mode);if(l<bl){bl=l;best=seq}}
 let improved=true;while(improved){improved=false;for(let i=1;i<best.length-1;i++)for(let j=i+1;j<best.length;j++){const cand=best.slice(0,i).concat(best.slice(i,j+1).reverse(),best.slice(j+1));const l=pathLen(cand,mode);if(l+1e-6<bl){bl=l;best=cand;improved=true}}}
 return best;
}
function timeline(stops,mode,start,date){
 let t=start;const out=[];
 const dow=date?new Date(date+'T12:00:00').getDay():null;
 stops.forEach((p,i)=>{
  const l=i?leg(stops[i-1],p,mode):null;if(l)t+=l.min;
  const arrive=t;t+=p.min;
  let warn=null;
  if(p.sch&&dow!==null){const h=p.sch[String(dow)];if(!h)warn='closed';else if(arrive/60<h[0])warn='early';else if(t/60>h[1])warn='late'}
  out.push({p,leg:l,arrive,leave:t,warn});
 });
 return out;
}
function plan(data,o){
 const budget=TEMPO[o.tempo]||TEMPO.normal,days=Math.max(1,Math.min(7,o.days|0||1)),mode=o.mode||'walking';
 const pool=poolFor(data,o.city,Math.ceil(days*budget/80));
 const ranked=pool.map(p=>({p,s:score(p,o)})).filter(x=>x.s>=0).sort((a,b)=>b.s-a.s||a.p.id.localeCompare(b.p.id));
 const cap=days*budget;let used=0;const chosen=[];
 for(const {p} of ranked){const cost=p.min+20;if(used+cost>cap*1.05&&chosen.length>=days)continue;if(chosen.length>=days*8)break;chosen.push(p);used+=cost}
 const groups=cluster(chosen,days,budget);
 const valueOf=g=>g.reduce((s,p)=>s+p.v,0);
 groups.sort((a,b)=>valueOf(b)-valueOf(a));
 const res={
  city:o.city,mode,budget,optimize:o.optimize!==false,
  pool:pool.length,matched:ranked.length,excluded:pool.length-ranked.length,
  short:groups.length<days,days:fit(groups,ranked,mode,budget),
  spare:[]
 };
 if(o.optimize===false)res.days=res.days.map(d=>order(d,mode,false));
 const inPlan=new Set(res.days.flat().map(p=>p.id));res.spare=ranked.map(x=>x.p).filter(p=>!inPlan.has(p.id));
 return res;
}
/* Dopasowanie dni do tempa: za długi dzień traci najmniej wartościowe punkty, krótki dobiera bliskie miejsca. */
const REACH={walking:1.2,transit:3,driving:10};
function span(d,mode){if(!d.length)return 0;const tl=timeline(d,mode,0,null);return tl[tl.length-1].leave}
function fit(groups,ranked,mode,budget){
 const days=groups.map(g=>order(g,mode,true)),used=new Set(days.flat().map(p=>p.id));
 days.forEach((d,i)=>{
  while(d.length>1&&span(d,mode)>budget*1.1){
   const c={lat:d.reduce((s,p)=>s+p.lat,0)/d.length,lon:d.reduce((s,p)=>s+p.lon,0)/d.length};
   let wi=0;d.forEach((p,j)=>{const w=p.v*10-km(c,p)*4,cur=d[wi].v*10-km(c,d[wi])*4;if(w<cur)wi=j});
   used.delete(d[wi].id);d.splice(wi,1);days[i]=d=order(d,mode,true);
  }
  for(const {p} of ranked){
   if(used.has(p.id))continue;
   if(Math.min(...d.map(q=>km(q,p)))>(REACH[mode]||1.2))continue;
   const cand=order(d.concat([p]),mode,true);
   if(span(cand,mode)<=budget){days[i]=d=cand;used.add(p.id)}
  }
 });
 return days;
}
function mapsUrl(stops,mode){
 if(!stops.length)return'';
 const f=p=>p.lat.toFixed(5)+','+p.lon.toFixed(5),s=stops.slice(0,10);
 const tm=mode==='driving'?'driving':'walking';
 return'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(f(s[0]))+'&destination='+encodeURIComponent(f(s[s.length-1]))+(s.length>2?'&waypoints='+encodeURIComponent(s.slice(1,-1).map(f).join('|')):'')+'&travelmode='+tm;
}
const ENGINE={km,leg,poolFor,score,cluster,order,timeline,plan,mapsUrl,TEMPO,MODES};
if(typeof module!=='undefined'&&module.exports){module.exports=ENGINE;return}
root.IWH_PLANNER=ENGINE;

/* ================= INTERFEJS ================= */
const doc=document,main=doc.getElementById('planner');if(!main)return;
const COLORS=['#93481C','#3F6E68','#7A4E31','#8C6119','#33403F','#9C4A37','#4F6F68']; // 8.19: ciemniejsze barwy dni — czytelny tekst „Dzień N” (kontrast ≥ 4,5)
const T={
 pl:{title:'Nowa podróż',city:'Wybierz miasto',search:'Szukaj miasta',full:'Pełny przewodnik',others:'Miasta z przewodników województw',places:n=>n+' '+(n===1?'miejsce':n%10>=2&&n%10<=4&&(n%100<10||n%100>=20)?'miejsca':'miejsc'),noCity:'Nie mamy jeszcze tego miasta w planerze.',
  howLong:'Ile dni?',tabDays:'Liczba dni',tabDates:'Daty',from:'Od',to:'Do',daysN:n=>n+' '+(n===1?'dzień':'dni'),confirmDur:'Potwierdź długość',
  prefs:'Co lubisz?',prefsLead:'Przesuń kategorie: ★ do „Bardzo interesuje” (najwyżej 3), ✕ do „Nie polecaj”.',top:'Bardzo interesuje',rec:'Polecaj mi',no:'Nie polecaj',max3:'Najwyżej 3 ulubione',back:'Przywróć',toTop:'Do ulubionych',toNo:'Nie polecaj',
  tempo:'Tempo',calm:'Spokojnie · ~4 h',normal:'Umiarkowanie · ~6 h',fulld:'Intensywnie · ~8 h',mode:'Jak się poruszasz',walk:'Pieszo',car:'Autem',transit:'Komunikacją',
  create:'Utwórz podróż',askT:'Chcesz plan dzień po dniu?',askL:'Ułożymy trasy na każdy dzień z naszych najlepszych propozycji.',yes:'Tak, zaplanuj za mnie',later:'Zrobię to później',
  making:'Układam plan dzień po dniu…',s1:'Tworzę podróż',s1d:'Przygotowuję wszystko',s2:'Stosuję Twoje preferencje',s2d:n=>'Filtruję z '+n+' miejsc',s3:'Rozkładam na mapie',s3d:'Grupuję miejsca w dni',s4:'Uzupełniam trasę',s4d:'Czasy zwiedzania i przejść',s5:'Optymalizuję dni',s5d:'Skracam drogę między punktami',
  day:'Dzień',all:'Pokaż wszystkie',optimize:'Optymalizuj trasę',edit:'Edytuj',done:'Gotowe',maps:'Otwórz w Mapach Google',save:'Zapisz w Planach',saved:'Zapisano dni w Planach Atlasu',savedTrip:'Zapisano podróż w Planach Atlasu',openPlans:'Otwórz Plany',restart:'Nowy plan',copy:'Kopiuj plan',copied:'Skopiowano plan',
  visit:'zwiedzanie',arrive:'ok.',walkLeg:'pieszo',carLeg:'autem',transitLeg:'komunikacją',value:v=>'wartość wizyty '+v+'/5',approx:'współrzędne orientacyjne',near:'w okolicy',closed:'w tym dniu zamknięte',early:'otwierają później',late:'możesz nie zdążyć przed zamknięciem',
  stats:(n,h,k)=>n+' miejsc · '+h+' · '+k+' km',remove:'Usuń',up:'Wyżej',down:'Niżej',moveTo:'Przenieś do dnia',add:'Dodaj miejsce',addLead:'Najbliższe propozycje, które jeszcze nie są w planie:',noSpare:'Brak kolejnych pasujących miejsc.',
  short:(d,n)=>'W tym mieście mamy na razie '+n+' miejsc — wystarczy na '+d+'.',excluded:n=>'Pominięto '+n+' miejsc z kategorii „Nie polecaj”.',
  note:'Czasy przejść to szacunek (odległość × 1,3), nie trasa po ulicach. Wartość wizyty 1–5 jest redakcyjna, nie z Google. Godziny otwarcia sprawdź przed wyjściem.',
  transitNote:'Mapy Google nie obsługują przystanków pośrednich dla komunikacji — link otwiera trasę pieszą.',
  mapOffline:'Brak podkładu mapy (offline) — trasy i numery nadal działają.',schematic:'Mapa schematyczna: punkty w prawdziwych współrzędnych, bez podkładu ulic.',
  guide:'Przewodnik',made:'Made by Tomasz Kmiecik',change:'Zmień',startAt:'Start'},
 en:{title:'New trip',city:'Select a city',search:'Search for a city',full:'Full city guide',others:'Cities from the province guides',places:n=>n+' place'+(n===1?'':'s'),noCity:'This city is not in the planner yet.',
  howLong:'How many days?',tabDays:'Number of days',tabDates:'Dates',from:'From',to:'To',daysN:n=>n+' day'+(n===1?'':'s'),confirmDur:'Confirm duration',
  prefs:'What do you like?',prefsLead:'Move categories: ★ to “High interest” (up to 3), ✕ to “Don’t recommend”.',top:'High interest',rec:'Recommend me',no:'Don’t recommend',max3:'Up to 3 favourites',back:'Restore',toTop:'Make favourite',toNo:'Don’t recommend',
  tempo:'Pace',calm:'Relaxed · ~4 h',normal:'Moderate · ~6 h',fulld:'Intense · ~8 h',mode:'How you get around',walk:'Walking',car:'By car',transit:'Public transport',
  create:'Create trip',askT:'Do you want a day-by-day itinerary?',askL:'We’ll build routes for each day from our best recommendations.',yes:'Yes, plan it for me!',later:'I’ll do it later',
  making:'Creating your daily itinerary…',s1:'Creating your trip',s1d:'Setting everything up',s2:'Applying your preferences',s2d:n=>'Filtering from '+n+' places',s3:'Mapping our selection',s3d:'Grouping places into days',s4:'Enriching the route',s4d:'Visit and walking times',s5:'Optimising your days',s5d:'Reducing time between stops',
  day:'Day',all:'View all',optimize:'Optimise route',edit:'Edit',done:'Done',maps:'Open in Google Maps',save:'Save to Plans',saved:'Days saved to Atlas Plans',savedTrip:'Trip saved to Atlas Plans',openPlans:'Open Plans',restart:'New plan',copy:'Copy plan',copied:'Plan copied',
  visit:'visit',arrive:'approx.',walkLeg:'walk',carLeg:'drive',transitLeg:'transit',value:v=>'visit value '+v+'/5',approx:'approximate coordinates',near:'nearby',closed:'closed on this day',early:'opens later',late:'may close before you finish',
  stats:(n,h,k)=>n+' places · '+h+' · '+k+' km',remove:'Remove',up:'Up',down:'Down',moveTo:'Move to day',add:'Add a place',addLead:'Closest suggestions not yet in the plan:',noSpare:'No more matching places.',
  short:(d,n)=>'We have '+n+' places in this city so far — enough for '+d+'.',excluded:n=>n+' places skipped (“Don’t recommend”).',
  note:'Walking times are estimates (distance × 1.3), not street routing. The 1–5 visit value is editorial, not from Google. Check opening hours before you go.',
  transitNote:'Google Maps does not support intermediate stops for public transport — the link opens a walking route.',
  mapOffline:'No map tiles (offline) — routes and numbers still work.',schematic:'Schematic map: points at real coordinates, no street layer.',
  guide:'Guide',made:'Made by Tomasz Kmiecik',change:'Change',startAt:'Start'}
};
let lang=(()=>{try{const q=new URLSearchParams(location.search).get('lang');if(q==='en'||q==='pl')return q;return localStorage.getItem('tubylem_lang')==='en'?'en':'pl'}catch(e){return'pl'}})();
const t=()=>T[lang];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hhmm=m=>{m=Math.round(m);return String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0')};
const dur=m=>{m=Math.round(m);const h=Math.floor(m/60),r=m%60;return h?(h+' h'+(r?' '+r+' min':'')):(r+' min')};
const nf=x=>x.toFixed(1).replace('.',lang==='pl'?',':'.');
const name=p=>p.n[lang]||p.n.pl;
const reduced=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}};
function read(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}}
function write(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);

let DATA=null,wheelLock=0;
const S=read('iwh_planner_draft',null)||{};
const st=Object.assign({step:'city',city:null,durTab:'days',days:3,from:'',to:'',top:[],no:[],tempo:'normal',mode:'walking',q:''},S,{step:'city',res:null,day:0,all:false,edit:false,optimize:true,adding:false});
const remember=()=>write('iwh_planner_draft',{city:st.city,durTab:st.durTab,days:st.days,from:st.from,to:st.to,top:st.top,no:st.no,tempo:st.tempo,mode:st.mode});

function setLang(l){lang=l;doc.documentElement.lang=l;try{localStorage.setItem('tubylem_lang',l)}catch(e){}doc.title='I Was Here — '+(l==='en'?'Day-by-day planner':'Planer dzień po dniu');
 const b=doc.getElementById('plLang');if(b){b.querySelectorAll('span').forEach(s=>s.classList.toggle('on',s.dataset.v===l));b.setAttribute('aria-label',l==='en'?'Language: English. Switch to Polish':'Język: polski. Przełącz na angielski')}
 const f=doc.getElementById('plFoot');if(f)f.textContent=t().made;render()}
function toast(msg,link){let el=doc.getElementById('plToast');if(!el){el=doc.createElement('div');el.id='plToast';el.className='pl-toast';el.setAttribute('role','status');doc.body.appendChild(el)}
 el.innerHTML=esc(msg)+(link?' <a href="'+link+'">'+esc(t().openPlans)+'</a>':'');el.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>el.classList.remove('show'),4200)}

const durDays=()=>{if(st.durTab==='dates'&&st.from&&st.to){const d=Math.round((new Date(st.to)-new Date(st.from))/864e5)+1;return Math.max(1,Math.min(7,d||1))}return st.days};
const city=()=>DATA&&DATA.cities.find(c=>c.name===st.city);
const steps=['city','dur','prefs'];
const head=(n,title)=>'<div class="pl-steps" aria-hidden="true">'+steps.map((s,i)=>'<i class="'+(i<n?'on':'')+'"></i>').join('')+'</div><h1>'+esc(title)+'</h1>';
const summary=()=>'<div class="pl-sum">'+(st.city?'<button type="button" data-go="city"><span>📍</span><b>'+esc(st.city)+'</b><small>'+esc(t().change)+'</small></button>':'')+(st.step==='prefs'?'<button type="button" data-go="dur"><span>🗓</span><b>'+esc(t().daysN(durDays()))+'</b><small>'+esc(t().change)+'</small></button>':'')+'</div>';

function vCity(){
 const q=st.q.trim().toLowerCase(),list=DATA.cities.filter(c=>!q||c.name.toLowerCase().includes(q)||(c.regionName&&c.regionName[lang].toLowerCase().includes(q)));
 const row=c=>'<li><button type="button" class="pl-city'+(c.name===st.city?' sel':'')+'" data-city="'+esc(c.name)+'"><span class="pl-flag" aria-hidden="true">'+(c.full?'★':'●')+'</span><span><b>'+esc(c.name)+'</b><small>'+esc(c.regionName?c.regionName[lang]:'')+'</small></span><em>'+esc(t().places(c.count))+'</em></button></li>';
 const full=list.filter(c=>c.full),rest=list.filter(c=>!c.full);
 return head(1,t().title)+'<label class="pl-search"><span class="sr-only">'+esc(t().search)+'</span><input id="plQ" type="search" autocomplete="off" placeholder="'+esc(t().city)+'" value="'+esc(st.q)+'"></label>'+
  (full.length?'<h2 class="pl-h">'+esc(t().full)+'</h2><ul class="pl-list">'+full.map(row).join('')+'</ul>':'')+
  (rest.length?'<h2 class="pl-h">'+esc(t().others)+'</h2><ul class="pl-list">'+rest.map(row).join('')+'</ul>':'')+
  (list.length?'':'<p class="pl-empty">'+esc(t().noCity)+'</p>');
}
function vDur(){
 const max=7,cells=[...Array(max).keys()].map(i=>i+1);
 return head(2,t().howLong)+summary()+'<div class="pl-card"><div class="pl-seg" role="tablist"><button type="button" role="tab" data-dtab="days" aria-selected="'+(st.durTab==='days')+'">'+esc(t().tabDays)+'</button><button type="button" role="tab" data-dtab="dates" aria-selected="'+(st.durTab==='dates')+'">'+esc(t().tabDates)+'</button></div>'+
  (st.durTab==='days'?'<div class="pl-wheel-wrap"><div class="pl-wheel" id="plWheel" tabindex="0" role="listbox" aria-label="'+esc(t().tabDays)+'">'+cells.map(n=>'<div class="pl-wn'+(n===st.days?' on':'')+'" role="option" data-n="'+n+'" aria-selected="'+(n===st.days)+'">'+n+'</div>').join('')+'</div><span class="pl-wheel-unit">'+esc(t().daysN(st.days).replace(/^\d+ /,''))+'</span></div>'
  :'<div class="pl-dates"><label>'+esc(t().from)+'<input type="date" id="plFrom" value="'+esc(st.from)+'"></label><label>'+esc(t().to)+'<input type="date" id="plTo" value="'+esc(st.to)+'"></label><p class="pl-mini">'+esc(t().daysN(durDays()))+' · max 7</p></div>')+
  '</div><div class="pl-cta"><button type="button" class="pl-btn" data-go="prefs">'+esc(t().confirmDur)+'</button></div>';
}
function vPrefs(){
 const cats=Object.keys(DATA.categories).filter(k=>DATA.places.some(p=>p.town===st.city&&p.cats.includes(k))||k!=='geology');
 const chip=(k,zone)=>{const c=DATA.categories[k];return'<li class="pl-chip z-'+zone+'"><span class="pl-ci" aria-hidden="true">'+c.icon+'</span><b>'+esc(c[lang])+'</b>'+
  (zone==='rec'?'<button type="button" data-top="'+k+'" aria-label="'+esc(t().toTop+': '+c[lang])+'">★</button><button type="button" data-no="'+k+'" aria-label="'+esc(t().toNo+': '+c[lang])+'">✕</button>':'<button type="button" data-rec="'+k+'" aria-label="'+esc(t().back+': '+c[lang])+'">↩</button>')+'</li>'};
 const zone=(id,title,keys,extra)=>'<section class="pl-zone zone-'+id+'"><h2>'+(id==='top'?'★ ':id==='no'?'✕ ':'')+esc(title)+(extra?' <small>'+esc(extra)+'</small>':'')+'</h2><ul>'+(keys.length?keys.map(k=>chip(k,id)).join(''):'<li class="pl-ghost">—</li>')+'</ul></section>';
 const rec=cats.filter(k=>!st.top.includes(k)&&!st.no.includes(k));
 const seg=(key,opts)=>'<div class="pl-seg wrap" role="group">'+opts.map(([v,l])=>'<button type="button" data-'+key+'="'+v+'" aria-pressed="'+(st[key]===v)+'">'+esc(l)+'</button>').join('')+'</div>';
 return head(3,t().prefs)+summary()+'<p class="pl-lead">'+esc(t().prefsLead)+'</p>'+zone('top',t().top,st.top,st.top.length+'/3')+zone('rec',t().rec,rec)+zone('no',t().no,st.no)+
  '<h2 class="pl-h">'+esc(t().tempo)+'</h2>'+seg('tempo',[['calm',t().calm],['normal',t().normal],['full',t().fulld]])+
  '<h2 class="pl-h">'+esc(t().mode)+'</h2>'+seg('mode',[['walking','🚶 '+t().walk],['driving','🚗 '+t().car],['transit','🚌 '+t().transit]])+
  '<div class="pl-cta sticky"><button type="button" class="pl-btn" data-go="ask">'+esc(t().create)+'</button></div>';
}
function loopArt(){const c=COLORS;return'<svg class="pl-art" viewBox="0 0 260 150" aria-hidden="true"><rect width="260" height="150" rx="22" fill="#E7ECE9"/><path d="M0 98 C60 80 90 120 150 100 S230 70 260 84" stroke="#C9D6D1" stroke-width="14" fill="none"/>'+
 [[70,62,c[0]],[132,46,c[1]],[190,92,c[2]]].map(([x,y,col],i)=>'<path d="M'+x+' '+y+' q28 -30 52 0 q-6 34 -40 30 q-28 -4 -12 -30" fill="none" stroke="'+col+'" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 7"/>'+[0,1,2].map(j=>'<circle cx="'+(x+[0,52,12][j])+'" cy="'+(y+[0,0,30][j])+'" r="7" fill="'+col+'" stroke="#fff" stroke-width="2"/>').join('')).join('')+'</svg>'}
function vAsk(){return'<div class="pl-modal" role="dialog" aria-modal="true" aria-labelledby="plAskT"><div class="pl-modal-in">'+loopArt()+'<h2 id="plAskT">'+esc(t().askT)+'</h2><p>'+esc(t().askL)+'</p><button type="button" class="pl-btn" data-go="make">✨ '+esc(t().yes)+'</button><button type="button" class="pl-link" data-go="later">'+esc(t().later)+'</button></div></div>'}
function vMake(n){const s=[[t().s1,t().s1d],[t().s2,t().s2d(n)],[t().s3,t().s3d],[t().s4,t().s4d],[t().s5,t().s5d]];
 return'<div class="pl-make"><h1>'+esc(t().making)+'</h1><ol>'+s.map(([a,b],i)=>'<li data-i="'+i+'"><span class="pl-tick" aria-hidden="true"></span><span><b>'+esc(a)+'</b><small>'+esc(b)+'</small></span></li>').join('')+'</ol></div>'}

/* ---------- wynik ---------- */
function vResult(){
 const r=st.res,d=st.day,col=COLORS[d%COLORS.length],stops=r.days[d]||[];
 const tl=timeline(stops,r.mode,9*60,st.durTab==='dates'&&st.from?addDays(st.from,d):null);
 const kmSum=tl.reduce((s,x)=>s+(x.leg?x.leg.km:0),0),mins=tl.length?tl[tl.length-1].leave-tl[0].arrive:0;
 const legW={walking:'🚶 '+t().walkLeg,driving:'🚗 '+t().carLeg,transit:'🚌 '+t().transitLeg}[r.mode];
 const rows=tl.map((x,i)=>{const p=x.p;return(x.leg?'<li class="pl-leg"><span>'+esc(legW)+' · '+esc(dur(x.leg.min))+' · '+nf(x.leg.km)+' km</span></li>':'')+
  '<li class="pl-stop" id="stop-'+i+'"><span class="pl-num" style="--c:'+col+'">'+(i+1)+'</span><div class="pl-sb"><div class="pl-st"><span aria-hidden="true">'+esc(p.icon)+'</span><b>'+esc(name(p))+'</b></div>'+
  '<small>'+esc(t().arrive)+' '+hhmm(x.arrive)+'–'+hhmm(x.leave)+' · '+esc(t().visit)+' '+esc(dur(p.min))+' · '+esc(t().value(p.v))+'</small>'+
  '<div class="pl-tags">'+p.cats.slice(0,3).map(c=>DATA.categories[c]?'<span>'+esc(DATA.categories[c][lang])+'</span>':'').join('')+(p.near?'<span class="warn">'+esc(t().near)+' · '+esc(p.town)+'</span>':'')+(p.approx?'<span class="soft">≈ '+esc(t().approx)+'</span>':'')+'</div>'+
  (p.hours?'<small class="pl-hours">🕘 '+esc(p.hours)+'</small>':'')+(x.warn?'<small class="pl-warn">⚠ '+esc(t()[x.warn])+'</small>':'')+
  (st.edit?'<div class="pl-ed"><button type="button" data-up="'+i+'" aria-label="'+esc(t().up)+'" '+(i?'':'disabled')+'>↑</button><button type="button" data-down="'+i+'" aria-label="'+esc(t().down)+'" '+(i<tl.length-1?'':'disabled')+'>↓</button>'+(r.days.length>1?'<label class="pl-move"><span class="sr-only">'+esc(t().moveTo)+'</span><select data-move="'+i+'"><option value="">'+esc(t().moveTo)+'…</option>'+r.days.map((_,j)=>j===d?'':'<option value="'+j+'">'+esc(t().day)+' '+(j+1)+'</option>').join('')+'</select></label>':'')+'<button type="button" class="del" data-del="'+i+'">'+esc(t().remove)+'</button></div>':'')+
  '</div></li>'}).join('');
 const spare=st.adding?spareList(stops):'';
 const url=mapsUrl(stops,r.mode);
 return'<div class="pl-res"><div class="pl-rhead"><button type="button" class="pl-icon" data-go="prefs" aria-label="'+esc(t().change)+'">‹</button><div><h1>'+esc(r.city)+'</h1><small>'+esc(t().daysN(r.days.length))+' · '+esc({calm:t().calm,normal:t().normal,full:t().fulld}[st.tempo])+'</small></div><button type="button" class="pl-icon" data-go="restart" aria-label="'+esc(t().restart)+'">↺</button></div>'+
  '<div class="pl-mapbox"><div id="plMap" class="pl-map" role="img" aria-label="'+esc(r.city)+'"></div><button type="button" class="pl-all'+(st.all?' on':'')+'" data-all aria-pressed="'+st.all+'">'+esc(t().all)+'</button><p class="pl-mapnote" id="plMapNote" hidden></p></div>'+
  '<div class="pl-sheet"><div class="pl-days" role="tablist">'+r.days.map((_,i)=>'<button type="button" role="tab" data-day="'+i+'" aria-selected="'+(i===d&&!st.all)+'" style="--c:'+COLORS[i%COLORS.length]+'">'+esc(t().day)+' '+(i+1)+'</button>').join('')+'</div>'+
  '<div class="pl-dayhead"><button type="button" class="pl-icon sm" data-day="'+Math.max(0,d-1)+'" '+(d?'':'disabled')+' aria-label="‹">‹</button><div><b style="color:'+col+'">'+esc(t().day)+' '+(d+1)+(st.durTab==='dates'&&st.from?' · '+esc(fmtDate(addDays(st.from,d))):'')+'</b><small>'+esc(t().stats(stops.length,dur(mins),nf(kmSum)))+'</small></div><button type="button" class="pl-icon sm" data-day="'+Math.min(r.days.length-1,d+1)+'" '+(d<r.days.length-1?'':'disabled')+' aria-label="›">›</button></div>'+
  '<div class="pl-tools"><label class="pl-switch"><input type="checkbox" id="plOpt" '+(st.optimize?'checked':'')+'><span></span>'+esc(t().optimize)+'</label><button type="button" class="pl-chipbtn'+(st.edit?' on':'')+'" data-edit>'+esc(st.edit?t().done:t().edit)+'</button></div>'+
  '<ol class="pl-stops">'+rows+'</ol>'+
  (st.edit?'<button type="button" class="pl-ghostbtn" data-add>+ '+esc(t().add)+'</button>'+spare:'')+
  '<div class="pl-actions">'+(url?'<a class="pl-btn" href="'+url+'" target="_blank" rel="noopener">🧭 '+esc(t().maps)+'</a>':'')+'<button type="button" class="pl-btn alt" data-save>'+esc(t().save)+'</button><button type="button" class="pl-link" data-copy>'+esc(t().copy)+'</button></div>'+
  '<div class="pl-notes">'+(r.short?'<p>ℹ︎ '+esc(t().short(t().daysN(r.days.length),r.pool))+'</p>':'')+(r.excluded?'<p>'+esc(t().excluded(r.excluded))+'</p>':'')+(r.mode==='transit'?'<p>'+esc(t().transitNote)+'</p>':'')+(root.L?'':'<p>'+esc(t().schematic)+'</p>')+'<p>'+esc(t().note)+'</p></div></div></div>';
}
function spareList(stops){
 const r=st.res,used=new Set(r.days.flat().map(p=>p.id));
 const c=stops.length?{lat:stops.reduce((s,p)=>s+p.lat,0)/stops.length,lon:stops.reduce((s,p)=>s+p.lon,0)/stops.length}:city();
 const list=r.spare.filter(p=>!used.has(p.id)).sort((a,b)=>km(c,a)-km(c,b)).slice(0,6);
 return'<div class="pl-spare"><p>'+esc(list.length?t().addLead:t().noSpare)+'</p>'+list.map(p=>'<button type="button" data-addp="'+esc(p.id)+'"><span aria-hidden="true">'+esc(p.icon)+'</span><b>'+esc(name(p))+'</b><small>'+nf(km(c,p))+' km · '+esc(dur(p.min))+'</small></button>').join('')+'</div>';
}
const addDays=(iso,n)=>{const d=new Date(iso+'T12:00:00');d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
const fmtDate=iso=>{try{return new Date(iso+'T12:00:00').toLocaleDateString(lang==='en'?'en-GB':'pl-PL',{weekday:'short',day:'numeric',month:'short'})}catch(e){return iso}};

/* ---------- mapa ---------- */
let lmap=null,llayer=null;
function drawMap(){
 const el=doc.getElementById('plMap');if(!el||!st.res)return;
 const r=st.res,show=st.all?r.days.map((_,i)=>i):[st.day];
 const sets=show.map(i=>({i,stops:r.days[i]||[],col:COLORS[i%COLORS.length]}));
 if(root.L&&!drawMap.svgOnly){try{return leaflet(el,sets)}catch(e){drawMap.svgOnly=true}}
 svgMap(el,sets);
}
function leaflet(el,sets){
 if(!lmap||lmap.getContainer()!==el){lmap=root.L.map(el,{zoomControl:true,attributionControl:true});
  const tl=root.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(lmap);
  let errs=0;tl.on('tileerror',()=>{if(++errs===3){const n=doc.getElementById('plMapNote');if(n){n.textContent=t().mapOffline;n.hidden=false}}});
  llayer=root.L.layerGroup().addTo(lmap)}
 llayer.clearLayers();const b=[];
 sets.forEach(s=>{const ll=s.stops.map(p=>[p.lat,p.lon]);b.push(...ll);
  if(ll.length>1){root.L.polyline(ll,{color:'#fff',weight:8,opacity:.9}).addTo(llayer);root.L.polyline(ll,{color:s.col,weight:4.5,opacity:.95}).addTo(llayer)}
  s.stops.forEach((p,i)=>root.L.marker([p.lat,p.lon],{title:name(p),icon:root.L.divIcon({className:'pl-pin',html:'<span style="--c:'+s.col+'">'+(i+1)+'</span>',iconSize:[28,28],iconAnchor:[14,14]})}).on('click',()=>pick(s.i,i)).addTo(llayer))});
 lmap.invalidateSize();if(b.length)lmap.fitBounds(b,{padding:[34,34],maxZoom:16});
 setTimeout(()=>{if(!lmap)return;lmap.invalidateSize();if(b.length)lmap.fitBounds(b,{padding:[34,34],maxZoom:16})},80);
}
function svgMap(el,sets){
 const W=el.clientWidth||360,H=el.clientHeight||300,all=sets.flatMap(s=>s.stops);
 if(!all.length){el.innerHTML='';return}
 const k=Math.cos(all[0].lat*RAD);let x0=Math.min(...all.map(p=>p.lon*k)),x1=Math.max(...all.map(p=>p.lon*k)),y0=Math.min(...all.map(p=>p.lat)),y1=Math.max(...all.map(p=>p.lat));
 const minSpan=0.004;if(x1-x0<minSpan){x0-=minSpan/2;x1+=minSpan/2}if(y1-y0<minSpan){y0-=minSpan/2;y1+=minSpan/2}
 const px=36,pt=64,pb=56,sc=Math.min((W-2*px)/(x1-x0),(H-pt-pb)/(y1-y0)),ox=(W-(x1-x0)*sc)/2,oy=pt+((H-pt-pb)-(y1-y0)*sc)/2;
 const X=p=>ox+(p.lon*k-x0)*sc,Y=p=>oy+(y1-p.lat)*sc;
 const kmPx=sc/111.32;let step=[0.25,0.5,1,2,5,10,20][0];for(const s of [0.25,0.5,1,2,5,10,20])if(s*kmPx<W/3)step=s;
 let grid='';const g=step*kmPx;if(g>18){for(let x=(ox%g);x<W;x+=g)grid+='<line x1="'+x.toFixed(1)+'" y1="0" x2="'+x.toFixed(1)+'" y2="'+H+'"/>';for(let y=(oy%g);y<H;y+=g)grid+='<line x1="0" y1="'+y.toFixed(1)+'" x2="'+W+'" y2="'+y.toFixed(1)+'"/>'}
 const paths=sets.map(s=>s.stops.length>1?'<polyline points="'+s.stops.map(p=>X(p).toFixed(1)+','+Y(p).toFixed(1)).join(' ')+'" class="cas"/><polyline points="'+s.stops.map(p=>X(p).toFixed(1)+','+Y(p).toFixed(1)).join(' ')+'" stroke="'+s.col+'" class="rt"/>':'').join('');
 const pins=sets.map(s=>s.stops.map((p,i)=>'<g class="pin" data-pin="'+s.i+':'+i+'" transform="translate('+X(p).toFixed(1)+' '+Y(p).toFixed(1)+')" tabindex="0" role="button" aria-label="'+esc((i+1)+'. '+name(p))+'"><circle r="12" fill="'+s.col+'"/><text y="4.5">'+(i+1)+'</text></g>').join('')).join('');
 el.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'"><rect width="'+W+'" height="'+H+'" class="bg"/><g class="grid">'+grid+'</g>'+paths+pins+
  '<g class="scale" transform="translate(12 '+(H-30)+')"><line x1="0" y1="0" x2="'+(step*kmPx).toFixed(1)+'" y2="0"/><text x="'+(step*kmPx/2).toFixed(1)+'" y="-6">'+(step<1?step*1000+' m':step+' km')+'</text></g><text class="north" x="'+(W-16)+'" y="22">N</text></svg>';
}
function pick(day,i){if(st.all){st.all=false;st.day=day;render();}const e=doc.getElementById('stop-'+i);if(e){e.scrollIntoView({behavior:reduced()?'auto':'smooth',block:'center'});e.classList.add('flash');setTimeout(()=>e.classList.remove('flash'),1200)}}

/* ---------- render i zdarzenia ---------- */
function render(){
 if(!DATA)return;
 if(st.step!=='result'){if(lmap){lmap.remove();lmap=null}}
 const v={city:vCity,dur:vDur,prefs:vPrefs,ask:()=>vPrefs()+vAsk(),result:vResult}[st.step]||vCity;
 main.innerHTML=v();
 if(st.step==='dur'&&st.durTab==='days'){const w=doc.getElementById('plWheel'),on=w&&w.querySelector('.on');if(on){wheelLock=Date.now()+300;w.scrollTop=on.offsetTop-w.clientHeight/2+on.clientHeight/2}}
 if(st.step==='result')requestAnimationFrame(drawMap);
 if(st.step==='ask'){const b=main.querySelector('.pl-modal .pl-btn');if(b)b.focus()}
}
function make(){
 st.step='make';const r=plan(DATA,{city:st.city,days:durDays(),tempo:st.tempo,mode:st.mode,top:st.top,no:st.no,optimize:st.optimize});
 main.innerHTML=vMake(r.pool);const lis=main.querySelectorAll('.pl-make li'),gap=reduced()?60:520;
 lis.forEach((li,i)=>setTimeout(()=>li.classList.add('done'),gap*(i+1)));
 setTimeout(()=>{st.res=r;st.day=0;st.all=false;st.edit=false;st.adding=false;st.step='result';render();main.scrollIntoView({block:'start'})},gap*(lis.length+1));
}
function relayout(d){const r=st.res;if(st.optimize)r.days[d]=order(r.days[d],r.mode,true)}
function saveDays(){
 const r=st.res,all=read('iwh_days',[]),now=new Date().toISOString();
 const item=p=>p.k==='waw'?{t:'waw',id:p.id,name:p.n.pl,lat:p.lat,lon:p.lon}:{t:'place',id:p.id};
 r.days.forEach((stops,i)=>{all.unshift({id:uid(),name:(r.city+' — '+t().day+' '+(i+1)).slice(0,60),date:st.durTab==='dates'&&st.from?addDays(st.from,i):'',start:'09:00',mode:r.mode==='walking'?'walking':undefined,created:now,items:stops.map(item)})});
 if(write('iwh_days',all))toast(t().saved,'./atlas.html?tab=plans&lang='+lang);
}
function saveTrip(){
 const r=plan(DATA,{city:st.city,days:durDays(),tempo:st.tempo,mode:st.mode,top:st.top,no:st.no,optimize:true});
 const all=read('iwh_trips',[]),item=p=>p.k==='waw'?{t:'waw',id:p.id,name:p.n.pl,lat:p.lat,lon:p.lon}:{t:'place',id:p.id};
 all.unshift({id:uid(),name:(st.city+' · '+t().daysN(durDays())).slice(0,60),created:new Date().toISOString(),items:r.days.flat().map(item)});
 if(write('iwh_trips',all))toast(t().savedTrip,'./atlas.html?tab=plans&lang='+lang);
}
function planText(){const r=st.res;return r.city+'\n'+r.days.map((s,i)=>t().day+' '+(i+1)+':\n'+timeline(s,r.mode,540,null).map((x,j)=>'  '+(j+1)+'. '+hhmm(x.arrive)+' '+name(x.p)).join('\n')).join('\n')}

main.addEventListener('click',e=>{
 const b=e.target.closest('button,[data-pin]');if(!b)return;const ds=b.dataset;
 if(ds.city){st.city=ds.city;st.step='dur';remember();render();return}
 if(ds.dtab){st.durTab=ds.dtab;if(ds.dtab==='dates'&&!st.from){const d=new Date();st.from=d.toISOString().slice(0,10);st.to=addDays(st.from,st.days-1)}remember();render();return}
 if(ds.top){if(st.top.length>=3){toast(t().max3);return}st.top.push(ds.top);remember();render();return}
 if(ds.no){st.no.push(ds.no);remember();render();return}
 if(ds.rec){st.top=st.top.filter(k=>k!==ds.rec);st.no=st.no.filter(k=>k!==ds.rec);remember();render();return}
 if(ds.tempo){st.tempo=ds.tempo;remember();render();return}
 if(ds.mode){st.mode=ds.mode;remember();render();return}
 if(ds.go){const g=ds.go;
  if(g==='make'){make();return}
  if(g==='later'){saveTrip();st.step='prefs';render();return}
  if(g==='restart'){st.step='city';st.res=null;render();return}
  st.step=g;render();if(g!=='ask')main.scrollIntoView({block:'start'});return}
 if(ds.day!==undefined){st.day=+ds.day;st.all=false;st.adding=false;render();return}
 if(ds.all!==undefined){st.all=!st.all;render();return}
 if(ds.edit!==undefined){st.edit=!st.edit;st.adding=false;render();return}
 if(ds.add!==undefined){st.adding=!st.adding;render();return}
 if(ds.pin){const[a,i]=ds.pin.split(':').map(Number);pick(a,i);return}
 const r=st.res,d=st.day;
 if(ds.up){const i=+ds.up,s=r.days[d];[s[i-1],s[i]]=[s[i],s[i-1]];st.optimize=false;render();return}
 if(ds.down){const i=+ds.down,s=r.days[d];[s[i+1],s[i]]=[s[i],s[i+1]];st.optimize=false;render();return}
 if(ds.del){const p=r.days[d].splice(+ds.del,1)[0];if(p)r.spare.unshift(p);if(!r.days[d].length&&r.days.length>1){r.days.splice(d,1);st.day=Math.max(0,d-1)}render();return}
 if(ds.addp){const p=r.spare.find(x=>x.id===ds.addp);if(p){r.days[d].push(p);r.spare=r.spare.filter(x=>x!==p);relayout(d)}render();return}
 if(ds.save!==undefined){saveDays();return}
 if(ds.copy!==undefined){const txt=planText();try{navigator.clipboard.writeText(txt).then(()=>toast(t().copied),()=>toast(txt.slice(0,80)+'…'))}catch(err){toast(txt.slice(0,80)+'…')}return}
});
main.addEventListener('keydown',e=>{const g=e.target.closest('[data-pin]');if(g&&(e.key==='Enter'||e.key===' ')){e.preventDefault();g.click()}
 if(e.target.id==='plWheel'&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();st.days=Math.max(1,Math.min(7,st.days+(e.key==='ArrowDown'?1:-1)));remember();render();doc.getElementById('plWheel').focus()}});
main.addEventListener('input',e=>{if(e.target.id==='plQ'){st.q=e.target.value;const pos=e.target.selectionStart;render();const i=doc.getElementById('plQ');i.focus();try{i.setSelectionRange(pos,pos)}catch(err){}}});
main.addEventListener('change',e=>{const el=e.target;
 if(el.id==='plFrom'||el.id==='plTo'){st[el.id==='plFrom'?'from':'to']=el.value;if(st.from&&st.to&&st.to<st.from)st.to=st.from;if(st.from&&st.to&&durDays()===7)st.to=addDays(st.from,6);remember();render();return}
 if(el.id==='plOpt'){st.optimize=el.checked;const r=st.res;r.days=r.days.map(s=>order(s,r.mode,st.optimize));render();return}
 if(el.dataset.move){const to=+el.value;if(isNaN(to)||el.value==='')return;const r=st.res,p=r.days[st.day].splice(+el.dataset.move,1)[0];r.days[to].push(p);relayout(to);if(!r.days[st.day].length){r.days.splice(st.day,1);st.day=Math.min(to,r.days.length-1)}render()}
});
// koło wyboru dni: zatrzaskiwanie przewijania wybiera liczbę
main.addEventListener('scroll',e=>{const w=e.target;if(w.id!=='plWheel'||Date.now()<wheelLock)return;clearTimeout(w._t);w._t=setTimeout(()=>{const mid=w.scrollTop+w.clientHeight/2;let best=null,bd=1e9;w.querySelectorAll('.pl-wn').forEach(c=>{const d=Math.abs(c.offsetTop+c.clientHeight/2-mid);if(d<bd){bd=d;best=c}});if(best&&+best.dataset.n!==st.days){st.days=+best.dataset.n;remember();w.querySelectorAll('.pl-wn').forEach(c=>{const on=c===best;c.classList.toggle('on',on);c.setAttribute('aria-selected',on)});const u=main.querySelector('.pl-wheel-unit');if(u)u.textContent=t().daysN(st.days).replace(/^\d+ /,'')}},90)},true);
main.addEventListener('click',e=>{const c=e.target.closest('.pl-wn');if(c){const w=doc.getElementById('plWheel');if(w)clearTimeout(w._t);st.days=+c.dataset.n;remember();render()}});
let rt;root.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{if(st.step==='result'&&!lmap)drawMap()},120)});
const lb=doc.getElementById('plLang');if(lb)lb.addEventListener('click',()=>setLang(lang==='pl'?'en':'pl'));

function start(d){DATA=d;if(st.city&&!DATA.cities.some(c=>c.name===st.city))st.city=null;
 const q=new URLSearchParams(location.search).get('city');if(q&&DATA.cities.some(c=>c.name===q)){st.city=q;st.step='dur'}else if(q){st.q=q}
 setLang(lang)}
if(root.IWH_PLANNER_DATA)start(root.IWH_PLANNER_DATA);
else fetch('./data/planer.json').then(r=>r.json()).then(start).catch(()=>{main.innerHTML='<p class="pl-empty">⚠ data/planer.json</p>'});
})(typeof window!=='undefined'?window:globalThis);

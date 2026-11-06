(function(){
const style=document.createElement('style');style.textContent=`#polandHome{margin:0 0 22px;border-radius:24px;overflow:hidden;background:#e6efe6;border:1px solid #ccd9d1}#polandHome .poland-title{padding:17px 19px;background:linear-gradient(120deg,#163e45,#39695e);color:white}#polandHome .poland-title h2{font:normal 29px Georgia,serif;margin:0}#polandHome .poland-title p{font-size:12px;color:#d9e8df}#polandMap{height:380px;background:#dbe9df}#polandHome .poland-actions{display:flex;gap:8px;padding:10px;background:var(--panel)}#polandHome button{border:0;border-radius:12px;background:var(--primary);color:white;padding:11px;font-weight:750}#polandHome .poland-note{font-size:11px;color:var(--sub);padding:0 12px 12px}#polandHome.fullscreen{position:fixed;inset:0;z-index:3500;border:0;border-radius:0;display:flex;flex-direction:column;margin:0}#polandHome.fullscreen #polandMap{flex:1;height:auto;min-height:0}#polandHome.fullscreen .poland-title{padding-top:calc(12px + env(safe-area-inset-top,0px))}#polandHome.fullscreen .poland-actions{padding-bottom:calc(12px + env(safe-area-inset-bottom,0px))}.p-city-label{background:#fffdf4;border:1px solid #9bb7a7;color:#24483f;border-radius:10px;padding:5px 8px;box-shadow:0 3px 10px #18372a22;font-size:12px;font-weight:800;white-space:nowrap}#smartOptions{border:1px solid var(--line);border-radius:18px;background:var(--panel);padding:15px;margin:12px 0}#smartOptions label{font-size:12px;font-weight:750;display:block;margin-bottom:8px}#smartOptions select{width:100%;padding:11px;border:1px solid var(--line);border-radius:11px;background:var(--bg);color:var(--ink)}#smartOptions p{font-size:11px;color:var(--sub);line-height:1.5}`;document.head.appendChild(style);
const cities=[['Warszawa',52.2297,21.0122,true],['Kraków',50.0647,19.9450],['Gdańsk',54.352,18.6466],['Wrocław',51.1079,17.0385],['Poznań',52.4064,16.9252],['Łódź',51.7592,19.455],['Lublin',51.2465,22.5684],['Toruń',53.0138,18.5984],['Szczecin',53.4285,14.5528],['Zakopane',49.2992,19.9496],['Białystok',53.1325,23.1688],['Rzeszów',50.0412,21.9991],['Katowice',50.2649,19.0238]];
const home=document.createElement('section');home.id='polandHome';home.setAttribute('aria-label','Mapa Polski i wybór miast');
home.innerHTML='<div class="poland-title"><h2>Tu Byłem</h2><p>Miejsca i Wspomnienia · Odkrywaj Polskę</p></div><div id="polandMap" aria-label="Interaktywna mapa Polski"></div><div class="poland-actions"><button id="polandFull" type="button">⛶ Pełny ekran</button><button id="polandReset" type="button">⌖ Cała Polska</button></div><p class="poland-note">Wybierz miasto. Szczegółowy przewodnik jest obecnie dostępny dla Warszawy; pozostałe miasta przygotowujemy.</p>';
const hero=document.querySelector('.hero');if(hero)hero.before(home);
if(typeof L!=='undefined'){
const m=L.map('polandMap',{zoomControl:true,scrollWheelZoom:false}).setView([52.05,19.15],6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',maxZoom:18}).addTo(m);
cities.forEach(([name,lat,lon,ready])=>{
const marker=L.marker([lat,lon],{icon:L.divIcon({className:'',html:'<span class="p-city-label">'+name+'</span>',iconSize:[90,28],iconAnchor:[45,14]})}).addTo(m);
marker.on('click',()=>{if(ready){home.classList.remove('fullscreen');document.body.style.overflow='';setTimeout(()=>document.querySelector('#mapSection')?.scrollIntoView({behavior:'smooth'}),120);}else{m.flyTo([lat,lon],10,{duration:.8});marker.bindPopup('<strong>'+name+'</strong><p>Przewodnik po tym mieście w przygotowaniu.</p>').openPopup();}});
});
document.querySelector('#polandFull').addEventListener('click',()=>{const full=home.classList.toggle('fullscreen');document.body.style.overflow=full?'hidden':'';document.querySelector('#polandFull').textContent=full?'✕ Zamknij mapę':'⛶ Pełny ekran';setTimeout(()=>m.invalidateSize(),100);});
document.querySelector('#polandReset').addEventListener('click',()=>m.flyTo([52.05,19.15],6));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&home.classList.contains('fullscreen'))document.querySelector('#polandFull').click()});
}else document.querySelector('#polandMap').textContent='Mapa wymaga połączenia z internetem.';
const opt=document.createElement('section');opt.id='smartOptions';opt.innerHTML='<label for="smartPriority">🧠 Inteligentna kolejność zwiedzania</label><select id="smartPriority"><option value="best">Najciekawsze dostępne w godzinach zwiedzania</option><option value="hidden">Najpierw mniej znane miejsca</option><option value="close">Najkrótsze dojazdy</option></select><p>Planer uwzględnia znane harmonogramy i szacowany czas przejazdu. Sprawdź aktualne godziny i ostatnie wejście na stronie obiektu. To algorytm planowania, nie usługa AI na żywo.</p>';
document.querySelector('#routeSection')?.before(opt);
const s=document.querySelector('#smartPriority');s.value=localStorage.getItem('tubylem_priority')||'best';const existing=document.querySelector('#priority');if(existing){existing.value=s.value;existing.dispatchEvent(new Event('change',{bubbles:true}));}s.addEventListener('change',()=>{localStorage.setItem('tubylem_priority',s.value);const existing=document.querySelector('#priority');if(existing){existing.value=s.value;existing.dispatchEvent(new Event('change',{bubbles:true}));}});
})();

/* Tu Byłem 4.0 — language, trip library and calendar export */
(function(){
'use strict';
const css=document.createElement('style');
css.textContent=`
.tb-controls{display:flex;gap:7px;align-items:center}.tb-controls button{border:1px solid var(--line);background:var(--panel);color:var(--ink);border-radius:13px;min-width:43px;min-height:43px;font-weight:800}
#tbTrips{margin:14px 0;padding:16px;border-radius:19px;border:1px solid var(--line);background:var(--panel)}
#tbTrips h2{font-size:19px;margin:0 0 8px}#tbTrips p{font-size:12px;color:var(--sub);line-height:1.5}
.tb-actions{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.tb-actions button,.tb-actions a{background:var(--primary);color:white;border:0;border-radius:12px;padding:11px 13px;font-size:12px;font-weight:700}
.tb-trip{border-top:1px solid var(--line);padding:12px 0}.tb-trip strong{display:block}.tb-trip small{color:var(--sub)}.tb-trip button{margin:5px 5px 0 0;border:1px solid var(--line);background:var(--glass);color:var(--ink);padding:8px;border-radius:9px}
#polandHome.tb-atlas #polandMap{filter:saturate(.76) sepia(.13) hue-rotate(16deg)}
#polandHome.tb-night #polandMap{filter:invert(.88) hue-rotate(165deg) brightness(.85)}
#polandHome.tb-terrain #polandMap{filter:saturate(.8) contrast(1.08)}
#polandHome .poland-actions{flex-wrap:wrap}#polandHome .poland-actions select{border:1px solid var(--line);border-radius:11px;background:var(--panel);color:var(--ink);padding:10px}
`;document.head.appendChild(css);
const dict={
pl:{lang:'English',title:'Moje wycieczki',save:'♡ Zapisz wycieczkę',calendar:'📅 Dodaj do kalendarza',empty:'Nie masz jeszcze zapisanych wycieczek.',saved:'Wycieczka zapisana na tym urządzeniu.',noRoute:'Najpierw zaplanuj trasę z atrakcjami.',remove:'Usuń',export:'Kalendarz',load:'Przywróć ustawienia',theme:'Styl mapy',full:'Pełny ekran',close:'Zamknij mapę',reset:'Cała Polska',note:'Wybierz miasto. Przewodnik jest dostępny dla Warszawy; pozostałe miasta są w przygotowaniu.',priority:'Inteligentna kolejność zwiedzania',best:'Najciekawsze dostępne w godzinach zwiedzania',hidden:'Najpierw mniej znane miejsca',closeby:'Najkrótsze dojazdy',caution:'Godziny i dojazdy są szacunkowe. Sprawdź je przed wyjazdem.',soon:'Przewodnik po tym mieście w przygotowaniu.',atlas:'Atlas',night:'Noc',terrain:'Teren',subtitle:'Miejsca i Wspomnienia · Odkrywaj Polskę',calendarHint:'Plik .ics można otworzyć w Kalendarzu Apple lub innej aplikacji kalendarza.',day:'Plan dnia',places:'Miejsca warte uwagi'},
en:{lang:'Polski',title:'My trips',save:'♡ Save trip',calendar:'📅 Add to calendar',empty:'No saved trips yet.',saved:'Trip saved on this device.',noRoute:'Plan a route with attractions first.',remove:'Delete',export:'Calendar',load:'Restore settings',theme:'Map style',full:'Full screen',close:'Close map',reset:'All Poland',note:'Select a city. Warsaw has a detailed guide; other cities are coming soon.',priority:'Smart sightseeing order',best:'Top attractions within opening hours',hidden:'Discover less-known places first',closeby:'Shortest travel distances',caution:'Opening hours and travel times are estimates. Verify before visiting.',soon:'Guide for this city is coming soon.',atlas:'Atlas',night:'Night',terrain:'Terrain',subtitle:'Places and Memories · Explore Poland',calendarHint:'Open the .ics file in Apple Calendar or another calendar app.',day:'Day plan',places:'Places to discover'}};
let language=localStorage.getItem('tb_lang')==='en'?'en':'pl';
let mapStyle=localStorage.getItem('tb_map_style')||'atlas';
const t=k=>dict[language][k]||k;
const top=document.querySelector('.top-actions');
if(top){const wrap=document.createElement('div');wrap.className='tb-controls';wrap.innerHTML='<button type="button" id="tbLanguage" aria-label="Change language">EN</button>';top.prepend(wrap);document.querySelector('#tbLanguage').onclick=()=>{language=language==='pl'?'en':'pl';localStorage.setItem('tb_lang',language);applyLanguage()};}
const actions=document.querySelector('#polandHome .poland-actions');
if(actions){const select=document.createElement('select');select.id='tbMapStyle';select.setAttribute('aria-label','Map style');select.innerHTML='<option value="atlas">🎨 Atlas</option><option value="night">🌙 Night</option><option value="terrain">⛰ Terrain</option>';actions.appendChild(select);select.value=mapStyle;select.onchange=()=>{mapStyle=select.value;localStorage.setItem('tb_map_style',mapStyle);applyMapStyle()};}
function applyMapStyle(){const h=document.querySelector('#polandHome');if(h){h.classList.remove('tb-atlas','tb-night','tb-terrain');h.classList.add('tb-'+mapStyle)}}
function setText(q,v){const el=document.querySelector(q);if(el)el.textContent=v}
function applyLanguage(){
document.documentElement.lang=language;
setText('#tbLanguage',language==='pl'?'EN':'PL');
setText('#polandHome .poland-title p',t('subtitle'));
setText('#polandHome .poland-note',t('note'));
setText('#polandReset','⌖ '+t('reset'));
setText('#polandFull',document.querySelector('#polandHome')?.classList.contains('fullscreen')?'✕ '+t('close'):'⛶ '+t('full'));
setText('#smartOptions label','🧠 '+t('priority'));
setText('#smartOptions p',t('caution'));
const opts=document.querySelectorAll('#smartPriority option');if(opts.length>=3){opts[0].textContent=t('best');opts[1].textContent=t('hidden');opts[2].textContent=t('closeby')}
const s=document.querySelector('#tbMapStyle');if(s){s.options[0].textContent='🎨 '+t('atlas');s.options[1].textContent='🌙 '+t('night');s.options[2].textContent='⛰ '+t('terrain');s.setAttribute('aria-label',t('theme'))}
setText('#tbTrips h2','📚 '+t('title'));setText('#tbSaveTrip',t('save'));setText('#tbCalendarNow',t('calendar'));setText('#tbCalendarHint',t('calendarHint'));renderTrips();
}
const tripSection=document.createElement('section');tripSection.id='tbTrips';
tripSection.innerHTML='<h2></h2><p id="tbCalendarHint"></p><div class="tb-actions"><button id="tbSaveTrip" type="button"></button><button id="tbCalendarNow" type="button"></button></div><p id="tbTripStatus" role="status"></p><div id="tbTripList"></div>';
document.querySelector('#routeSection')?.after(tripSection);
const readTrips=()=>{try{const a=JSON.parse(localStorage.getItem('tb_saved_trips')||'[]');return Array.isArray(a)?a:[]}catch(e){return []}};
const saveTrips=a=>localStorage.setItem('tb_saved_trips',JSON.stringify(a));
function snapshot(){
const st=window.state;
if(!st||!Array.isArray(st.route)||!st.route.length)return null;
const date=st.date||new Date().toISOString().slice(0,10),clock=document.querySelector('#visitClock')?.value||'10:00';
const duration=Number(st.duration)||4;
return {id:String(Date.now()),name:document.querySelector('#routeTitle')?.textContent||'Tu Byłem',date,clock,duration,mode:st.mode||'walking',stops:st.route.map(p=>({id:p.id,name:p.name,lat:p.lat,lon:p.lon})),savedAt:new Date().toISOString()};
}
function calendarFile(trip){
const esc=x=>String(x||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
const start=new Date(trip.date+'T'+trip.clock+':00');if(isNaN(start))return;
const end=new Date(start.getTime()+trip.duration*3600000);
const fmt=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('')+'T'+[d.getHours(),d.getMinutes(),d.getSeconds()].map(n=>String(n).padStart(2,'0')).join('');
const desc=trip.stops.map((p,i)=>(i+1)+'. '+p.name).join('\n')+'\nTimes are estimates; verify opening hours.';
const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Tu Bylem//Trips//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:'+trip.id+'@tubylem.local','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'').replace(/Z$/,'Z'),'DTSTART;TZID=Europe/Warsaw:'+fmt(start),'DTEND;TZID=Europe/Warsaw:'+fmt(end),'SUMMARY:'+esc(trip.name),'DESCRIPTION:'+esc(desc),'END:VEVENT','END:VCALENDAR'].join('\r\n');
const url=URL.createObjectURL(new Blob([ics],{type:'text/calendar;charset=utf-8'}));
const a=document.createElement('a');a.href=url;a.download='tu-bylem-'+trip.date+'.ics';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),15000);
}
function renderTrips(){
const list=document.querySelector('#tbTripList');if(!list)return;
const trips=readTrips();list.replaceChildren();
if(!trips.length){const p=document.createElement('p');p.textContent=t('empty');list.appendChild(p);return}
trips.forEach(trip=>{
const div=document.createElement('div');div.className='tb-trip';
const name=document.createElement('strong');name.textContent=trip.name;
const info=document.createElement('small');info.textContent=trip.date+' · '+trip.clock+' · '+trip.stops.length+' '+(language==='pl'?'punktów':'stops');
const cal=document.createElement('button');cal.textContent='📅 '+t('export');cal.onclick=()=>calendarFile(trip);
const restore=document.createElement('button');restore.textContent=t('load');restore.onclick=()=>{const d=document.querySelector('#visitDate'),c=document.querySelector('#visitClock'),duration=document.querySelector('#duration');if(d){d.value=trip.date;d.dispatchEvent(new Event('change',{bubbles:true}))}if(c){c.value=trip.clock;c.dispatchEvent(new Event('change',{bubbles:true}))}if(duration){duration.value=trip.duration;duration.dispatchEvent(new Event('input',{bubbles:true}))}document.querySelector('#routeSection')?.scrollIntoView({behavior:'smooth'});document.querySelector('#tbTripStatus').textContent=language==='pl'?'Przywrócono datę i czas. Przelicz trasę, aby odtworzyć aktualny plan.':'Date and time restored. Recalculate to create a current route.'};
const del=document.createElement('button');del.textContent=t('remove');del.onclick=()=>{saveTrips(readTrips().filter(x=>x.id!==trip.id));renderTrips()};
div.append(name,info,document.createElement('br'),cal,restore,del);list.appendChild(div);
});
}
document.querySelector('#tbSaveTrip')?.addEventListener('click',()=>{const trip=snapshot();if(!trip){setText('#tbTripStatus',t('noRoute'));return}const all=readTrips();all.unshift(trip);try{saveTrips(all);setText('#tbTripStatus',t('saved'));renderTrips()}catch(e){setText('#tbTripStatus',language==='pl'?'Nie można zapisać — pamięć przeglądarki jest pełna.':'Cannot save — browser storage is full.')}});
document.querySelector('#tbCalendarNow')?.addEventListener('click',()=>{const trip=snapshot();if(!trip){setText('#tbTripStatus',t('noRoute'));return}calendarFile(trip)});
applyMapStyle();applyLanguage();
})();

/* I Was Here 5.1: dawne pole #smartOptions dublowało „Priorytet” w planerze — usunięte. */

/* I Was Here — trip library and calendar export (language follows tubylem_lang) */
(function(){
'use strict';
const css=document.createElement('style');
css.textContent=`
#tbTrips{margin:14px 0;padding:16px;border-radius:19px;border:1px solid var(--line);background:var(--panel)}
#tbTrips h2{font-size:19px;margin:0 0 8px}#tbTrips p{font-size:12px;color:var(--sub);line-height:1.5}
.tb-actions{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.tb-actions button,.tb-actions a{background:var(--primary);color:white;border:0;border-radius:12px;padding:11px 13px;font-size:12px;font-weight:700}
.tb-trip{border-top:1px solid var(--line);padding:12px 0}.tb-trip strong{display:block}.tb-trip small{color:var(--sub)}.tb-trip button{margin:5px 5px 0 0;border:1px solid var(--line);background:var(--glass);color:var(--ink);padding:8px;border-radius:9px}
`;document.head.appendChild(css);
const dict={
pl:{lang:'English',title:'Moje wycieczki',save:'♡ Zapisz wycieczkę',calendar:'📅 Dodaj do kalendarza',empty:'Nie masz jeszcze zapisanych wycieczek.',saved:'Wycieczka zapisana na tym urządzeniu.',noRoute:'Najpierw zaplanuj trasę z atrakcjami.',remove:'Usuń',export:'Kalendarz',load:'Przywróć ustawienia',theme:'Styl mapy',full:'Pełny ekran',close:'Zamknij mapę',reset:'Cała Polska',note:'Wybierz miasto. Przewodnik jest dostępny dla Warszawy; pozostałe miasta są w przygotowaniu.',priority:'Inteligentna kolejność zwiedzania',best:'Najciekawsze dostępne w godzinach zwiedzania',hidden:'Najpierw mniej znane miejsca',closeby:'Najkrótsze dojazdy',caution:'Godziny i dojazdy są szacunkowe. Sprawdź je przed wyjazdem.',soon:'Przewodnik po tym mieście w przygotowaniu.',atlas:'Atlas',night:'Noc',terrain:'Teren',subtitle:'Miejsca i Wspomnienia · Odkrywaj Polskę',calendarHint:'Plik .ics można otworzyć w Kalendarzu Apple lub innej aplikacji kalendarza.',day:'Plan dnia',places:'Miejsca warte uwagi'},
en:{lang:'Polski',title:'My trips',save:'♡ Save trip',calendar:'📅 Add to calendar',empty:'No saved trips yet.',saved:'Trip saved on this device.',noRoute:'Plan a route with attractions first.',remove:'Delete',export:'Calendar',load:'Restore settings',theme:'Map style',full:'Full screen',close:'Close map',reset:'All Poland',note:'Select a city. Warsaw has a detailed guide; other cities are coming soon.',priority:'Smart sightseeing order',best:'Top attractions within opening hours',hidden:'Discover less-known places first',closeby:'Shortest travel distances',caution:'Opening hours and travel times are estimates. Verify before visiting.',soon:'Guide for this city is coming soon.',atlas:'Atlas',night:'Night',terrain:'Terrain',subtitle:'Places and Memories · Explore Poland',calendarHint:'Open the .ics file in Apple Calendar or another calendar app.',day:'Day plan',places:'Places to discover'}};
// Jeden wspólny język aplikacji: klucz tubylem_lang i przycisk #langWarsaw (i18n4.js).
const readLang=()=>{try{return localStorage.getItem('tubylem_lang')==='en'?'en':'pl'}catch(e){return 'pl'}};
let language=readLang();
const t=k=>dict[language][k]||k;
function syncLanguage(){const next=readLang();if(next!==language){language=next;applyLanguage()}}
document.querySelector('#langWarsaw')?.addEventListener('click',()=>setTimeout(syncLanguage,0));
window.addEventListener('storage',e=>{if(e.key==='tubylem_lang')syncLanguage()});
window.addEventListener('pageshow',syncLanguage);
function setText(q,v){const el=document.querySelector(q);if(el)el.textContent=v}
function applyLanguage(){
setText('#tbTrips h2','📚 '+t('title'));setText('#tbSaveTrip',t('save'));setText('#tbCalendarNow',t('calendar'));setText('#tbCalendarHint',t('calendarHint'));renderTrips();
}
const tripSection=document.createElement('section');tripSection.id='tbTrips';
tripSection.innerHTML='<h2></h2><p id="tbCalendarHint"></p><div class="tb-actions"><button id="tbSaveTrip" type="button"></button><button id="tbCalendarNow" type="button"></button></div><p id="tbTripStatus" role="status"></p><div id="tbTripList"></div>';
document.querySelector('#routeSection')?.after(tripSection);
const readTrips=()=>{try{const a=JSON.parse(localStorage.getItem('tb_saved_trips')||'[]');return Array.isArray(a)?a:[]}catch(e){return []}};
const saveTrips=a=>localStorage.setItem('tb_saved_trips',JSON.stringify(a));
function snapshot(){
const st=typeof state!=='undefined'?state:null;
if(!st||!Array.isArray(st.route)||!st.route.length)return null;
const date=st.date||new Date().toISOString().slice(0,10),clock=document.querySelector('#visitClock')?.value||'10:00';
const duration=Number(st.duration)||4;
return {id:String(Date.now()),name:document.querySelector('#routeTitle')?.textContent||'I Was Here',date,clock,duration,mode:st.mode||'walking',stops:st.route.map(p=>({id:p.id,name:p.name,lat:p.lat,lon:p.lon})),savedAt:new Date().toISOString()};
}
function calendarFile(trip){
const esc=x=>String(x||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
const start=new Date(trip.date+'T'+trip.clock+':00');if(isNaN(start))return;
const end=new Date(start.getTime()+trip.duration*3600000);
const fmt=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('')+'T'+[d.getHours(),d.getMinutes(),d.getSeconds()].map(n=>String(n).padStart(2,'0')).join('');
const desc=trip.stops.map((p,i)=>(i+1)+'. '+p.name).join('\n')+'\nTimes are estimates; verify opening hours.';
const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//I Was Here//Trips//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:'+trip.id+'@iwashere.local','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'').replace(/Z$/,'Z'),'DTSTART;TZID=Europe/Warsaw:'+fmt(start),'DTEND;TZID=Europe/Warsaw:'+fmt(end),'SUMMARY:'+esc(trip.name),'DESCRIPTION:'+esc(desc),'END:VEVENT','END:VCALENDAR'].join('\r\n');
const url=URL.createObjectURL(new Blob([ics],{type:'text/calendar;charset=utf-8'}));
const a=document.createElement('a');a.href=url;a.download='i-was-here-'+trip.date+'.ics';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),15000);
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
applyLanguage();
})();

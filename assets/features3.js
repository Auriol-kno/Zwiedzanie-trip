/* Odkryj Warszawę 3.0: gastronomia, GPS, foto, rodzina, audio i plan dnia */
(function(){
'use strict';
if(!window.WARSAW_DB||!window.WARSAW_FOOD||!document.getElementById('waw3Explorer'))return;
const $3=s=>document.querySelector(s);
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const food=window.WARSAW_FOOD.restaurants;
let saved={};try{saved=JSON.parse(localStorage.getItem('waw3_prefs')||'{}')}catch(e){}
const pref=window.WAW_PREFS=Object.assign({minValue:1,pace:'standard',photo:false,family:false,age:'10-13',breakMinutes:20,foodId:null},saved);
const F={search:'',district:'all',cuisine:'all',type:'all',price:4,sort:'editorial',favesOnly:false};
let favorites=[];try{favorites=JSON.parse(localStorage.getItem('waw3_food_favs')||'[]')}catch(e){}
const store=()=>{try{localStorage.setItem('waw3_prefs',JSON.stringify(pref));localStorage.setItem('waw3_food_favs',JSON.stringify(favorites))}catch(e){}};
const value=p=>p.visitValue||Math.min(5,Math.max(1,Math.round((p.score||70)/20)));
const locationUrl=r=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(r.name+', '+r.address+', Polska');
const travelUrl=r=>'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(r.name+', '+r.address+', Polska')+'&travelmode='+state.mode;
const budget=b=>['','niedrogo','umiarkowanie','wyższy budżet','premium'][b]||'sprawdź ceny';
const online=()=>{$3('#waw3Connection').textContent=navigator.onLine?'🟢 Dane i mapy online':'🟠 Offline: zapisane miejsca dostępne; mapa może nie działać'};
function sun(){
 const d=new Date(state.date+'T12:00:00Z');if(isNaN(d))return 'Wybierz poprawną datę';
 const n=Math.floor((d-Date.UTC(d.getUTCFullYear(),0,0))/86400000),rad=Math.PI/180;
 const dec=-23.44*Math.cos(2*Math.PI*(n+10)/365)*rad,lat=52.23*rad,lon=21.01;
 const B=2*Math.PI*(n-81)/364,e=9.87*Math.sin(2*B)-7.53*Math.cos(B)-1.5*Math.sin(B);
 const a=(Math.sin(-.833*rad)-Math.sin(lat)*Math.sin(dec))/(Math.cos(lat)*Math.cos(dec));
 if(Math.abs(a)>1)return 'Brak danych';
 const half=Math.acos(a)/rad*4,noon=720-4*lon-e;
 const fmt=m=>new Intl.DateTimeFormat('pl-PL',{timeZone:'Europe/Warsaw',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())+m*60000));
 return '🌅 Złote światło ok. '+fmt(noon-half)+'–'+fmt(noon-half+60)+' oraz '+fmt(noon+half-60)+'–'+fmt(noon+half);
}
function showPrefs(){
 $3('#waw3Min').value=pref.minValue;$3('#waw3ValueLabel').textContent=pref.minValue+'/5';
 $3('#waw3Pace').value=pref.pace;$3('#waw3Break').value=pref.breakMinutes;
 $3('#waw3Photo').checked=pref.photo;$3('#waw3Family').checked=pref.family;
 $3('#waw3Age').value=pref.age;$3('#waw3Age').disabled=!pref.family;
 $3('#waw3Sun').textContent=sun();$3('#waw3Count').textContent=P.length+' atrakcji';online();
}
function foodList(){
 const s=F.search.trim().toLocaleLowerCase('pl');
 let list=food.filter(r=>(!s||[r.name,r.address,r.description,r.cuisine,r.type,r.district,...r.tags].join(' ').toLocaleLowerCase('pl').includes(s))&&(F.district==='all'||r.district===F.district)&&(F.cuisine==='all'||r.cuisine===F.cuisine)&&(F.type==='all'||r.type===F.type)&&r.priceBand<=F.price&&(!F.favesOnly||favorites.includes(r.id)));
 if(F.sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name,'pl'));
 else if(F.sort==='price')list.sort((a,b)=>a.priceBand-b.priceBand);
 else list.sort((a,b)=>b.editorialPick-a.editorialPick||a.name.localeCompare(b.name,'pl'));
 $3('#waw3FoodCount').textContent=list.length+' / '+food.length;
 $3('#waw3FoodSaved').textContent=F.favesOnly?'♥ Pokaż wszystkie':'♡ Zapisane';
 $3('#waw3FoodList').innerHTML=list.length?list.map(r=>'<article class="waw3-food-card"><div class="waw3-ct">'+safe(r.cuisine)+' · '+safe(r.type)+' · '+safe(r.district)+'</div><h3>'+safe(r.name)+'</h3><small>📍 '+safe(r.address)+'</small><p>'+safe(r.description)+'</p><span class="waw3-rating">✦ Wybór redakcji: <b>'+r.editorialPick+'/5</b></span><small>Budżet: '+safe(budget(r.priceBand))+' (szacunek)</small><small>⭐ Google: sprawdź aktualne opinie w Mapach</small><div class="waw3-food-actions"><a target="_blank" rel="noopener noreferrer" href="'+safe(locationUrl(r))+'">Opinie Google ↗</a><a target="_blank" rel="noopener noreferrer" href="'+safe(travelUrl(r))+'">Dojazd ↗</a><button type="button" data-foodstop="'+safe(r.id)+'" class="'+(pref.foodId===r.id?'selected':'')+'">'+(pref.foodId===r.id?'✓ Wybrano':'+ Przerwa')+'</button><button type="button" data-foodfav="'+safe(r.id)+'">'+(favorites.includes(r.id)?'♥':'♡')+'</button></div></article>').join(''):'<p>Brak restauracji pasujących do filtrów.</p>';
}
function addBreak(){
 const prev=$3('#waw3BreakDisplay');if(prev)prev.remove();
 const box=document.createElement('div');box.id='waw3BreakDisplay';box.className='waw3-break';
 const r=food.find(x=>x.id===pref.foodId);
 if(r)box.innerHTML='<b>🍽️ Przerwa gastronomiczna — rezerwa '+pref.breakMinutes+' min</b><strong>'+safe(r.name)+'</strong> · '+safe(r.district)+' · <a target="_blank" rel="noopener" href="'+safe(travelUrl(r))+'">Sprawdź dojazd ↗</a><p class="waw3-note">Rezerwujemy czas na posiłek, ale odległość i dojazd do lokalu trzeba potwierdzić. Lokal nie jest automatycznie dodany do nawigacji wielopunktowej.</p><button class="btn secondary" type="button" id="waw3ClearStop">Usuń wybrany lokal</button>';
 else box.innerHTML='<b>☕ Zapas czasu na przerwę: '+pref.breakMinutes+' min</b><p class="waw3-note">Planer rezerwuje ten czas. W zakładce Jedzenie możesz wskazać restaurację lub kawiarnię.</p>';
 $3('#routeList').insertAdjacentElement('afterend',box);
 if(r)$3('#waw3ClearStop').onclick=()=>{pref.foodId=null;store();renderAll();foodList()};
 $3('#waw3TransitNote').textContent=state.mode==='transit'?'Transport miejski: każdy odcinek otworzysz przez „Sprawdź linię”. Numery linii i odjazdy nie są jeszcze pobierane na żywo.':'Szacowane czasy przejazdów — potwierdź trasę w nawigacji.';
}
const priorPlaces=renderPlaces;
renderPlaces=function(){
 priorPlaces();
 const a=filtered(),cards=$3('#placesList').querySelectorAll('article.place-card');
 cards.forEach((el,i)=>{const p=a[i],t=el.querySelector('.place-body');if(p&&t){const d=document.createElement('div');d.className='waw3-places-rating';d.textContent='✦ Warto odwiedzić: '+value(p)+'/5';t.appendChild(d)}});
};
const priorRoute=renderRoute;
renderRoute=function(){const out=priorRoute();addBreak();return out};
const priorDetail=openDetail;
openDetail=function(id){
 priorDetail(id);
 const p=P.find(x=>x.id===id);if(!p)return;
 const hint=p.cats.includes('park')?'Zrób zdjęcie przy miękkim porannym lub wieczornym świetle.':p.cats.includes('monument')?'Spróbuj kadru z niskiej perspektywy i z szerszym kontekstem otoczenia.':'Szukaj symetrii, linii prowadzących i ciekawego pierwszego planu.';
 const element=document.createElement('div');element.className='waw3-panel';
 element.innerHTML='<h3>✦ Warto odwiedzić: '+value(p)+'/5</h3><p class="waw3-sub">Ocena redakcyjna, nie opinie Google. Nowe lokalizacje mogą być orientacyjne.</p><p class="waw3-sub"><b>📸 Podpowiedź fotograficzna:</b> '+safe(hint)+'</p><div class="waw3-tools"><button id="waw3Speak">🔊 Posłuchaj opisu</button><button id="waw3StopSpeak">■ Zatrzymaj</button></div><p class="waw3-note">Przewodnik głosowy czyta przygotowany tekst, nie jest to generacja AI na żywo.</p>';
 $3('#detailContent').appendChild(element);
 $3('#waw3Speak').onclick=()=>{if(!window.speechSynthesis)return alert('Synteza mowy niedostępna.');speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(p.name+'. '+p.desc+' '+p.story);u.lang='pl-PL';u.rate=.94;speechSynthesis.speak(u)};
 $3('#waw3StopSpeak').onclick=()=>{if(window.speechSynthesis)speechSynthesis.cancel()};
};
const priorAll=renderAll;
renderAll=function(){const result=priorAll();showPrefs();return result};
function gps(){
 const info=$3('#waw3GPSStatus');if(!navigator.geolocation){info.textContent='GPS nie jest dostępny.';return}
 info.textContent='Proszę potwierdzić dostęp do lokalizacji…';
 navigator.geolocation.getCurrentPosition(p=>{
 const z=[p.coords.latitude,p.coords.longitude];
 if(z[0]<51.9||z[0]>52.5||z[1]<20.6||z[1]>21.6){info.textContent='Pozycja poza okolicą Warszawy — ustaw start ręcznie.';return}
 state.start=[...z];state.center=[...z];state.area='radius';state.district='all';state.startKey='custom';
 setMapMode('radius');if(mapReady)map.setView(z,15);renderAll();
 info.textContent='📍 Ustawiono start z GPS (dokładność ok. '+Math.round(p.coords.accuracy)+' m).';
 },e=>{info.textContent=e.code===1?'Nie udzielono zgody na GPS.':'Odczyt GPS się nie udał.'},{enableHighAccuracy:true,timeout:12000,maximumAge:10000});
}
function setOpts(id,values,first){$3(id).innerHTML='<option value="all">'+first+'</option>'+values.map(v=>'<option value="'+safe(v)+'">'+safe(v)+'</option>').join('')}
setOpts('#waw3FoodDistrict',[...new Set(food.map(r=>r.district))].sort((a,b)=>a.localeCompare(b,'pl')),'Wszystkie dzielnice');
setOpts('#waw3FoodCuisine',[...new Set(food.map(r=>r.cuisine))].sort((a,b)=>a.localeCompare(b,'pl')),'Wszystkie kuchnie');
setOpts('#waw3FoodType',[...new Set(food.map(r=>r.type))].sort((a,b)=>a.localeCompare(b,'pl')),'Wszystkie typy lokali');
for(const [id,key] of [['waw3Min','minValue'],['waw3Pace','pace'],['waw3Family','family'],['waw3Age','age'],['waw3Photo','photo'],['waw3Break','breakMinutes']]){
 $3('#'+id).addEventListener('change',e=>{pref[key]=e.target.type==='checkbox'?e.target.checked:e.target.type==='number'||id==='waw3Min'||id==='waw3Break'?Number(e.target.value):e.target.value;store();renderAll()});
}
$3('#waw3FindMe').onclick=gps;
for(const [id,key] of [['waw3FoodSearch','search'],['waw3FoodDistrict','district'],['waw3FoodCuisine','cuisine'],['waw3FoodType','type'],['waw3FoodPrice','price'],['waw3FoodSort','sort']]){
 $3('#'+id).addEventListener(id==='waw3FoodSearch'?'input':'change',e=>{F[key]=id==='waw3FoodPrice'?Number(e.target.value):e.target.value;foodList()});
}
$3('#waw3FoodSaved').onclick=()=>{F.favesOnly=!F.favesOnly;foodList()};
$3('#waw3FoodList').onclick=e=>{
 const el=e.target.closest('[data-foodstop],[data-foodfav]');if(!el)return;
 const id=el.dataset.foodstop||el.dataset.foodfav;if(!food.some(x=>x.id===id))return;
 if(el.dataset.foodstop){pref.foodId=id;pref.breakMinutes=Math.max(45,pref.breakMinutes);store();renderAll()}
 else{favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];store()}
 foodList();
};
$3('#waw3NavFood').onclick=()=>{$3('#foodSection').scrollIntoView({behavior:'smooth'});document.querySelectorAll('.bottom-nav button').forEach(x=>x.classList.remove('active'));$3('#waw3NavFood').classList.add('active')};
$3('#waw3TransitMap').onclick=()=>{const t=state.route[0];if(t)window.open(googleDir(state.start,[t.lat,t.lon],'transit'),'_blank','noopener')};
$3('#waw3SavePlan').onclick=()=>{
 const r=food.find(x=>x.id===pref.foodId);
 const txt=['ODKRYJ WARSZAWĘ','Data: '+state.date,'Czas: '+state.duration+' h','Przerwa: '+pref.breakMinutes+' min',...state.route.map((p,i)=>(i+1)+'. '+p.name+' '+clock(state.routeLegs[i].arrive)+'-'+clock(state.routeLegs[i].depart)),'Lokal: '+(r?r.name:'nie wybrano'),'Mapa i trasy działają tylko orientacyjnie.'].join('\n');
 const u=URL.createObjectURL(new Blob([txt],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download='plan-warszawa.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);
};
window.addEventListener('online',online);window.addEventListener('offline',online);
showPrefs();foodList();renderAll();
})();

/* Tu Byłem: load Poland explorer after Warsaw features */
(function(){const script=document.createElement('script');script.src='assets/poland-explorer.js';script.defer=true;document.body.appendChild(script)})();

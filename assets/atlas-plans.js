/* I Was Here 7.0 — plany i zakładki Atlasu: Plan podróży, Mój plan dnia, Wspomnienia, Profil.
 * Dane zapisywane trwale w localStorage przeglądarki (nic nie wysyłamy na serwer):
 *   iwh_trips   — plany podróży [{id,name,created,items:[item]}]
 *   iwh_days    — plany dnia    [{id,name,date,start,items:[item]}]
 *   iwh_visited — odwiedzone miasta / województwa / miejscowości (klucze item)
 * Odwiedzone atrakcje regionów: iwh_region_visited (region.js), pieczątki Warszawy: odkryjWarszawe_1.visited,
 * zapisane wycieczki po Warszawie: tb_saved_trips (poland-explorer.js) — tylko odczyt, bez nadpisywania.
 * item = {t:'city',id} | {t:'region',id} | {t:'town',region,name} | {t:'place',id}. Nazw użytkownika nie tłumaczymy. */
(function(){
'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?f:v}catch(e){return f}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}};
const key=it=>it.t==='town'?'town:'+it.region+':'+it.name:it.t+':'+it.id;
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const plural=(n,f)=>n+' '+(n===1?f[0]:(n%10>=2&&n%10<=4&&(n%100<12||n%100>14))?f[1]:f[2]);
const L={
pl:{trips:'Plan podróży',day:'Mój plan dnia',memories:'Wspomnienia',profile:'Profil',close:'Wróć do mapy',
 tripIntro:'Zbieraj miasta, województwa i miejsca, które chcesz odwiedzić. Plany zapisują się na tym urządzeniu.',newTrip:'＋ Nowy plan podróży',newDay:'＋ Nowy plan dnia',
 emptyTrips:'Nie masz jeszcze planów podróży. Wybierz miasto lub województwo na mapie i dotknij „＋ Plan podróży”.',
 emptyDays:'Nie masz jeszcze planu dnia. Wybierz miejsce na mapie i dotknij „＋ Plan dnia”.',emptyPlan:'Ten plan jest pusty.',
 show:'Pokaż',remove:'Usuń',up:'W górę',down:'W dół',rename:'Nazwa planu',delPlan:'Usuń plan',confirmDel:'Usunąć ten plan? Tej operacji nie można cofnąć.',
 items:n=>plural(n,['pozycja','pozycje','pozycji']),date:'Data',start:'Start',maps:'🧭 Trasa w Google Maps',
 dayNote:'Godziny są szacunkowe: przejazd z odległości (ok. 55 km/h), czas zwiedzania z bazy. Sprawdź godziny otwarcia.',
 warsawTrips:'Zapisane wycieczki po Warszawie',openWarsaw:'Otwórz w przewodniku Warszawy',
 visitedCities:'Odwiedzone miasta i regiony',visitedPlaces:'Pieczątki z przewodników regionów',warsawStamps:'Paszport Warszawy',stamps:n=>plural(n,['pieczątka','pieczątki','pieczątek']),
 openPassport:'Otwórz paszport',noMemories:'Oznacz miejsca przyciskiem „✓ Byłem tu”, a pojawią się tutaj.',
 language:'Język',mapStyle:'Styl mapy',styles:{atlas:'Atlas',light:'Jasny',night:'Noc',terrain:'Teren'},stats:'Twoje statystyki',
 statTrips:'plany podróży',statDays:'plany dnia',statVisited:'odwiedzone',data:'Dane i licencje',
 dataText:'Granice, rzeki i jeziora: Natural Earth 1:10m (domena publiczna). Relief: Terrain Tiles (SRTM, GMTED2010, ETOPO1; EU-DEM © Copernicus). Współrzędne atrakcji regionalnych są orientacyjne; ocena 1–5 jest redakcyjna, nie z Google.',
 clear:'Wyczyść moje plany',confirmClear:'Usunąć wszystkie plany podróży i plany dnia z tego urządzenia?',
 pickTrip:'Dodaj do planu podróży',pickDay:'Dodaj do planu dnia',choosePlan:'Wybierz plan',newPlan:'Nowy plan',planName:'Nazwa nowego planu',
 defTrip:'Moja podróż po Polsce',defDay:'Dzień zwiedzania',cancel:'Anuluj',add:'Dodaj',added:n=>'Dodano do planu „'+n+'”',already:n=>'To miejsce jest już w planie „'+n+'”',
 visitedOn:'Oznaczono jako odwiedzone',visitedOff:'Usunięto z odwiedzonych',saveErr:'Nie udało się zapisać — pamięć przeglądarki jest pełna lub zablokowana.'},
en:{trips:'Trip plan',day:'My day plan',memories:'Memories',profile:'Profile',close:'Back to the map',
 tripIntro:'Collect the cities, provinces and places you want to visit. Plans are saved on this device.',newTrip:'＋ New trip plan',newDay:'＋ New day plan',
 emptyTrips:'You have no trip plans yet. Pick a city or province on the map and tap “＋ Trip plan”.',
 emptyDays:'You have no day plan yet. Pick a place on the map and tap “＋ Day plan”.',emptyPlan:'This plan is empty.',
 show:'Show',remove:'Remove',up:'Move up',down:'Move down',rename:'Plan name',delPlan:'Delete plan',confirmDel:'Delete this plan? This cannot be undone.',
 items:n=>n+' '+(n===1?'item':'items'),date:'Date',start:'Start',maps:'🧭 Route in Google Maps',
 dayNote:'Times are estimates: travel from distance (about 55 km/h), visit length from our data. Check opening hours.',
 warsawTrips:'Saved Warsaw itineraries',openWarsaw:'Open in the Warsaw guide',
 visitedCities:'Visited cities and regions',visitedPlaces:'Stamps from regional guides',warsawStamps:'Warsaw passport',stamps:n=>n+' '+(n===1?'stamp':'stamps'),
 openPassport:'Open the passport',noMemories:'Mark places with “✓ I was here” and they will appear here.',
 language:'Language',mapStyle:'Map style',styles:{atlas:'Atlas',light:'Light',night:'Night',terrain:'Terrain'},stats:'Your statistics',
 statTrips:'trip plans',statDays:'day plans',statVisited:'visited',data:'Data and licences',
 dataText:'Borders, rivers and lakes: Natural Earth 1:10m (public domain). Relief: Terrain Tiles (SRTM, GMTED2010, ETOPO1; EU-DEM © Copernicus). Regional place coordinates are approximate; the 1–5 rating is editorial, not from Google.',
 clear:'Clear my plans',confirmClear:'Delete all trip plans and day plans from this device?',
 pickTrip:'Add to a trip plan',pickDay:'Add to a day plan',choosePlan:'Choose a plan',newPlan:'New plan',planName:'Name of the new plan',
 defTrip:'My trip around Poland',defDay:'Sightseeing day',cancel:'Cancel',add:'Add',added:n=>'Added to “'+n+'”',already:n=>'This is already in “'+n+'”',
 visitedOn:'Marked as visited',visitedOff:'Removed from visited',saveErr:'Could not save — browser storage is full or blocked.'}
};
let A=null,tab='map';
const lang=()=>A?A.lang():'pl',x=()=>L[lang()];
const trips=()=>read('iwh_trips',[]),days=()=>read('iwh_days',[]);
const visited=()=>read('iwh_visited',[]),placeStamps=()=>read('iwh_region_visited',[]);
function toast(msg){const tEl=$('#toast');tEl.textContent=msg;tEl.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(()=>tEl.classList.remove('show'),2600)}
function save(k,v){if(!write(k,v)){toast(x().saveErr);return false}return true}

const API={
 init(atlas){A=atlas;document.querySelector('.tabbar').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b)API.open(b.dataset.tab)})},
 isVisited(it){if(it.t==='place')return placeStamps().includes(it.id);return visited().includes(key(it))},
 isPlanned(it){const k=key(it);return trips().some(p=>p.items.some(i=>key(i)===k))||days().some(p=>p.items.some(i=>key(i)===k))},
 toggleVisited(it){
  if(it.t==='place'){const s=placeStamps(),on=!s.includes(it.id);save('iwh_region_visited',on?[...s,it.id]:s.filter(i=>i!==it.id));toast(on?x().visitedOn:x().visitedOff)}
  else{const v=visited(),k=key(it),on=!v.includes(k);save('iwh_visited',on?[...v,k]:v.filter(i=>i!==k));toast(on?x().visitedOn:x().visitedOff)}
  A.changed();if(tab!=='map')render();
 },
 pick(kind,item){openPicker(kind,item)},
 open(name){tab=name;document.querySelectorAll('.tabbar [data-tab]').forEach(b=>{const on=b.dataset.tab===name;b.classList.toggle('active',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  document.body.dataset.tab=name;render();if(name!=='map')$('#tabPanel').querySelector('h2')?.focus()},
 close(){if(tab!=='map')API.open('map')},
 refresh(){render();const d=$('#planPicker');if(d.open&&d.dataset.kind)openPicker(d.dataset.kind,JSON.parse(d.dataset.item))}
};

// ---------- wybór planu (dialog)
function openPicker(kind,item){
 const d=$('#planPicker'),t=x(),list=kind==='trip'?trips():days(),info=A.resolve(item);if(!info)return;
 d.dataset.kind=kind;d.dataset.item=JSON.stringify(item);
 d.innerHTML='<form method="dialog" id="pickerForm"><h2 id="pickerTitle">'+esc(kind==='trip'?t.pickTrip:t.pickDay)+'</h2><p class="picker-item"><span aria-hidden="true">'+info.icon+'</span> <b>'+esc(info.name)+'</b> <small>'+esc(info.sub||'')+'</small></p>'+
  '<fieldset><legend>'+esc(t.choosePlan)+'</legend>'+list.map((p,i)=>'<label class="opt"><input type="radio" name="plan" value="'+esc(p.id)+'"'+(i===0?' checked':'')+'> <span>'+esc(p.name)+(p.date?' · '+esc(p.date):'')+' <small>('+esc(t.items(p.items.length))+')</small></span></label>').join('')+
  '<label class="opt"><input type="radio" name="plan" value="__new"'+(list.length?'':' checked')+'> <span>'+esc(t.newPlan)+'</span></label>'+
  '<div class="new-plan"><label>'+esc(t.planName)+'<input name="name" maxlength="60" value="'+esc(kind==='trip'?t.defTrip:t.defDay)+'"></label>'+(kind==='day'?'<label>'+esc(t.date)+'<input type="date" name="date" value="'+today()+'"></label>':'')+'</div></fieldset>'+
  '<div class="picker-actions"><button type="button" class="ghost-action" id="pickCancel">'+esc(t.cancel)+'</button><button type="submit" class="city-action" id="pickAdd">'+esc(t.add)+'</button></div></form>';
 const form=d.querySelector('form');
 const sync=()=>{d.querySelector('.new-plan').hidden=form.plan.value!=='__new'};sync();form.addEventListener('change',sync);
 d.querySelector('#pickCancel').onclick=()=>closeDialog(d);
 form.onsubmit=e=>{
  e.preventDefault();
  const store=kind==='trip'?'iwh_trips':'iwh_days',all=kind==='trip'?trips():days();
  let plan=all.find(p=>p.id===form.plan.value);
  if(!plan){plan={id:uid(),name:(form.name.value||'').trim()||(kind==='trip'?t.defTrip:t.defDay),created:new Date().toISOString(),items:[]};if(kind==='day'){plan.date=form.date.value||today();plan.start='09:00'}all.unshift(plan)}
  if(plan.items.some(i=>key(i)===key(item))){toast(t.already(plan.name));closeDialog(d);return}
  plan.items.push(item);
  if(save(store,all)){toast(t.added(plan.name));A.changed();if(tab!=='map')render()}
  closeDialog(d);
 };
 if(typeof d.showModal==='function'){if(!d.open)d.showModal()}else d.setAttribute('open','');
 d.querySelector('input[type=radio]:checked')?.focus();
}
function closeDialog(d){if(typeof d.close==='function'&&d.open)d.close();else d.removeAttribute('open');delete d.dataset.kind}

// ---------- panele zakładek
function itemRow(it,i,n,planId,kind){
 const r=A.resolve(it);if(!r)return '';
 return '<li class="plan-item"><span class="pi-icon" aria-hidden="true">'+r.icon+'</span><span class="pi-text"><b>'+esc(r.name)+'</b><small>'+esc(r.sub||'')+'</small></span>'+
  '<span class="pi-actions">'+(kind==='day'?'<button type="button" data-move="-1" data-plan="'+planId+'" data-i="'+i+'" aria-label="'+esc(x().up)+'"'+(i===0?' disabled':'')+'>↑</button><button type="button" data-move="1" data-plan="'+planId+'" data-i="'+i+'" aria-label="'+esc(x().down)+'"'+(i===n-1?' disabled':'')+'>↓</button>':'')+
  '<button type="button" data-show="'+planId+'" data-i="'+i+'">'+esc(x().show)+'</button><button type="button" data-remove="'+planId+'" data-i="'+i+'" aria-label="'+esc(x().remove+': '+r.name)+'">✕</button></span></li>';
}
const km=(a,b)=>{const R=6371,r=Math.PI/180,dl=(b.lat-a.lat)*r,dn=(b.lon-a.lon)*r,q=Math.sin(dl/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(q))};
const hhmm=m=>String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(Math.round(m%60)).padStart(2,'0');
function schedule(plan){
 let [h,m]=(plan.start||'09:00').split(':').map(Number),clock=h*60+m,prev=null;
 return plan.items.map(it=>{const r=A.resolve(it);if(!r)return null;let drive=0,dist=0;if(prev){dist=km(prev,r)*1.3;drive=dist<1.5?Math.round(dist/4.5*60):Math.round(dist/55*60+8)}
  clock+=drive;const s={from:clock,to:clock+r.minutes,dist,drive};clock+=r.minutes;prev=r;return s});
}
function render(){
 const p=$('#tabPanel'),t=x();
 if(tab==='map'){p.hidden=true;p.innerHTML='';document.body.dataset.tab='map';return}
 p.hidden=false;
 const head=title=>'<div class="panel-head"><h2 tabindex="-1">'+esc(title)+'</h2><button type="button" class="sheet-x" data-close-panel aria-label="'+esc(t.close)+'">✕</button></div>';
 if(tab==='trips'){
  const list=trips(),legacy=read('tb_saved_trips',[]);
  p.innerHTML=head(t.trips)+'<p class="panel-intro">'+esc(t.tripIntro)+'</p><button type="button" class="city-action wide" data-new="trip">'+esc(t.newTrip)+'</button>'+
   (list.length?list.map(pl=>'<article class="plan-card"><div class="plan-top"><label class="plan-name"><span class="sr-only">'+esc(t.rename)+'</span><input data-rename="'+pl.id+'" data-kind="trip" value="'+esc(pl.name)+'" maxlength="60"></label><small>'+esc(t.items(pl.items.length))+'</small></div>'+
    (pl.items.length?'<ul class="plan-items">'+pl.items.map((it,i)=>itemRow(it,i,pl.items.length,pl.id,'trip')).join('')+'</ul>':'<p class="muted">'+esc(t.emptyPlan)+'</p>')+
    '<button type="button" class="link-danger" data-delete="'+pl.id+'" data-kind="trip">'+esc(t.delPlan)+'</button></article>').join(''):'<p class="empty">'+esc(t.emptyTrips)+'</p>')+
   (Array.isArray(legacy)&&legacy.length?'<h3>'+esc(t.warsawTrips)+'</h3><ul class="plan-items">'+legacy.map(tr=>'<li class="plan-item"><span class="pi-icon" aria-hidden="true">🏛️</span><span class="pi-text"><b>'+esc(tr.name||'')+'</b><small>'+esc((tr.date||'')+' · '+(tr.clock||'')+' · '+t.items((tr.stops||[]).length))+'</small></span><span class="pi-actions"><a href="./index.html?lang='+lang()+'#tbTrips">'+esc(t.openWarsaw)+'</a></span></li>').join('')+'</ul>':'');
 }else if(tab==='day'){
  const list=days().sort((a,b)=>(a.date||'').localeCompare(b.date||''));
  p.innerHTML=head(t.day)+'<button type="button" class="city-action wide" data-new="day">'+esc(t.newDay)+'</button>'+
   (list.length?list.map(pl=>{const sc=schedule(pl);const pts=pl.items.map(i=>A.resolve(i)).filter(Boolean);
    const maps=pts.length?'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(pts[0].lat.toFixed(5)+','+pts[0].lon.toFixed(5))+'&destination='+encodeURIComponent(pts[pts.length-1].lat.toFixed(5)+','+pts[pts.length-1].lon.toFixed(5))+(pts.length>2?'&waypoints='+encodeURIComponent(pts.slice(1,-1).map(r=>r.lat.toFixed(5)+','+r.lon.toFixed(5)).join('|')):'')+'&travelmode=driving':'';
    return '<article class="plan-card"><div class="plan-top"><label class="plan-name"><span class="sr-only">'+esc(t.rename)+'</span><input data-rename="'+pl.id+'" data-kind="day" value="'+esc(pl.name)+'" maxlength="60"></label></div>'+
    '<div class="plan-meta"><label>'+esc(t.date)+' <input type="date" data-date="'+pl.id+'" value="'+esc(pl.date||'')+'"></label><label>'+esc(t.start)+' <input type="time" data-start="'+pl.id+'" value="'+esc(pl.start||'09:00')+'"></label></div>'+
    (pl.items.length?'<ol class="plan-items day">'+pl.items.map((it,i)=>{const s=sc[i];return itemRow(it,i,pl.items.length,pl.id,'day').replace('<small>','<small>'+(s?hhmm(s.from)+'–'+hhmm(s.to)+(s.dist?' · ~'+Math.round(s.dist)+' km':'')+' · ':''))}).join('')+'</ol>':'<p class="muted">'+esc(t.emptyPlan)+'</p>')+
    (maps?'<a class="ghost-action" href="'+maps+'" target="_blank" rel="noopener">'+esc(t.maps)+'</a>':'')+
    '<p class="muted small">'+esc(t.dayNote)+'</p><button type="button" class="link-danger" data-delete="'+pl.id+'" data-kind="day">'+esc(t.delPlan)+'</button></article>'}).join(''):'<p class="empty">'+esc(t.emptyDays)+'</p>');
 }else if(tab==='memories'){
  const v=visited().map(k=>{const [ty,a,b]=k.split(':');return ty==='town'?{t:'town',region:a,name:b}:{t:ty,id:a}}).map(it=>({it,r:A.resolve(it)})).filter(o=>o.r);
  const ps=placeStamps().map(id=>({it:{t:'place',id},r:A.resolve({t:'place',id})})).filter(o=>o.r);
  const w=read('odkryjWarszawe_1',{}),wn=Array.isArray(w.visited)?w.visited.length:0;
  const row=o=>'<li class="plan-item"><span class="pi-icon" aria-hidden="true">'+o.r.icon+'</span><span class="pi-text"><b>'+esc(o.r.name)+'</b><small>'+esc(o.r.sub||'')+'</small></span><span class="pi-actions"><button type="button" data-show-item=\''+esc(JSON.stringify(o.it))+'\'>'+esc(t.show)+'</button></span></li>';
  p.innerHTML=head(t.memories)+'<div class="stat-row"><div><b>'+v.length+'</b><small>'+esc(t.visitedCities)+'</small></div><div><b>'+ps.length+'</b><small>'+esc(t.visitedPlaces)+'</small></div><div><b>'+wn+'</b><small>'+esc(t.warsawStamps)+'</small></div></div>'+
   (v.length?'<h3>'+esc(t.visitedCities)+'</h3><ul class="plan-items">'+v.map(row).join('')+'</ul>':'')+
   (ps.length?'<h3>'+esc(t.visitedPlaces)+'</h3><ul class="plan-items">'+ps.map(row).join('')+'</ul>':'')+
   '<h3>'+esc(t.warsawStamps)+'</h3><p class="muted">'+esc(t.stamps(wn))+' · <a href="./index.html?lang='+lang()+'">'+esc(t.openPassport)+'</a></p>'+
   (!v.length&&!ps.length?'<p class="empty">'+esc(t.noMemories)+'</p>':'');
 }else if(tab==='profile'){
  const st=A.style();
  p.innerHTML=head(t.profile)+'<h3>'+esc(t.language)+'</h3><div class="seg" role="group" aria-label="'+esc(t.language)+'"><button type="button" data-set-lang="pl" aria-pressed="'+(lang()==='pl')+'">Polski</button><button type="button" data-set-lang="en" aria-pressed="'+(lang()==='en')+'">English</button></div>'+
   '<h3>'+esc(t.mapStyle)+'</h3><div class="seg" role="group" aria-label="'+esc(t.mapStyle)+'">'+A.styles.map(s=>'<button type="button" data-set-style="'+s+'" aria-pressed="'+(st===s)+'">'+esc(t.styles[s])+'</button>').join('')+'</div>'+
   '<h3>'+esc(t.stats)+'</h3><div class="stat-row"><div><b>'+trips().length+'</b><small>'+esc(t.statTrips)+'</small></div><div><b>'+days().length+'</b><small>'+esc(t.statDays)+'</small></div><div><b>'+(visited().length+placeStamps().length)+'</b><small>'+esc(t.statVisited)+'</small></div></div>'+
   '<h3>'+esc(t.data)+'</h3><p class="muted small">'+esc(t.dataText)+'</p><button type="button" class="link-danger" data-clear>'+esc(t.clear)+'</button>';
 }
}
document.addEventListener('click',e=>{
 const pnl=e.target.closest('#tabPanel');if(!pnl||!A)return;
 const q=s=>e.target.closest(s);let b;
 if(q('[data-close-panel]')){API.open('map');return}
 if((b=q('[data-new]'))){const kind=b.dataset.new,t=x(),all=kind==='trip'?trips():days();const plan={id:uid(),name:kind==='trip'?t.defTrip:t.defDay,created:new Date().toISOString(),items:[]};if(kind==='day'){plan.date=today();plan.start='09:00'}all.unshift(plan);save(kind==='trip'?'iwh_trips':'iwh_days',all);render();pnl.querySelector('[data-rename="'+plan.id+'"]')?.select();return}
 const findPlan=id=>{let all=trips(),k='iwh_trips',pl=all.find(p=>p.id===id);if(!pl){all=days();k='iwh_days';pl=all.find(p=>p.id===id)}return{all,k,pl}};
 if((b=q('[data-remove]'))){const {all,k,pl}=findPlan(b.dataset.remove);if(pl){pl.items.splice(+b.dataset.i,1);save(k,all);A.changed();render()}return}
 if((b=q('[data-move]'))){const {all,k,pl}=findPlan(b.dataset.plan);if(pl){const i=+b.dataset.i,j=i+ +b.dataset.move;if(j>=0&&j<pl.items.length){[pl.items[i],pl.items[j]]=[pl.items[j],pl.items[i]];save(k,all);render()}}return}
 if((b=q('[data-show]'))){const {pl}=findPlan(b.dataset.show);if(pl){API.open('map');A.show(pl.items[+b.dataset.i])}return}
 if((b=q('[data-show-item]'))){API.open('map');A.show(JSON.parse(b.dataset.showItem));return}
 if((b=q('[data-delete]'))){if(confirm(x().confirmDel)){const k=b.dataset.kind==='trip'?'iwh_trips':'iwh_days';save(k,read(k,[]).filter(p=>p.id!==b.dataset.delete));A.changed();render()}return}
 if((b=q('[data-set-lang]'))){A.setLang(b.dataset.setLang);return}
 if((b=q('[data-set-style]'))){A.setStyle(b.dataset.setStyle);render();return}
 if(q('[data-clear]')){if(confirm(x().confirmClear)){save('iwh_trips',[]);save('iwh_days',[]);A.changed();render()}return}
});
document.addEventListener('change',e=>{
 if(!e.target.closest('#tabPanel'))return;const i=e.target;
 const edit=(k,id,fn)=>{const all=read(k,[]),pl=all.find(p=>p.id===id);if(pl){fn(pl);save(k,all)}};
 if(i.dataset.rename){edit(i.dataset.kind==='trip'?'iwh_trips':'iwh_days',i.dataset.rename,pl=>{pl.name=i.value.trim()||pl.name})}
 if(i.dataset.date){edit('iwh_days',i.dataset.date,pl=>{pl.date=i.value});render()}
 if(i.dataset.start){edit('iwh_days',i.dataset.start,pl=>{pl.start=i.value||'09:00'});render()}
});
window.IWH_PLANS=API;
})();

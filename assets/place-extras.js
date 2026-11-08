/* I Was Here 8.3 — wspólne dodatki do miejsc (Atlas, przewodniki regionów, Warszawa):
 *  1) „Więcej informacji o miejscu” — odnośnik do Wikipedii. Artykuł tylko wtedy, gdy jest potwierdzony
 *     (pole `wiki` z tools/wiki_links.py: tag wikidata w OpenStreetMap + Wikidata). W innym razie uczciwie:
 *     wyszukiwarka Wikipedii, a nie zgadnięty artykuł.
 *  2) Dziennik podróży do paszportu: notatki i do 5 zdjęć z miejsca (także wcześniej zrobionych — z biblioteki
 *     zdjęć). Dane zostają WYŁĄCZNIE na tym urządzeniu (IndexedDB „iwh_journal”), nic nie jest wysyłane.
 * API: window.IWH_EXTRAS = { lang(), wiki(place, lang) → {href,label,note,verified}, wikiHTML(place, lang),
 *      journal: { open(key, title, icon), get(key), all(), count(key), button(key, title, icon, lang) } } */
(function(){
'use strict';
const MAX_PHOTOS=5,MAX_SIDE=1600,QUALITY=.82,DB_NAME='iwh_journal',STORE='entries';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lang=()=>{const l=document.documentElement.lang;if(l==='en'||l==='pl')return l;try{return localStorage.getItem('tubylem_lang')==='en'?'en':'pl'}catch(e){return 'pl'}};
const T={
 pl:{wiki:'📖 Więcej informacji o miejscu — Wikipedia',wikiOther:'📖 Więcej informacji — Wikipedia (po angielsku)',wikiSearch:'🔎 Więcej informacji — szukaj w Wikipedii',
  wikiNote:'Artykuł dopasowany przez OpenStreetMap i Wikidata.',wikiSearchNote:'Wyszukiwanie w Wikipedii — artykuł o tym miejscu nie został jeszcze potwierdzony.',
  journal:'Pieczątki · dziennik podróży',open:'📝 Notatki i zdjęcia',notes:'Notatki',notesPh:'Co chcesz zapamiętać? Z kim byłeś, co zobaczyłeś, co polecasz…',
  photos:n=>'Zdjęcia ('+n+'/'+MAX_PHOTOS+')',add:'＋ Dodaj zdjęcia z biblioteki',limit:'Możesz dodać najwyżej '+MAX_PHOTOS+' zdjęć do jednego miejsca.',
  saved:'Zapisano na tym urządzeniu',saving:'Zapisywanie…',processing:'Przygotowywanie zdjęć…',remove:'Usuń zdjęcie',view:'Powiększ zdjęcie',close:'Zamknij',done:'Gotowe',
  privacy:'Notatki i zdjęcia są zapisane tylko na tym urządzeniu (pamięć przeglądarki). Nie wysyłamy ich do internetu. Wyczyszczenie danych Safari usunie je.',
  err:'Nie udało się zapisać — pamięć przeglądarki jest niedostępna lub pełna (np. tryb prywatny).',badImg:'Nie udało się odczytać jednego ze zdjęć.',
  confirmRemove:'Usunąć to zdjęcie z dziennika?',photoAlt:n=>'Zdjęcie '+n,
  passport:'Pieczątki',passportLead:'Byłeś w danym miejscu? Dotknij „Byłem tu”, a pieczątka się odblokuje. Dotknij licznika, aby zobaczyć listę.',
  stCities:'miasta',stPlaces:'miejsca w regionach',stWarsaw:'Warszawa',stJournal:'wpisy w dzienniku',
  secCities:'Pieczątki miast',secPlaces:'Pieczątki z przewodników regionów',secWarsaw:'Pieczątki Warszawy',
  unlock:'Byłem tu',unlocked:'✓ Zdobyta',lockedA:'Pieczątka zablokowana: ',unlockedA:'Pieczątka zdobyta: ',
  searchPlaces:'Szukaj miejsca, aby odblokować pieczątkę…',searchWarsaw:'Szukaj atrakcji w Warszawie…',noneYet:'Brak zdobytych pieczątek — wyszukaj miejsce powyżej.',
  noMatch:'Brak wyników.',more:n=>'… i '+n+' więcej — zawęź wyszukiwanie.',openRegions:'Otwórz Atlas, aby odblokować pieczątki regionów',openWarsaw:'Otwórz przewodnik Warszawy, aby odblokować pieczątki',
  entries:'Dziennik podróży',empty:'Nie masz jeszcze wpisów. Otwórz atrakcję i dotknij „📝 Notatki i zdjęcia”, aby dodać notatki i do 5 zdjęć.',openEntry:'Otwórz',photosN:n=>n+' '+(n===1?'zdjęcie':(n%10>=2&&n%10<=4&&(n%100<12||n%100>14))?'zdjęcia':'zdjęć'),withNotes:'notatki',
  warsawStamps:'🏛️ Pieczątki Warszawy',toAtlas:'Profil w Atlasie'},
 en:{wiki:'📖 More information about this place — Wikipedia',wikiOther:'📖 More information — Wikipedia (in Polish)',wikiSearch:'🔎 More information — search Wikipedia',
  wikiNote:'Article matched via OpenStreetMap and Wikidata.',wikiSearchNote:'Wikipedia search — no article about this place has been confirmed yet.',
  journal:'Stamps · travel journal',open:'📝 Notes & photos',notes:'Notes',notesPh:'What do you want to remember? Who you were with, what you saw, what you recommend…',
  photos:n=>'Photos ('+n+'/'+MAX_PHOTOS+')',add:'＋ Add photos from your library',limit:'You can add up to '+MAX_PHOTOS+' photos per place.',
  saved:'Saved on this device',saving:'Saving…',processing:'Preparing photos…',remove:'Remove photo',view:'Enlarge photo',close:'Close',done:'Done',
  privacy:'Notes and photos are stored only on this device (browser storage). Nothing is uploaded. Clearing Safari website data deletes them.',
  err:'Could not save — browser storage is unavailable or full (e.g. private browsing).',badImg:'One of the photos could not be read.',
  confirmRemove:'Remove this photo from the journal?',photoAlt:n=>'Photo '+n,
  passport:'Stamps',passportLead:'Been to a place? Tap „I was here” to unlock its stamp. Tap a counter to see the list.',
  stCities:'cities',stPlaces:'regional places',stWarsaw:'Warsaw',stJournal:'journal entries',
  secCities:'City stamps',secPlaces:'Stamps from regional guides',secWarsaw:'Warsaw stamps',
  unlock:'I was here',unlocked:'✓ Collected',lockedA:'Stamp locked: ',unlockedA:'Stamp collected: ',
  searchPlaces:'Search a place to unlock its stamp…',searchWarsaw:'Search Warsaw sights…',noneYet:'No stamps yet — search for a place above.',
  noMatch:'No results.',more:n=>'… and '+n+' more — narrow the search.',openRegions:'Open the Atlas to unlock regional stamps',openWarsaw:'Open the Warsaw guide to unlock its stamps',
  entries:'Travel journal',empty:'No entries yet. Open a sight and tap „📝 Notes & photos” to add notes and up to 5 photos.',openEntry:'Open',photosN:n=>n+' '+(n===1?'photo':'photos'),withNotes:'notes',
  warsawStamps:'🏛️ Warsaw stamps',toAtlas:'Profile in the Atlas'}
};
const x=()=>T[lang()];

// ---------- Wikipedia
function nameOf(p,l){const n=p.name;return typeof n==='string'?n:(n&&(n.pl||n.en))||''}
function wiki(p,l){
 l=l||lang();const t=T[l],w=p.wiki||{},art=(code,title)=>'https://'+code+'.wikipedia.org/wiki/'+encodeURIComponent(String(title).replace(/ /g,'_'));
 if(w[l])return{href:art(l,w[l]),label:t.wiki,note:t.wikiNote,verified:true};
 const other=l==='en'?'pl':'en';
 if(w[other])return{href:art(other,w[other]),label:t.wikiOther,note:t.wikiNote,verified:true};
 const q=[nameOf(p,l),p.town||p.city||''].filter(Boolean).join(' ');
 return{href:'https://'+l+'.wikipedia.org/w/index.php?search='+encodeURIComponent(q)+'&ns0=1',label:t.wikiSearch,note:t.wikiSearchNote,verified:false};
}
// Obie wersje językowe w HTML; widoczna ta zgodna z <html lang> (przełącznik PL | EN działa bez przebudowy okna).
function wikiHTML(p){return ['pl','en'].map(l=>{const w=wiki(p,l);return '<div class="iwh-wiki" data-l="'+l+'" data-i18n-skip><a class="iwh-wiki-link'+(w.verified?' verified':'')+'" href="'+esc(w.href)+'" target="_blank" rel="noopener" lang="'+l+'">'+esc(w.label)+'</a><small lang="'+l+'">'+esc(w.note)+'</small></div>'}).join('')}

// ---------- IndexedDB
let dbp=null;
function db(){
 if(dbp)return dbp;
 dbp=new Promise((res,rej)=>{if(!('indexedDB' in window)){rej(new Error('no-idb'));return}
  const r=indexedDB.open(DB_NAME,1);r.onupgradeneeded=()=>{r.result.createObjectStore(STORE,{keyPath:'key'})};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
 dbp.catch(()=>{dbp=null});return dbp;
}
const tx=(mode,fn)=>db().then(d=>new Promise((res,rej)=>{const t=d.transaction(STORE,mode),s=t.objectStore(STORE);const out=fn(s);t.oncomplete=()=>res(out&&out.result);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error)}));
const get=key=>tx('readonly',s=>s.get(key)).catch(()=>null);
const all=()=>tx('readonly',s=>s.getAll()).then(a=>a||[]).catch(()=>[]);
const put=e=>(!e.notes.trim()&&!e.photos.length)?tx('readwrite',s=>s.delete(e.key)):tx('readwrite',s=>s.put(e));
const count=key=>get(key).then(e=>e?{photos:e.photos.length,notes:!!(e.notes||'').trim()}:{photos:0,notes:false});

// ---------- zdjęcia: zmniejszamy na urządzeniu (oszczędność pamięci), z zachowaniem orientacji z EXIF
function loadImg(file){return new Promise((res,rej)=>{const u=URL.createObjectURL(file),i=new Image();i.onload=()=>{res(i);setTimeout(()=>URL.revokeObjectURL(u),0)};i.onerror=()=>{URL.revokeObjectURL(u);rej(new Error('img'))};i.src=u})}
async function shrink(file){
 let src;try{src=await createImageBitmap(file,{imageOrientation:'from-image'})}catch(e){src=await loadImg(file)}
 const w=src.width||src.naturalWidth,h=src.height||src.naturalHeight,k=Math.min(1,MAX_SIDE/Math.max(w,h));
 const c=document.createElement('canvas');c.width=Math.round(w*k);c.height=Math.round(h*k);c.getContext('2d').drawImage(src,0,0,c.width,c.height);
 if(src.close)src.close();
 const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',QUALITY));if(!blob)throw new Error('blob');
 return{id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),blob,w:c.width,h:c.height,added:new Date().toISOString(),taken:file.lastModified?new Date(file.lastModified).toISOString():null};
}

// ---------- okno dziennika
let box=null,cur=null,urls=[],saveTimer=null,lastFocus=null;
function ui(){
 if(box)return box;
 box=document.createElement('div');box.className='iwh-journal';box.hidden=true;box.setAttribute('data-i18n-skip','');
 box.innerHTML='<div class="ij-card" role="dialog" aria-modal="true" aria-labelledby="ijTitle"><div class="ij-head"><span class="ij-icon" aria-hidden="true"></span><div><small class="ij-kicker"></small><h2 id="ijTitle"></h2></div><button type="button" class="ij-x"></button></div>'+
  '<label class="ij-label" for="ijNotes"></label><textarea id="ijNotes" rows="5" maxlength="4000"></textarea>'+
  '<div class="ij-row"><h3 class="ij-photos-title"></h3><span class="ij-status" role="status" aria-live="polite"></span></div><div class="ij-grid"></div>'+
  '<label class="ij-add"><input type="file" accept="image/*" multiple><span></span></label><p class="ij-msg" role="alert"></p><p class="ij-privacy"></p>'+
  '<button type="button" class="ij-done"></button></div><div class="ij-viewer" hidden><img alt=""><button type="button" class="ij-x ij-vx"></button></div>';
 document.body.appendChild(box);
 const $=s=>box.querySelector(s);
 $('.ij-card .ij-x').onclick=close;$('.ij-done').onclick=close;
 box.addEventListener('click',e=>{if(e.target===box)close()});
 box.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();if(!$('.ij-viewer').hidden)$('.ij-viewer').hidden=true;else close()}});
 $('#ijNotes').addEventListener('input',()=>{cur.notes=$('#ijNotes').value;status(x().saving);clearTimeout(saveTimer);saveTimer=setTimeout(persist,500)});
 $('.ij-add input').addEventListener('change',async e=>{
  const files=[...e.target.files];e.target.value='';if(!files.length)return;
  const room=MAX_PHOTOS-cur.photos.length;msg(files.length>room?x().limit:'');
  status(x().processing);
  for(const f of files.slice(0,Math.max(0,room))){try{cur.photos.push(await shrink(f))}catch(err){msg(x().badImg)}}
  await persist();draw();
 });
 $('.ij-grid').addEventListener('click',e=>{
  const rm=e.target.closest('[data-rm]');if(rm){if(confirm(x().confirmRemove)){cur.photos=cur.photos.filter(p=>p.id!==rm.dataset.rm);persist().then(draw)}return}
  const v=e.target.closest('[data-view]');if(v){const ph=cur.photos.find(p=>p.id===v.dataset.view);if(ph){const vw=$('.ij-viewer');vw.querySelector('img').src=urls.find(u=>u.id===ph.id)?.url||'';vw.hidden=false;vw.querySelector('button').focus()}}
 });
 $('.ij-viewer').addEventListener('click',()=>{$('.ij-viewer').hidden=true});
 return box;
}
const status=s=>{if(box)box.querySelector('.ij-status').textContent=s};
const msg=s=>{if(box)box.querySelector('.ij-msg').textContent=s};
async function persist(){
 clearTimeout(saveTimer);if(!cur)return;cur.updated=new Date().toISOString();
 try{await put(cur);status(x().saved);document.dispatchEvent(new CustomEvent('iwh-journal-change',{detail:{key:cur.key}}))}catch(e){status('');msg(x().err)}
}
function texts(){
 const t=x(),$=s=>box.querySelector(s);
 $('.ij-kicker').textContent=t.journal;$('.ij-label').textContent=t.notes;$('#ijNotes').placeholder=t.notesPh;$('.ij-add span').textContent=t.add;
 $('.ij-privacy').textContent=t.privacy;$('.ij-done').textContent=t.done;$('.ij-card .ij-x').setAttribute('aria-label',t.close);$('.ij-card .ij-x').textContent='✕';
 $('.ij-vx').setAttribute('aria-label',t.close);$('.ij-vx').textContent='✕';
}
function draw(){
 const t=x(),$=s=>box.querySelector(s);
 urls.forEach(u=>URL.revokeObjectURL(u.url));urls=cur.photos.map(p=>({id:p.id,url:URL.createObjectURL(p.blob)}));
 $('.ij-photos-title').textContent=t.photos(cur.photos.length);
 $('.ij-grid').innerHTML=cur.photos.map((p,i)=>'<figure><button type="button" class="ij-thumb" data-view="'+p.id+'" aria-label="'+esc(t.view+' '+(i+1))+'"><img src="'+urls[i].url+'" alt="'+esc(t.photoAlt(i+1))+'"></button><button type="button" class="ij-rm" data-rm="'+p.id+'" aria-label="'+esc(t.remove+' '+(i+1))+'">✕</button></figure>').join('');
 const full=cur.photos.length>=MAX_PHOTOS;$('.ij-add').classList.toggle('disabled',full);$('.ij-add input').disabled=full;
}
async function open(key,title,icon){
 ui();lastFocus=document.activeElement;msg('');status('');
 let e=null;try{await db();e=await get(key)}catch(err){msg(x().err)}
 cur=e||{key,title:title||key,icon:icon||'📍',notes:'',photos:[],created:new Date().toISOString()};
 if(title)cur.title=title;if(icon)cur.icon=icon;
 texts();box.querySelector('#ijTitle').textContent=cur.title;box.querySelector('.ij-icon').textContent=cur.icon;box.querySelector('#ijNotes').value=cur.notes||'';
 draw();box.hidden=false;document.documentElement.classList.add('ij-open');box.querySelector('#ijNotes').focus();
}
function close(){
 if(!box||box.hidden)return;persist();box.hidden=true;box.querySelector('.ij-viewer').hidden=true;document.documentElement.classList.remove('ij-open');
 urls.forEach(u=>URL.revokeObjectURL(u.url));urls=[];lastFocus?.focus?.();
}
function button(key,title,icon){
 return '<button type="button" class="btn secondary iwh-journal-btn" data-journal="'+esc(key)+'" data-journal-title="'+esc(title)+'" data-journal-icon="'+esc(icon||'')+'" data-i18n-skip><span data-l="pl">'+esc(T.pl.open)+'</span><span data-l="en">'+esc(T.en.open)+'</span><span class="ij-count" data-journal-count="'+esc(key)+'"></span></button>';
}
// Liczniki na przyciskach (📷 3 · 📝) uzupełniamy asynchronicznie.
function counts(root){
 (root||document).querySelectorAll('[data-journal-count]').forEach(el=>{count(el.dataset.journalCount).then(c=>{el.textContent=(c.photos?' · 📷 '+c.photos:'')+(c.notes?' · 📝':'')})});
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-journal]');if(b){e.preventDefault();e.stopPropagation();open(b.dataset.journal,b.dataset.journalTitle,b.dataset.journalIcon)}},true);
document.addEventListener('iwh-journal-change',()=>counts());
new MutationObserver(()=>{if(box&&!box.hidden){texts();draw()}}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});

// ---------- 8.5 Pieczątki (dawny Paszport): miasta, miejsca w regionach, Warszawa, dziennik — wspólne dla wszystkich stron
const readLS=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?f:v}catch(e){return f}};
const writeLS=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}};
const ART=()=>window.IWH_ATLAS_ART;
// 8.6.1 (BAZA_DANYCH.md, etap 1): gdy strona nie ładuje pełnej bazy (np. Warszawa nie ma regiony.js, Atlas nie ma atrakcje.js),
// Pieczątki korzystają z lekkiego indeksu data/index/places.json, pobieranego dopiero po otwarciu Pieczątek.
let IDX=null,idxP=null;
function loadIndex(){if(!idxP)idxP=fetch('./data/index/places.json').then(r=>r.ok?r.json():null).then(j=>{if(j&&Array.isArray(j.items))IDX=j;return IDX}).catch(()=>{idxP=null;return null});return idxP}
const REG=()=>window.IWH_REGIONS||(IDX?{places:IDX.items.filter(i=>i.k==='place').map(i=>({id:i.id,icon:i.i,name:i.n,town:i.t}))}:null);
const WAW=()=>(window.WARSAW_DB&&window.WARSAW_DB.attractions)||(IDX?IDX.items.filter(i=>i.k==='waw').map(i=>({id:i.id,icon:i.i,name:i.n.pl,district:i.t})):null);
const cityIds=()=>ART()?ART().cities:['warsaw','krakow','gdansk','wroclaw','poznan','lodz','szczecin','torun','lublin','bialystok','katowice','rzeszow','kielce','olsztyn'];
const visitedCities=()=>readLS('iwh_visited',[]).filter(k=>/^city:/.test(k)).map(k=>k.slice(5));
const wawVisited=()=>{const w=readLS('odkryjWarszawe_1',{});return Array.isArray(w.visited)?w.visited:[]};
function stats(){const c=cityIds();return{cities:visitedCities().filter(id=>c.includes(id)).length,citiesAll:c.length,regions:readLS('iwh_region_visited',[]).length,regionsAll:REG()?REG().places.length:207,warsaw:wawVisited().length,warsawAll:WAW()?WAW().length:184}}
const changed=()=>document.dispatchEvent(new CustomEvent('iwh-stamps-change'));
function toggleCity(id){const v=readLS('iwh_visited',[]),k='city:'+id;writeLS('iwh_visited',v.includes(k)?v.filter(x=>x!==k):[...v,k]);changed()}
function togglePlace(id){const v=readLS('iwh_region_visited',[]);writeLS('iwh_region_visited',v.includes(id)?v.filter(x=>x!==id):[...v,id]);changed()}
function toggleWaw(id){if(typeof window.toggleVisit==='function'){window.toggleVisit(id)}else{const w=readLS('odkryjWarszawe_1',{});const v=Array.isArray(w.visited)?w.visited:[];w.visited=v.includes(id)?v.filter(x=>x!==id):[...v,id];writeLS('odkryjWarszawe_1',w)}changed()}
const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const jKey=(kind,id)=>(kind==='place'?'reg:':kind==='waw'?'waw:':'atlas:city:')+id;
const jBtn=(kind,id,title,icon)=>'<button type="button" class="pp-note" data-journal="'+esc(jKey(kind,id))+'" data-journal-title="'+esc(title)+'" data-journal-icon="'+esc(icon||'')+'" aria-label="'+esc(x().open.replace(/^\S+ /,'')+': '+title)+'">📝</button>';
function rowHTML(kind,id,icon,name,sub,on){const t=x();return '<li class="pp-row'+(on?' on':'')+'"><span class="pp-ic" aria-hidden="true">'+esc(icon||'📍')+'</span><span class="pp-text"><b>'+esc(name)+'</b><small>'+esc(sub||'')+'</small></span>'+(on?jBtn(kind,id,name+(sub?' · '+sub:''),icon):'')+'<button type="button" class="pp-toggle" data-pp-'+kind+'="'+esc(id)+'" aria-pressed="'+on+'">'+esc(on?t.unlocked:t.unlock)+'</button></li>'}
function listHTML(kind,q){
 const t=x(),L=lang(),Q=norm(q),MAX=40;let items=[],on=[];
 if(kind==='place'){const d=REG();if(!d)return '';on=readLS('iwh_region_visited',[]);items=d.places.map(p=>({id:p.id,icon:p.icon,name:p.name[L]||p.name.pl,sub:p.town,hay:p.name.pl+' '+p.name.en+' '+p.town}))}
 else{const d=WAW();if(!d)return '';on=wawVisited();items=d.map(p=>({id:p.id,icon:p.icon,name:p.name,sub:p.district,hay:p.name+' '+p.district}))}
 let shown=Q?items.filter(i=>norm(i.hay).includes(Q)):items.filter(i=>on.includes(i.id));
 shown.sort((a,b)=>(on.includes(b.id)-on.includes(a.id))||a.name.localeCompare(b.name,'pl'));
 if(!shown.length)return '<li class="pp-empty">'+esc(Q?t.noMatch:t.noneYet)+'</li>';
 return shown.slice(0,MAX).map(i=>rowHTML(kind,i.id,i.icon,i.name,i.sub,on.includes(i.id))).join('')+(shown.length>MAX?'<li class="pp-empty">'+esc(t.more(shown.length-MAX))+'</li>':'');
}
function citiesHTML(){
 const t=x(),on=visitedCities(),A=ART();
 return cityIds().map(id=>{const v=on.includes(id),name=A?A.cityName(id):id;
  return '<li class="pp-stamp'+(v?' on':'')+'"><span class="pp-art" role="img" aria-label="'+esc((v?t.unlockedA:t.lockedA)+name)+'">'+(A?'<svg viewBox="0 -6 80 62">'+A.landmark(id,{visited:v})+'</svg>':'')+'</span><span class="pp-stamp-act"><button type="button" class="pp-toggle" data-pp-city="'+id+'" aria-pressed="'+v+'">'+esc(v?t.unlocked:t.unlock)+'</button>'+(v?jBtn('city',id,name,'🏙️'):'')+'</span></li>'}).join('');
}
function passportHTML(){
 const t=x(),st=stats(),L=lang(),q=s=>'./'+s+'?lang='+L;
 return '<div class="pp-head"><img src="./assets/brand-pin-landscape.svg" alt="" width="54" height="73"><div><small class="ij-kicker">I Was Here</small><h2 class="pp-title">'+esc(t.passport)+'</h2><p>'+esc(t.passportLead)+'</p></div></div>'+
  '<div class="pp-stats">'+
  '<button type="button" data-pp-jump="ppCities"><b>'+st.cities+'<i>/'+st.citiesAll+'</i></b><small>'+esc(t.stCities)+'</small></button>'+
  '<button type="button" data-pp-jump="ppPlaces"><b>'+st.regions+'<i>/'+st.regionsAll+'</i></b><small>'+esc(t.stPlaces)+'</small></button>'+
  '<button type="button" data-pp-jump="ppWarsaw"><b>'+st.warsaw+'<i>/'+st.warsawAll+'</i></b><small>'+esc(t.stWarsaw)+'</small></button>'+
  '<button type="button" data-pp-jump="ppJournal"><b data-pp-count>–</b><small>'+esc(t.stJournal)+'</small></button></div>'+
  '<h3 class="pp-sub" id="ppCities">'+esc(t.secCities)+'</h3><ul class="pp-stamps" data-pp-cities>'+citiesHTML()+'</ul>'+
  '<h3 class="pp-sub" id="ppPlaces">'+esc(t.secPlaces)+'</h3>'+(REG()?'<input type="search" class="pp-search" data-pp-search="place" placeholder="'+esc(t.searchPlaces)+'" aria-label="'+esc(t.searchPlaces)+'"><ul class="pp-list" data-pp-list-place>'+listHTML('place','')+'</ul>':'<a class="pp-action" href="'+q('atlas.html')+'&tab=passport">'+esc(t.openRegions)+' →</a>')+
  '<h3 class="pp-sub" id="ppWarsaw">'+esc(t.secWarsaw)+'</h3>'+(WAW()?'<input type="search" class="pp-search" data-pp-search="waw" placeholder="'+esc(t.searchWarsaw)+'" aria-label="'+esc(t.searchWarsaw)+'"><ul class="pp-list" data-pp-list-waw>'+listHTML('waw','')+'</ul>':'<a class="pp-action" href="'+q('index.html')+'">'+esc(t.openWarsaw)+' →</a>')+
  '<h3 class="pp-sub" id="ppJournal">'+esc(t.entries)+'</h3><ul class="pp-list" data-pp-list></ul>';
}
let pthumbs=[];
function fillEntries(root){
 const box=root.querySelector('[data-pp-list]');if(!box)return Promise.resolve();
 return all().then(list=>{
  const t=x();pthumbs.forEach(u=>URL.revokeObjectURL(u));pthumbs=[];
  list.sort((a,b)=>(b.updated||'').localeCompare(a.updated||''));
  const c=root.querySelector('[data-pp-count]');if(c)c.textContent=list.length;
  box.innerHTML=list.length?list.map(e=>{const ph=e.photos&&e.photos[0];let img=esc(e.icon||'📍');if(ph&&ph.blob){const u=URL.createObjectURL(ph.blob);pthumbs.push(u);img='<img src="'+u+'" alt="">'}
   return '<li class="pp-row"><span class="pp-ic pp-thumb" aria-hidden="true">'+img+'</span><span class="pp-text"><b>'+esc(e.title||'')+'</b><small>'+esc([e.photos.length?t.photosN(e.photos.length):'',(e.notes||'').trim()?t.withNotes:''].filter(Boolean).join(' · '))+'</small></span><button type="button" class="pp-toggle" data-journal="'+esc(e.key)+'" data-journal-title="'+esc(e.title||'')+'" data-journal-icon="'+esc(e.icon||'')+'">'+esc(t.openEntry)+'</button></li>'}).join(''):'<li class="pp-empty">'+esc(t.empty)+'</li>';
 });
}
// Wstawia Pieczątki do kontenera (okno lub zakładka Atlasu) i obsługuje kliknięcia.
function mount(host){
 if(ART())ART().paintDefs();
 const render=()=>{const keep={};host.querySelectorAll('[data-pp-search]').forEach(i=>keep[i.dataset.ppSearch]=i.value);host.innerHTML=passportHTML();
  Object.entries(keep).forEach(([k,v])=>{const i=host.querySelector('[data-pp-search="'+k+'"]');if(i&&v){i.value=v;const ul=host.querySelector('[data-pp-list-'+k+']');if(ul)ul.innerHTML=listHTML(k,v)}});fillEntries(host)};
 if(!host.dataset.ppBound){host.dataset.ppBound='1';
  host.addEventListener('click',e=>{
   const j=e.target.closest('[data-pp-jump]');if(j){const el=host.querySelector('#'+j.dataset.ppJump);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});return}
   const c=e.target.closest('[data-pp-city]');if(c){toggleCity(c.dataset.ppCity);render();host.querySelector('[data-pp-city="'+c.dataset.ppCity+'"]')?.focus();return}
   const p=e.target.closest('[data-pp-place]');if(p){togglePlace(p.dataset.ppPlace);render();host.querySelector('[data-pp-place="'+p.dataset.ppPlace+'"]')?.focus();return}
   const w=e.target.closest('[data-pp-waw]');if(w){toggleWaw(w.dataset.ppWaw);render();host.querySelector('[data-pp-waw="'+w.dataset.ppWaw+'"]')?.focus();return}
  });
  host.addEventListener('input',e=>{const i=e.target.closest('[data-pp-search]');if(!i)return;const ul=host.querySelector('[data-pp-list-'+i.dataset.ppSearch+']');if(ul)ul.innerHTML=listHTML(i.dataset.ppSearch,i.value)});
  document.addEventListener('iwh-journal-change',()=>{if(host.isConnected)fillEntries(host)});
 }
 render();
 if((!window.IWH_REGIONS||!(window.WARSAW_DB&&window.WARSAW_DB.attractions))&&!IDX)loadIndex().then(j=>{if(j&&host.isConnected)render()});
}
let pbox=null,pFocus=null;
function passportOpen(){
 if(!pbox){
  pbox=document.createElement('div');pbox.className='iwh-journal iwh-passport';pbox.hidden=true;pbox.setAttribute('data-i18n-skip','');
  pbox.innerHTML='<div class="ij-card" role="dialog" aria-modal="true" aria-label="Stamps"><button type="button" class="ij-x pp-x"></button><div class="pp-body"></div><button type="button" class="ij-done"></button></div>';
  document.body.appendChild(pbox);
  const close=()=>{pbox.hidden=true;document.documentElement.classList.remove('ij-open');pFocus?.focus?.()};
  pbox.querySelector('.pp-x').onclick=close;pbox.querySelector('.ij-done').onclick=close;
  pbox.addEventListener('click',e=>{if(e.target===pbox)close()});
  pbox.addEventListener('keydown',e=>{if(e.key==='Escape'&&(!box||box.hidden))close()});
 }
 pFocus=document.activeElement;const t=x();
 mount(pbox.querySelector('.pp-body'));pbox.querySelector('.ij-done').textContent=t.done;
 const xb=pbox.querySelector('.pp-x');xb.textContent='✕';xb.setAttribute('aria-label',t.close);
 pbox.querySelector('.ij-card').setAttribute('aria-label',t.passport);
 pbox.hidden=false;document.documentElement.classList.add('ij-open');xb.focus();
}

window.IWH_EXTRAS={lang,wiki,wikiHTML,journal:{open,close,get,all,save:put,count,counts,button,MAX_PHOTOS},passport:{open:passportOpen,mount,stats}};
})();

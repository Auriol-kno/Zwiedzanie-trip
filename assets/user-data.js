/* I Was Here 8.7 — „Moje dane”: Excel (plany, pieczątki, odznaki, dziennik, mapa), pełna kopia zapasowa i import.
 * Wszystko dzieje się na urządzeniu: plik powstaje w przeglądarce, nic nie jest wysyłane na serwer.
 * - Excel (.xlsx) jest formularzem: listy rozwijane z katalogiem miejsc, formuły uzupełniają typ, województwo
 *   i współrzędne, a arkusz „Mapa” ma wykres-mapę Polski, który odświeża się po dopisaniu planów w Excelu.
 * - Pełna kopia (.json) zawiera także zdjęcia z dziennika (base64).
 * - Import (.xlsx lub .json) SCALA dane: niczego nie usuwa; opcjonalnie aktualizuje plany o tych samych nazwach.
 * - „Wyślij e-mailem”: arkusz Udostępnij (iPhone: Poczta z załącznikiem) albo pobranie pliku + mailto.
 * Bez zewnętrznych bibliotek: własny zapis/odczyt ZIP (deflate przez DecompressionStream) i XML arkusza. */
(function(){
'use strict';
const FORMAT='iwh-backup',FORMAT_VERSION=1,APP_VERSION='8.13.1';
const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?f:v}catch(e){return f}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const norm=s=>String(s??'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ł/g,'l').replace(/Ł/g,'L').toLowerCase().replace(/\s+/g,' ').trim();
const lang=()=>window.IWH_ATLAS?IWH_ATLAS.lang():(document.documentElement.lang==='en'?'en':'pl');
const pad=n=>String(n).padStart(2,'0');
const isoDay=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const KX=Math.cos(52*Math.PI/180); // ta sama projekcja co Atlas (równoodległościowa, 52°)

const T={
 pl:{
  sec:'Moje dane — Excel i kopia zapasowa',
  intro:'Pobierz plik Excel z planami, pieczątkami, odznakami, dziennikiem i mapą. Możesz w nim planować podróże (listy rozwijane z miejscami) i wczytać go z powrotem. Dane zostają na tym urządzeniu — aplikacja nie ma serwera.',
  xlsx:'📊 Pobierz Excel',xlsxSub:'plany, pieczątki, odznaki, dziennik, mapa',
  mail:'✉️ Wyślij Excel e-mailem',mailSub:'iPhone: wybierz „Poczta” — plik będzie w załączniku',
  json:'💾 Pełna kopia ze zdjęciami',jsonSub:'plik .json — także zdjęcia z dziennika',
  imp:'📥 Wczytaj dane z pliku',impSub:'Excel (.xlsx) albo pełna kopia (.json)',
  email:'Twój e-mail (opcjonalnie, tylko na tym urządzeniu)',emailPh:'np. jan@example.com',
  busy:'Przygotowuję plik…',done:'Gotowe: ',shared:'Plik przekazany do udostępnienia.',
  mailFallback:'Plik pobrany. Otwieram Pocztę — dołącz pobrany plik jako załącznik.',
  mailSubject:'I Was Here — moje plany i pieczątki',mailBody:'W załączniku plik Excel z aplikacji I Was Here (plany podróży, pieczątki, odznaki, dziennik i mapa).',
  err:'Nie udało się przygotować pliku.',readErr:'Nie udało się odczytać pliku. Wybierz plik .xlsx lub .json z aplikacji I Was Here.',
  preview:'Co jest w pliku',merge:'Scal z moimi danymi',update:'Zaktualizuj plany z pliku',cancel:'Anuluj',
  mergeHint:'„Scal” dodaje nowe plany i brakujące miejsca. „Zaktualizuj” zastępuje zawartość planów o tych samych nazwach wersją z pliku. Nic innego nie jest usuwane.',
  pTrips:'Podróże',pDays:'Plany dnia',pStamps:'Pieczątki',pWaw:'Pieczątki Warszawy',pJournal:'Wpisy dziennika',pPhotos:'Zdjęcia',pSkipped:'Pominięte wiersze',
  imported:'Wczytano dane z pliku.',nothing:'W pliku nie ma nowych danych.',
  // arkusze
  shStart:'Start',shPlans:'Plany',shStamps:'Pieczątki',shBadges:'Odznaki',shJournal:'Dziennik',shMap:'Mapa',shPlaces:'Miejsca',shMapData:'_mapa',
  title:'I Was Here — Moje dane',exported:'Wyeksportowano',madeBy:'I Was Here — Places & Memories · Made by Tomasz Kmiecik',
  howTitle:'Jak korzystać z pliku',
  how:[
   '1. „Plany” — każdy wiersz to jedno miejsce w planie. Wpisz nazwę planu, wybierz rodzaj (Podróż / Plan dnia) i miejsce z listy rozwijanej. Kolejność ustala kolumna „Nr”.',
   '2. Typ, województwo i współrzędne uzupełniają się same (formuły z arkusza „Miejsca”). Nie trzeba ich wpisywać.',
   '3. „Mapa” pokazuje zaplanowane miejsca (pomarańczowe) i zdobyte pieczątki (zielone) na mapie Polski. Odświeża się po dopisaniu wierszy.',
   '4. „Pieczątki” — dopisz miejsce z listy, a pieczątka pojawi się w aplikacji po wczytaniu pliku. „Odznaki” liczą postęp w województwach.',
   '5. „Dziennik” — notatki z podróży. Zdjęcia są tylko w pełnej kopii (.json).',
   '6. Wczytanie: aplikacja → Profil → „Wczytaj dane z pliku”. Import scala dane i niczego nie kasuje.',
   'Nie zmieniaj nazw arkuszy ani kolejności kolumn. Arkusz „Miejsca” to katalog — możesz go przeglądać i filtrować.'],
  summary:'Podsumowanie',sTrips:'Podróże',sDays:'Plany dnia',sRows:'Miejsca w planach',sStamps:'Pieczątki',sJournal:'Wpisy dziennika',
  plansHint:'Każdy wiersz = jedno miejsce w planie. Wybierz miejsce z listy (kolumna G). Szare kolumny wypełniają się same.',
  stampsHint:'Każdy wiersz = jedna pieczątka „Byłem tu”. Wybierz miejsce z listy (kolumna A).',
  journalHint:'Notatki z podróży. Nowy wpis: wybierz miejsce z listy i wpisz notatkę. Kolumny „Klucz” nie zmieniaj.',
  badgesHint:'Postęp liczy się sam z arkusza „Pieczątki”. Odznaka województwa = komplet miejsc z przewodnika.',
  mapHint:'Pomarańczowe — zaplanowane miejsca (numer = „Nr” w planie). Zielone — zdobyte pieczątki. Granatowe romby — 14 miast Atlasu.',
  placesHint:'Katalog miejsc aplikacji — z niego korzystają listy rozwijane. Nie edytuj.',
  hPlan:'Plan (nazwa)',hKind:'Rodzaj planu',hDate:'Data',hStart:'Start',hMode:'Tryb',hNo:'Nr',hPlace:'Miejsce',hType:'Typ',hRegion:'Województwo',hLat:'Szer. geogr.',hLon:'Dł. geogr.',
  hTown:'Miejscowość / dzielnica',hKey:'Klucz',hX:'X mapy',hNotes:'Notatki',hPhotos:'Zdjęcia',hUpdated:'Ostatnia zmiana',
  hBadge:'Odznaka',hTotal:'Miejsc w przewodniku',hGot:'Zdobyte pieczątki',hProgress:'Postęp',
  kTrip:'Podróż',kDay:'Plan dnia',mWalk:'Pieszo',mCar:'Samochód',
  tCity:'Miasto',tRegion:'Województwo',tTown:'Miejscowość',tPlace:'Miejsce',tWaw:'Warszawa',
  full:'🏅 Komplet',onWay:'W drodze',citiesBadge:'Miasta Atlasu',wawBadge:'Warszawa — atrakcje',
  sBorder:'Granica Polski',sProv:'Województwa',sPlanned:'Zaplanowane',sVisited:'Byłem tu',sCities:'Miasta',
  wawSub:'Warszawa'
 },
 en:{
  sec:'My data — Excel and backup',
  intro:'Download an Excel file with your plans, stamps, badges, journal and a map. You can plan trips in it (drop-down lists of places) and load it back. Your data stays on this device — the app has no server.',
  xlsx:'📊 Download Excel',xlsxSub:'plans, stamps, badges, journal, map',
  mail:'✉️ Email the Excel file',mailSub:'iPhone: choose “Mail” — the file is attached',
  json:'💾 Full backup with photos',jsonSub:'.json file — includes journal photos',
  imp:'📥 Load data from a file',impSub:'Excel (.xlsx) or full backup (.json)',
  email:'Your email (optional, stored only on this device)',emailPh:'e.g. jan@example.com',
  busy:'Preparing the file…',done:'Done: ',shared:'File handed over for sharing.',
  mailFallback:'File downloaded. Opening Mail — attach the downloaded file.',
  mailSubject:'I Was Here — my plans and stamps',mailBody:'Attached is the Excel file from the I Was Here app (trip plans, stamps, badges, journal and map).',
  err:'Could not prepare the file.',readErr:'Could not read the file. Choose an .xlsx or .json file from the I Was Here app.',
  preview:'What is in the file',merge:'Merge with my data',update:'Update plans from the file',cancel:'Cancel',
  mergeHint:'“Merge” adds new plans and missing places. “Update” replaces plans with the same names with the version from the file. Nothing else is deleted.',
  pTrips:'Trips',pDays:'Day plans',pStamps:'Stamps',pWaw:'Warsaw stamps',pJournal:'Journal entries',pPhotos:'Photos',pSkipped:'Skipped rows',
  imported:'Data loaded from the file.',nothing:'There is no new data in the file.',
  shStart:'Start',shPlans:'Plans',shStamps:'Stamps',shBadges:'Badges',shJournal:'Journal',shMap:'Map',shPlaces:'Places',shMapData:'_map',
  title:'I Was Here — My data',exported:'Exported',madeBy:'I Was Here — Places & Memories · Made by Tomasz Kmiecik',
  howTitle:'How to use this file',
  how:[
   '1. “Plans” — each row is one place in a plan. Type the plan name, choose the kind (Trip / Day plan) and pick a place from the drop-down list. The “No.” column sets the order.',
   '2. Type, province and coordinates fill in automatically (formulas from the “Places” sheet). No need to type them.',
   '3. “Map” shows planned places (orange) and collected stamps (green) on a map of Poland. It updates when you add rows.',
   '4. “Stamps” — add a place from the list and the stamp appears in the app after loading the file. “Badges” count your progress per province.',
   '5. “Journal” — travel notes. Photos are only in the full backup (.json).',
   '6. Loading: app → Profile → “Load data from a file”. Import merges data and deletes nothing.',
   'Do not rename sheets or reorder columns. The “Places” sheet is the catalogue — you can browse and filter it.'],
  summary:'Summary',sTrips:'Trips',sDays:'Day plans',sRows:'Places in plans',sStamps:'Stamps',sJournal:'Journal entries',
  plansHint:'Each row = one place in a plan. Pick the place from the list (column G). Grey columns fill in automatically.',
  stampsHint:'Each row = one “I was here” stamp. Pick the place from the list (column A).',
  journalHint:'Travel notes. New entry: pick the place from the list and type a note. Do not change the “Key” column.',
  badgesHint:'Progress is calculated from the “Stamps” sheet. A province badge = all places from its guide.',
  mapHint:'Orange — planned places (number = “No.” in the plan). Green — collected stamps. Navy diamonds — the 14 Atlas cities.',
  placesHint:'The app’s catalogue of places — used by the drop-down lists. Do not edit.',
  hPlan:'Plan (name)',hKind:'Plan kind',hDate:'Date',hStart:'Start',hMode:'Mode',hNo:'No.',hPlace:'Place',hType:'Type',hRegion:'Province',hLat:'Latitude',hLon:'Longitude',
  hTown:'Town / district',hKey:'Key',hX:'Map X',hNotes:'Notes',hPhotos:'Photos',hUpdated:'Last change',
  hBadge:'Badge',hTotal:'Places in the guide',hGot:'Stamps collected',hProgress:'Progress',
  kTrip:'Trip',kDay:'Day plan',mWalk:'Walking',mCar:'Car',
  tCity:'City',tRegion:'Province',tTown:'Town',tPlace:'Place',tWaw:'Warsaw',
  full:'🏅 Complete',onWay:'In progress',citiesBadge:'Atlas cities',wawBadge:'Warsaw — sights',
  sBorder:'Border of Poland',sProv:'Provinces',sPlanned:'Planned',sVisited:'I was here',sCities:'Cities',
  wawSub:'Warsaw'
 }
};
const tx=l=>T[l||lang()];

// ===================================================================== dane użytkownika
const journalApi=()=>window.IWH_EXTRAS&&IWH_EXTRAS.journal;
async function journalAll(){const j=journalApi();return j?await j.all():[]}
function collectLocal(){
 const w=read('odkryjWarszawe_1',{});
 return{trips:read('iwh_trips',[]),days:read('iwh_days',[]),visited:read('iwh_visited',[]),placeStamps:read('iwh_region_visited',[]),
  favs:read('iwh_region_favs',[]),warsaw:Array.isArray(w.visited)?w.visited:[],legacyTrips:read('tb_saved_trips',[])};
}
const itemKey=it=>it.t==='town'?'town:'+it.region+':'+it.name:it.t+':'+it.id;
function keyToItem(k){const p=String(k).split(':');if(p[0]==='town')return{t:'town',region:p[1],name:p.slice(2).join(':')};return{t:p[0],id:p.slice(1).join(':')}}

// ===================================================================== katalog miejsc (wspólny dla eksportu i importu)
let IDX=null,idxP=null;
function loadIndex(){if(IDX)return Promise.resolve(IDX);if(!idxP)idxP=fetch('./data/index/places.json').then(r=>r.ok?r.json():null).then(j=>{IDX=j&&Array.isArray(j.items)?j:{items:[]};return IDX}).catch(()=>{idxP=null;return{items:[]}});return idxP}
async function catalogue(l){
 const t=tx(l),REG=window.IWH_REGIONS||{regions:[],places:[]},idx=await loadIndex(),GEO=window.POLAND_GEO;
 const regName=id=>{const r=REG.regions.find(x=>x.id===id);return r?(l==='en'?r.en:r.pl):''};
 const out=[];
 const cities=window.IWH_ATLAS&&IWH_ATLAS.cityList?IWH_ATLAS.cityList():[];
 cities.forEach(c=>{const r=REG.regions.find(x=>x.cities.includes(c.id));out.push({key:'city:'+c.id,label:(l==='en'?c.en:c.pl)+' ('+t.tCity.toLowerCase()+')',name:l==='en'?c.en:c.pl,type:t.tCity,region:r?regName(r.id):'',town:l==='en'?c.en:c.pl,lat:c.lat,lon:c.lon,ord:0})});
 REG.regions.forEach(r=>{const g=GEO&&GEO.regions.find(x=>x.id===r.id||x.name===r.geo);const lab=g&&g.label?g.label:[19,52];out.push({key:'region:'+r.id,label:(l==='en'?r.en:r.pl)+' ('+t.tRegion.toLowerCase()+')',name:l==='en'?r.en:r.pl,type:t.tRegion,region:regName(r.id),town:'',lat:lab[1],lon:lab[0],ord:1})});
 const towns=new Map();
 REG.places.forEach(p=>{const k=p.region+':'+p.town;const x=towns.get(k)||{region:p.region,name:p.town,lat:0,lon:0,n:0};x.lat+=p.lat;x.lon+=p.lon;x.n++;towns.set(k,x)});
 towns.forEach(x=>out.push({key:'town:'+x.region+':'+x.name,label:x.name+' — '+t.tTown.toLowerCase()+' ('+regName(x.region)+')',name:x.name,type:t.tTown,region:regName(x.region),town:x.name,lat:x.lat/x.n,lon:x.lon/x.n,ord:2}));
 REG.places.forEach(p=>{const nm=(p.name&&(p.name[l]||p.name.pl))||p.id;out.push({key:'place:'+p.id,label:(p.dwarf?'🧙 ':'')+nm+' · '+p.town,name:nm,type:t.tPlace,region:regName(p.region),town:p.town,lat:p.lat,lon:p.lon,ord:3})});
 idx.items.filter(i=>i.k==='waw').forEach(i=>{const nm=(i.n&&(i.n[l]||i.n.pl))||i.id;out.push({key:'waw:'+i.id,label:nm+' · '+t.wawSub+' ('+i.t+')',name:nm,type:t.tWaw,region:regName('mazowieckie'),town:t.wawSub+' — '+i.t,lat:i.la,lon:i.lo,ord:4})});
 // Etykiety muszą być unikalne (listy rozwijane i odczyt importu po nazwie).
 const seen=new Map();out.forEach(o=>{let lab=o.label,n=2;while(seen.has(lab))lab=o.label+' ('+(n++)+')';o.label=lab;seen.set(lab,o)});
 out.sort((a,b)=>a.ord-b.ord||(a.ord<2?0:a.label.localeCompare(b.label,l==='en'?'en':'pl')));
 return out;
}

// ===================================================================== ZIP (zapis: bez kompresji; odczyt: store + deflate)
const CRC_T=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(u){let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=CRC_T[(c^u[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0}
const enc=new TextEncoder();
async function deflateRaw(u){
 if(typeof CompressionStream==='undefined')return null;
 try{const st=new Blob([u]).stream().pipeThrough(new CompressionStream('deflate-raw'));return new Uint8Array(await new Response(st).arrayBuffer())}catch(e){return null}
}
// Pliki XML kompresujemy (deflate), jeśli przeglądarka to umie — plik Excela jest wtedy kilka razy mniejszy (e-mail).
async function zipAsync(files){
 const out=[];for(const f of files){const data=typeof f.data==='string'?enc.encode(f.data):f.data;const z=data.length>512?await deflateRaw(data):null;out.push(z&&z.length<data.length?{name:f.name,data,z}:{name:f.name,data})}
 return zip(out);
}
function zip(files){
 const now=new Date(),dt=((now.getHours()<<11)|(now.getMinutes()<<5)|(now.getSeconds()>>1))&0xFFFF,dd=(((now.getFullYear()-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate())&0xFFFF;
 const parts=[],central=[];let off=0;
 files.forEach(f=>{
  const name=enc.encode(f.name),data=typeof f.data==='string'?enc.encode(f.data):f.data,crc=crc32(data),body=f.z||data,method=f.z?8:0;
  const h=new DataView(new ArrayBuffer(30));
  h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(8,method,true);h.setUint16(10,dt,true);h.setUint16(12,dd,true);
  h.setUint32(14,crc,true);h.setUint32(18,body.length,true);h.setUint32(22,data.length,true);h.setUint16(26,name.length,true);h.setUint16(28,0,true);
  parts.push(new Uint8Array(h.buffer),name,body);
  const c=new DataView(new ArrayBuffer(46));
  c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);c.setUint16(10,method,true);c.setUint16(12,dt,true);c.setUint16(14,dd,true);
  c.setUint32(16,crc,true);c.setUint32(20,body.length,true);c.setUint32(24,data.length,true);c.setUint16(28,name.length,true);c.setUint32(42,off,true);
  central.push(new Uint8Array(c.buffer),name);
  off+=30+name.length+body.length;
 });
 const csize=central.reduce((a,b)=>a+b.length,0),e=new DataView(new ArrayBuffer(22));
 e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,csize,true);e.setUint32(16,off,true);
 return new Blob([...parts,...central,new Uint8Array(e.buffer)],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}
async function inflateRaw(u){
 if(typeof DecompressionStream==='undefined')throw new Error('no-deflate');
 const s=new Blob([u]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
 return new Uint8Array(await new Response(s).arrayBuffer());
}
async function unzip(buf){
 const u=new Uint8Array(buf),v=new DataView(u.buffer,u.byteOffset,u.byteLength),out=new Map();
 let e=-1;for(let i=u.length-22;i>=Math.max(0,u.length-65558);i--){if(v.getUint32(i,true)===0x06054b50){e=i;break}}
 if(e<0)throw new Error('zip');
 const n=v.getUint16(e+10,true);let p=v.getUint32(e+16,true);
 const dec=new TextDecoder();
 for(let k=0;k<n;k++){
  if(v.getUint32(p,true)!==0x02014b50)throw new Error('zip-cd');
  const method=v.getUint16(p+10,true),csize=v.getUint32(p+20,true),nl=v.getUint16(p+28,true),xl=v.getUint16(p+30,true),cl=v.getUint16(p+32,true),lo=v.getUint32(p+42,true);
  const name=dec.decode(u.subarray(p+46,p+46+nl));
  const lnl=v.getUint16(lo+26,true),lxl=v.getUint16(lo+28,true),start=lo+30+lnl+lxl,data=u.subarray(start,start+csize);
  out.set(name,{method,data});
  p+=46+nl+xl+cl;
 }
 return{names:[...out.keys()],async text(name){const f=out.get(name);if(!f)return null;const d=f.method===0?f.data:f.method===8?await inflateRaw(f.data):null;if(!d)throw new Error('zip-method');return dec.decode(d)}};
}

// ===================================================================== XLSX — zapis
const xesc=s=>String(s??'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g,'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const col=i=>{let s='';i++;while(i>0){const m=(i-1)%26;s=String.fromCharCode(65+m)+s;i=Math.floor((i-1)/26)}return s};
// Style (indeksy cellXfs w styles.xml): 0 zwykły, 1 nagłówek, 2 tytuł, 3 zawijanie, 4 podpowiedź, 5 pole do wpisania,
// 6 formuła (szare), 7 procent, 8 pogrubiony, 9 data, 10 godzina, 11 współrzędne (szare), 12 sekcja
const S={n:0,head:1,title:2,wrap:3,hint:4,input:5,calc:6,pct:7,bold:8,date:9,time:10,coord:11,sect:12};
const STYLES='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+
 '<numFmts count="2"><numFmt numFmtId="164" formatCode="yyyy-mm-dd"/><numFmt numFmtId="165" formatCode="0.00000"/></numFmts>'+
 '<fonts count="6"><font><sz val="11"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font>'+
 '<font><b/><sz val="18"/><color rgb="FF0B3446"/><name val="Calibri"/><family val="2"/></font><font><i/><sz val="10"/><color rgb="FF5F6B6E"/><name val="Calibri"/><family val="2"/></font>'+
 '<font><b/><sz val="11"/><color rgb="FF0B3446"/><name val="Calibri"/><family val="2"/></font><font><sz val="10"/><color rgb="FF5F6B6E"/><name val="Calibri"/><family val="2"/></font></fonts>'+
 '<fills count="6"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>'+
 '<fill><patternFill patternType="solid"><fgColor rgb="FF0B3446"/><bgColor indexed="64"/></patternFill></fill>'+
 '<fill><patternFill patternType="solid"><fgColor rgb="FFFFFBF2"/><bgColor indexed="64"/></patternFill></fill>'+
 '<fill><patternFill patternType="solid"><fgColor rgb="FFEEF1F0"/><bgColor indexed="64"/></patternFill></fill>'+
 '<fill><patternFill patternType="solid"><fgColor rgb="FFFFE2C2"/><bgColor indexed="64"/></patternFill></fill></fills>'+
 '<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFD9D2C0"/></left><right style="thin"><color rgb="FFD9D2C0"/></right><top style="thin"><color rgb="FFD9D2C0"/></top><bottom style="thin"><color rgb="FFD9D2C0"/></bottom><diagonal/></border></borders>'+
 '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'+
 '<cellXfs count="13">'+
 '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'+
 '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>'+
 '<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>'+
 '<xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>'+
 '<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment wrapText="1" vertical="top"/></xf>'+
 '<xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1"/>'+
 '<xf numFmtId="0" fontId="5" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
 '<xf numFmtId="9" fontId="4" fillId="4" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
 '<xf numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="0" applyFont="1"/>'+
 '<xf numFmtId="164" fontId="0" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1"/>'+
 '<xf numFmtId="20" fontId="0" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1"/>'+
 '<xf numFmtId="165" fontId="5" fillId="4" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"/>'+
 '<xf numFmtId="0" fontId="4" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>'+
 '</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';

// Komórka: null | 'tekst' | liczba | {v, s, f, t:'e'|'str'|'n'}
function cellXML(ref,c){
 if(c==null)return '';
 if(typeof c!=='object')c={v:c};
 const s=c.s?' s="'+c.s+'"':'';
 if(c.f!=null){
  const f='<f>'+xesc(c.f)+'</f>';
  if(c.v==null||c.v==='')return '<c r="'+ref+'"'+s+' t="str">'+f+'<v></v></c>';
  if(c.t==='e')return '<c r="'+ref+'"'+s+' t="e">'+f+'<v>'+xesc(c.v)+'</v></c>';
  if(typeof c.v==='number')return '<c r="'+ref+'"'+s+'>'+f+'<v>'+c.v+'</v></c>';
  return '<c r="'+ref+'"'+s+' t="str">'+f+'<v>'+xesc(c.v)+'</v></c>';
 }
 if(c.v==null||c.v==='')return s?'<c r="'+ref+'"'+s+'/>':'';
 if(typeof c.v==='number'&&isFinite(c.v))return '<c r="'+ref+'"'+s+'><v>'+c.v+'</v></c>';
 return '<c r="'+ref+'"'+s+' t="inlineStr"><is><t xml:space="preserve">'+xesc(c.v)+'</t></is></c>';
}
function sheetXML(sh){
 const rows=sh.rows.map((r,i)=>{if(!r)return '';const cells=r.map((c,j)=>cellXML(col(j)+(i+1),c)).join('');const ht=sh.heights&&sh.heights[i]?' ht="'+sh.heights[i]+'" customHeight="1"':'';return cells||ht?'<row r="'+(i+1)+'"'+ht+'>'+cells+'</row>':''}).join('');
 const cols=sh.cols?'<cols>'+sh.cols.map((w,i)=>'<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+(typeof w==='object'?w.w:w)+'" customWidth="1"'+(typeof w==='object'&&w.hidden?' hidden="1"':'')+'/>').join('')+'</cols>':'';
 const freeze=sh.freeze?'<pane ySplit="'+sh.freeze+'" topLeftCell="A'+(sh.freeze+1)+'" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A'+(sh.freeze+1)+'" sqref="A'+(sh.freeze+1)+'"/>':'';
 const merges=sh.merges&&sh.merges.length?'<mergeCells count="'+sh.merges.length+'">'+sh.merges.map(m=>'<mergeCell ref="'+m+'"/>').join('')+'</mergeCells>':'';
 const dv=sh.lists&&sh.lists.length?'<dataValidations count="'+sh.lists.length+'">'+sh.lists.map(d=>'<dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="'+(d.strict?1:0)+'" sqref="'+d.ref+'"><formula1>'+xesc(d.f)+'</formula1></dataValidation>').join('')+'</dataValidations>':'';
 const af=sh.filter?'<autoFilter ref="'+sh.filter+'"/>':'';
 return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'+
  (sh.tab?'<sheetPr><tabColor rgb="'+sh.tab+'"/></sheetPr>':'')+
  '<sheetViews><sheetView workbookViewId="0"'+(sh.active?' tabSelected="1"':'')+(sh.noGrid?' showGridLines="0"':'')+'>'+freeze+'</sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/>'+cols+'<sheetData>'+rows+'</sheetData>'+af+merges+dv+
  '<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/>'+(sh.drawing?'<drawing r:id="rId1"/>':'')+'</worksheet>';
}
const qs=n=>"'"+String(n).replace(/'/g,"''")+"'";
const excelDate=iso=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso||'');if(!m)return null;return Math.round((Date.UTC(+m[1],+m[2]-1,+m[3])-Date.UTC(1899,11,30))/864e5)};
const excelTime=hm=>{const m=/^(\d{1,2}):(\d{2})/.exec(hm||'');return m?(+m[1]*60+(+m[2]))/1440:null};

// Uproszczenie łamanej (Douglas–Peucker) — mapa w Excelu nie potrzebuje pełnej rozdzielczości granic.
function simplify(pts,eps){
 if(pts.length<3)return pts;const keep=new Uint8Array(pts.length);keep[0]=keep[pts.length-1]=1;const st=[[0,pts.length-1]];
 while(st.length){const [a,b]=st.pop();let dm=0,ix=-1;const [x1,y1]=pts[a],[x2,y2]=pts[b],dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1e-9;
  for(let i=a+1;i<b;i++){const d=Math.abs(dy*(pts[i][0]-x1)-dx*(pts[i][1]-y1))/L;if(d>dm){dm=d;ix=i}}
  if(dm>eps&&ix>0){keep[ix]=1;st.push([a,ix],[ix,b])}}
 return pts.filter((_,i)=>keep[i]);
}

async function buildXLSX(opts){
 const l=(opts&&opts.lang)||lang(),t=tx(l),data=collectLocal(),journal=await journalAll(),cat=await catalogue(l);
 const byKey=new Map(cat.map(c=>[c.key,c]));
 const N=cat.length,CAT_LAST=N+1; // Miejsca: nagłówek w wierszu 1, dane od 2
 const rng=c=>qs(t.shPlaces)+'!$'+c+'$2:$'+c+'$'+CAT_LAST;
 const lookup=(ref,c)=>'IFERROR(INDEX('+rng(c)+',MATCH('+ref+','+rng('A')+',0)),"")';
 const lookupNA=(ref,c)=>'IFERROR(INDEX('+rng(c)+',MATCH('+ref+','+rng('A')+',0)),NA())';
 const sheets=[];

 // ---- Miejsca (katalog): A nazwa | B typ | C województwo | D miejscowość | E szer. | F dł. | G klucz | H X mapy
 const places={name:t.shPlaces,tab:'FF5F6B6E',freeze:1,filter:'A1:G'+CAT_LAST,cols:[52,14,22,26,11,11,30,{w:9,hidden:true}],
  rows:[[{v:t.hPlace,s:S.head},{v:t.hType,s:S.head},{v:t.hRegion,s:S.head},{v:t.hTown,s:S.head},{v:t.hLat,s:S.head},{v:t.hLon,s:S.head},{v:t.hKey,s:S.head},{v:t.hX,s:S.head}]]};
 cat.forEach(c=>places.rows.push([c.label,c.type,c.region,c.town,{v:+c.lat.toFixed(5),s:S.coord},{v:+c.lon.toFixed(5),s:S.coord},{v:c.key,s:S.calc},+(c.lon*KX).toFixed(5)]));

 // ---- Plany: A plan | B rodzaj | C data | D start | E tryb | F nr | G miejsce | H typ | I województwo | J szer. | K dł.
 const HEAD=4,FIRST=5;
 const planRows=[];
 data.trips.forEach(p=>(p.items.length?p.items:[null]).forEach((it,i)=>planRows.push({plan:p,kind:'trip',it,i})));
 data.days.slice().sort((a,b)=>(a.date||'').localeCompare(b.date||'')).forEach(p=>(p.items.length?p.items:[null]).forEach((it,i)=>planRows.push({plan:p,kind:'day',it,i})));
 const planCap=Math.max(300,planRows.length+150),planLast=FIRST+planCap-1;
 const plans={name:t.shPlans,tab:'FFF47C28',active:false,freeze:HEAD,cols:[26,13,12,8,11,5,52,13,20,11,11],
  rows:[[{v:t.shPlans,s:S.title}],[{v:t.plansHint,s:S.hint}],null,
   [t.hPlan,t.hKind,t.hDate,t.hStart,t.hMode,t.hNo,t.hPlace,t.hType,t.hRegion,t.hLat,t.hLon].map(v=>({v,s:S.head}))],
  merges:['A2:K2'],heights:[28,30],
  lists:[{ref:'B'+FIRST+':B'+planLast,f:'"'+t.kTrip+','+t.kDay+'"',strict:true},{ref:'E'+FIRST+':E'+planLast,f:'"'+t.mWalk+','+t.mCar+'"',strict:true},{ref:'G'+FIRST+':G'+planLast,f:rng('A')}]};
 const mapPlanned=[];
 for(let i=0;i<planCap;i++){
  const r=FIRST+i,row=planRows[i],c=row&&row.it?byKey.get(itemKey(row.it)):null;
  const label=c?c.label:(row&&row.it&&row.it.t==='waw'&&row.it.name?row.it.name:'');
  plans.rows.push([
   {v:row?row.plan.name:'',s:S.input},
   {v:row?(row.kind==='trip'?t.kTrip:t.kDay):'',s:S.input},
   {v:row&&row.kind==='day'?excelDate(row.plan.date):null,s:S.date},
   {v:row&&row.kind==='day'?excelTime(row.plan.start||'09:00'):null,s:S.time},
   {v:row&&row.kind==='day'?(row.plan.mode==='walking'?t.mWalk:t.mCar):'',s:S.input},
   {v:row&&row.it?row.i+1:null,s:S.input},
   {v:label,s:S.input},
   {f:lookup('$G'+r,'B'),v:c?c.type:'',s:S.calc},
   {f:lookup('$G'+r,'C'),v:c?c.region:'',s:S.calc},
   {f:lookup('$G'+r,'E'),v:c?+c.lat.toFixed(5):'',s:S.coord},
   {f:lookup('$G'+r,'F'),v:c?+c.lon.toFixed(5):'',s:S.coord}]);
  mapPlanned.push({r,c,no:row&&row.it?row.i+1:''});
 }

 // ---- Pieczątki: A miejsce | B typ | C województwo | D miejscowość
 const stampKeys=[...data.visited,...data.placeStamps.map(id=>'place:'+id),...data.warsaw.map(id=>'waw:'+id)];
 const stampCap=Math.max(400,stampKeys.length+250),stampLast=FIRST+stampCap-1;
 const stamps={name:t.shStamps,tab:'FF2E7D4F',freeze:HEAD,cols:[56,14,22,28],
  rows:[[{v:t.shStamps,s:S.title}],[{v:t.stampsHint,s:S.hint}],null,[t.hPlace,t.hType,t.hRegion,t.hTown].map(v=>({v,s:S.head}))],
  merges:['A2:D2'],heights:[28,30],lists:[{ref:'A'+FIRST+':A'+stampLast,f:rng('A')}]};
 const mapVisited=[];
 for(let i=0;i<stampCap;i++){
  const r=FIRST+i,k=stampKeys[i],c=k?byKey.get(k):null;
  stamps.rows.push([{v:c?c.label:'',s:S.input},{f:lookup('$A'+r,'B'),v:c?c.type:'',s:S.calc},{f:lookup('$A'+r,'C'),v:c?c.region:'',s:S.calc},{f:lookup('$A'+r,'D'),v:c?c.town:'',s:S.calc}]);
  mapVisited.push({r,c});
 }

 // ---- Odznaki: postęp województw (formuły z arkusza Pieczątki)
 const REG=window.IWH_REGIONS||{regions:[],places:[]};
 const stRange=c=>qs(t.shStamps)+'!$'+c+'$'+FIRST+':$'+c+'$'+stampLast;
 const badges={name:t.shBadges,tab:'FFFFB24A',cols:[30,20,18,11,16],noGrid:true,
  rows:[[{v:t.shBadges,s:S.title}],[{v:t.badgesHint,s:S.hint}],null,[t.hBadge,t.hTotal,t.hGot,t.hProgress,''].map(v=>({v,s:S.head}))],merges:['A2:E2'],heights:[28,30]};
 const stampTypes=stampKeys.map(k=>byKey.get(k)).filter(Boolean);
 const addBadge=(label,totalF,totalV,gotF,gotV)=>{const r=badges.rows.length+1;badges.rows.push([{v:label,s:S.bold},{f:totalF,v:totalV,s:S.calc},{f:gotF,v:gotV,s:S.calc},{f:'IF(B'+r+'=0,"",MIN(1,C'+r+'/B'+r+'))',v:totalV?Math.min(1,gotV/totalV):'',s:S.pct},{f:'IF(AND(B'+r+'>0,C'+r+'>=B'+r+'),"'+t.full+'",IF(C'+r+'>0,"'+t.onWay+'",""))',v:totalV&&gotV>=totalV?t.full:gotV>0?t.onWay:'',s:S.sect}])};
 const dwarfTotal=cat.filter(c=>c.key.startsWith('place:wr-dwarf-')).length;
 const dwarfFound=new Set(stampTypes.filter(c=>c.key.startsWith('place:wr-dwarf-')).map(c=>c.key)).size;
 if(dwarfTotal)[1,5,10,25,50,100,250,dwarfTotal].forEach(n=>addBadge('🧙 '+(l==='en'?'Dwarfs':'Krasnale')+' · '+n,String(n),n,'MIN('+n+',COUNTIF('+stRange('A')+',"🧙 *"))',Math.min(n,dwarfFound)));
 const nCities=cat.filter(c=>c.ord===0).length,gotCities=stampTypes.filter(c=>c.ord===0).length;
 addBadge(t.citiesBadge,'COUNTIF('+rng('B')+',"'+t.tCity+'")',nCities,'COUNTIF('+stRange('B')+',"'+t.tCity+'")',gotCities);
 const nWaw=cat.filter(c=>c.ord===4).length,gotWaw=stampTypes.filter(c=>c.ord===4).length;
 addBadge(t.wawBadge,'COUNTIF('+rng('B')+',"'+t.tWaw+'")',nWaw,'COUNTIF('+stRange('B')+',"'+t.tWaw+'")',gotWaw);
 REG.regions.forEach(rg=>{const nm=l==='en'?rg.en:rg.pl,tot=cat.filter(c=>c.ord===3&&c.region===nm).length;if(!tot)return;const got=stampTypes.filter(c=>c.ord===3&&c.region===nm).length;
  addBadge('🗺️ '+nm,'COUNTIFS('+rng('B')+',"'+t.tPlace+'",'+rng('C')+',"'+nm+'")',tot,'COUNTIFS('+stRange('B')+',"'+t.tPlace+'",'+stRange('C')+',"'+nm+'")',got)});

 // ---- Dziennik: A miejsce | B notatki | C zdjęcia | D ostatnia zmiana | E klucz
 const jRows=journal.slice().sort((a,b)=>(b.updated||'').localeCompare(a.updated||''));
 const jCap=Math.max(100,jRows.length+60),jLast=FIRST+jCap-1;
 const jour={name:t.shJournal,tab:'FF8A5A44',freeze:HEAD,cols:[44,70,9,18,26],
  rows:[[{v:t.shJournal,s:S.title}],[{v:t.journalHint,s:S.hint}],null,[t.hPlace,t.hNotes,t.hPhotos,t.hUpdated,t.hKey].map(v=>({v,s:S.head}))],
  merges:['A2:E2'],heights:[28,30],lists:[{ref:'A'+FIRST+':A'+jLast,f:rng('A')}]};
 const jKeyToCat=k=>/^reg:/.test(k)?byKey.get('place:'+k.slice(4)):/^waw:/.test(k)?byKey.get(k):/^atlas:/.test(k)?byKey.get(k.slice(6)):null;
 for(let i=0;i<jCap;i++){const e=jRows[i],c=e?jKeyToCat(e.key):null;
  jour.rows.push([{v:e?(c?c.label:e.title||e.key):'',s:S.input},{v:e?e.notes||'':'',s:S.wrap},{v:e?(e.photos||[]).length:null,s:S.calc},{v:e&&e.updated?e.updated.slice(0,16).replace('T',' '):'',s:S.calc},{v:e?e.key:'',s:S.calc}])}

 // ---- _mapa (ukryty): A,B granice | D,E,F zaplanowane | G,H byłem tu | J,K,L miasta
 const GEO=window.POLAND_GEO,md={name:t.shMapData,hidden:true,rows:[['x','y',null,'px','py','nr','vx','vy',null,'cx','cy','city']]};
 const lines=[];
 if(GEO){lines.push(simplify(GEO.border,.02));lines.push(null);GEO.regions.forEach(g=>{lines.push(simplify(g.coords,.03));lines.push(null)})}
 const borderPts=[];let provStart=0;
 lines.forEach((ln,i)=>{if(i===1)provStart=borderPts.length+1;if(!ln){borderPts.push(null);return}ln.forEach(p=>borderPts.push([+(p[0]*KX).toFixed(4),+p[1].toFixed(4)]))});
 const cityCat=cat.filter(c=>c.ord===0);
 const mdLen=Math.max(borderPts.length,mapPlanned.length,mapVisited.length,cityCat.length);
 for(let i=0;i<mdLen;i++){
  const row=[],b=borderPts[i],pp=mapPlanned[i],vv=mapVisited[i],cc=cityCat[i];
  row[0]=b?b[0]:null;row[1]=b?b[1]:null;
  if(pp){row[3]={f:lookupNA(qs(t.shPlans)+'!$G'+pp.r,'H'),v:pp.c?+(pp.c.lon*KX).toFixed(5):'#N/A',t:pp.c?null:'e'};row[4]={f:lookupNA(qs(t.shPlans)+'!$G'+pp.r,'E'),v:pp.c?+pp.c.lat.toFixed(5):'#N/A',t:pp.c?null:'e'};row[5]={f:'IF('+qs(t.shPlans)+'!$F'+pp.r+'="","",'+qs(t.shPlans)+'!$F'+pp.r+')',v:pp.no===''?'':pp.no}}
  if(vv){row[6]={f:lookupNA(qs(t.shStamps)+'!$A'+vv.r,'H'),v:vv.c?+(vv.c.lon*KX).toFixed(5):'#N/A',t:vv.c?null:'e'};row[7]={f:lookupNA(qs(t.shStamps)+'!$A'+vv.r,'E'),v:vv.c?+vv.c.lat.toFixed(5):'#N/A',t:vv.c?null:'e'}}
  if(cc){row[9]=+(cc.lon*KX).toFixed(5);row[10]=+cc.lat.toFixed(5);row[11]=cc.name}
  md.rows.push(row);
 }
 const mdRef=(c,a,b)=>qs(t.shMapData)+'!$'+c+'$'+a+':$'+c+'$'+b;
 const series=[
  {name:t.sBorder,x:mdRef('A',2,provStart),y:mdRef('B',2,provStart),line:'0B3446',w:22000,pts:borderPts.slice(0,provStart-1)},
  {name:t.sProv,x:mdRef('A',provStart+1,borderPts.length+1),y:mdRef('B',provStart+1,borderPts.length+1),line:'9CA88A',w:9525,pts:borderPts.slice(provStart)},
  {name:t.sCities,x:mdRef('J',2,cityCat.length+1),y:mdRef('K',2,cityCat.length+1),marker:'diamond',size:6,color:'0B3446',pts:cityCat.map(c=>[c.lon*KX,c.lat])},
  {name:t.sVisited,x:mdRef('G',2,mapVisited.length+1),y:mdRef('H',2,mapVisited.length+1),marker:'circle',size:8,color:'2E7D4F',pts:mapVisited.map(v=>v.c?[v.c.lon*KX,v.c.lat]:null)},
  {name:t.sPlanned,x:mdRef('D',2,mapPlanned.length+1),y:mdRef('E',2,mapPlanned.length+1),marker:'circle',size:10,color:'F47C28',pts:mapPlanned.map(p=>p.c?[p.c.lon*KX,p.c.lat]:null),
   labels:mdRef('F',2,mapPlanned.length+1),labelVals:mapPlanned.map(p=>p.c?String(p.no):'')}
 ];

 // ---- Mapa (wykres) i lista planowanych miejsc obok
 const mapSheet={name:t.shMap,tab:'FF0B3446',drawing:true,noGrid:true,
  rows:[[{v:t.shMap,s:S.title}],[{v:t.mapHint,s:S.hint}]],merges:['A2:AH2'],heights:[28,34]};
 mapSheet.cols=[...Array(30).fill(2.6),3,6,26,52];
 // Lista obok mapy: plan · nr · miejsce (formuły, więc zmienia się razem z arkuszem Plany)
 mapSheet.rows[3]=[];mapSheet.rows[3][31]={v:t.hNo,s:S.head};mapSheet.rows[3][32]={v:t.hPlan,s:S.head};mapSheet.rows[3][33]={v:t.hPlace,s:S.head};
 const listN=Math.min(planCap,60);
 for(let i=0;i<listN;i++){const r=FIRST+i,row=planRows[i],c=row&&row.it?byKey.get(itemKey(row.it)):null,R=[];
  R[31]={f:'IF('+qs(t.shPlans)+'!$G'+r+'="","",'+qs(t.shPlans)+'!$F'+r+')',v:c?row.i+1:'',s:S.calc};
  R[32]={f:'IF('+qs(t.shPlans)+'!$G'+r+'="","",'+qs(t.shPlans)+'!$A'+r+')',v:c?row.plan.name:'',s:S.calc};
  R[33]={f:'IF('+qs(t.shPlans)+'!$G'+r+'="","",'+qs(t.shPlans)+'!$G'+r+')',v:c?c.label:'',s:S.calc};
  mapSheet.rows[4+i]=R}

 // ---- Start
 const nTripsV=data.trips.length,nDaysV=data.days.length;
 const start={name:t.shStart,tab:'FF0B3446',active:true,noGrid:true,cols:[34,64],
  rows:[[{v:t.title,s:S.title}],[{v:t.exported+': '+new Date().toLocaleString(l==='en'?'en-GB':'pl-PL'),s:S.hint}],[{v:t.madeBy,s:S.hint}],null,
   [{v:t.howTitle,s:S.bold}],...t.how.map(h=>[{v:h,s:S.wrap}]),null,
   [{v:t.summary,s:S.bold}],
   [t.sTrips,{v:nTripsV,s:S.calc}],[t.sDays,{v:nDaysV,s:S.calc}],
   [t.sRows,{f:'SUMPRODUCT(--('+qs(t.shPlans)+'!$G$'+FIRST+':$G$'+planLast+'<>""))',v:planRows.filter(r=>r.it).length,s:S.calc}],
   [t.sStamps,{f:'SUMPRODUCT(--('+qs(t.shStamps)+'!$A$'+FIRST+':$A$'+stampLast+'<>""))',v:stampKeys.length,s:S.calc}],
   [t.sJournal,{f:'SUMPRODUCT(--('+qs(t.shJournal)+'!$A$'+FIRST+':$A$'+jLast+'<>""))',v:jRows.length,s:S.calc}]],
  merges:t.how.map((_,i)=>'A'+(6+i)+':B'+(6+i)),heights:[30,18,18,null,null,...t.how.map(()=>34)]};

 sheets.push(start,plans,stamps,badges,jour,mapSheet,places,md);
 const mapIdx=sheets.indexOf(mapSheet)+1;

 // ---- pliki pakietu
 const files=[];
 files.push({name:'[Content_Types].xml',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>'+
  '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'+
  sheets.map((_,i)=>'<Override PartName="/xl/worksheets/sheet'+(i+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join('')+
  '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'+
  '<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>'+
  '<Override PartName="/xl/charts/chart1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>'+
  '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>'});
 files.push({name:'_rels/.rels',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>'});
 const nowIso=new Date().toISOString().replace(/\.\d+Z$/,'Z');
 files.push({name:'docProps/core.xml',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>'+xesc(t.title)+'</dc:title><dc:creator>I Was Here</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">'+nowIso+'</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">'+nowIso+'</dcterms:modified></cp:coreProperties>'});
 files.push({name:'docProps/app.xml',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>I Was Here '+APP_VERSION+'</Application></Properties>'});
 files.push({name:'xl/workbook.xml',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView activeTab="0"/></bookViews><sheets>'+
  sheets.map((s,i)=>'<sheet name="'+xesc(s.name)+'" sheetId="'+(i+1)+'"'+(s.hidden?' state="hidden"':'')+' r:id="rId'+(i+1)+'"/>').join('')+'</sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>'});
 files.push({name:'xl/_rels/workbook.xml.rels',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
  sheets.map((_,i)=>'<Relationship Id="rId'+(i+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+(i+1)+'.xml"/>').join('')+
  '<Relationship Id="rId'+(sheets.length+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'});
 files.push({name:'xl/styles.xml',data:STYLES});
 sheets.forEach((s,i)=>files.push({name:'xl/worksheets/sheet'+(i+1)+'.xml',data:sheetXML(s)}));
 files.push({name:'xl/worksheets/_rels/sheet'+mapIdx+'.xml.rels',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>'});
 files.push({name:'xl/drawings/drawing1.xml',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart">'+
  '<xdr:twoCellAnchor editAs="oneCell"><xdr:from><xdr:col>0</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>3</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from><xdr:to><xdr:col>30</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>34</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>'+
  '<xdr:graphicFrame macro=""><xdr:nvGraphicFramePr><xdr:cNvPr id="2" name="'+xesc(t.shMap)+'"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr><xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm>'+
  '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart"><c:chart r:id="rId1"/></a:graphicData></a:graphic></xdr:graphicFrame><xdr:clientData/></xdr:twoCellAnchor></xdr:wsDr>'});
 files.push({name:'xl/drawings/_rels/drawing1.xml.rels',data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart1.xml"/></Relationships>'});
 files.push({name:'xl/charts/chart1.xml',data:chartXML(t,series)});
 return zipAsync(files);
}

function numCache(pts,axis){
 const v=pts.map((p,i)=>p?'<c:pt idx="'+i+'"><c:v>'+(+p[axis]).toFixed(5)+'</c:v></c:pt>':'').join('');
 return '<c:numCache><c:formatCode>General</c:formatCode><c:ptCount val="'+pts.length+'"/>'+v+'</c:numCache>';
}
function chartXML(t,series){
 const C15='http://schemas.microsoft.com/office/drawing/2012/chart';
 const ser=series.map((s,i)=>{
  const sp=s.line?'<c:spPr><a:ln w="'+s.w+'" cap="rnd"><a:solidFill><a:srgbClr val="'+s.line+'"/></a:solidFill><a:round/></a:ln></c:spPr><c:marker><c:symbol val="none"/></c:marker>':
   '<c:spPr><a:ln w="19050"><a:noFill/></a:ln></c:spPr><c:marker><c:symbol val="'+s.marker+'"/><c:size val="'+s.size+'"/><c:spPr><a:solidFill><a:srgbClr val="'+s.color+'"/></a:solidFill><a:ln w="9525"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill></a:ln></c:spPr></c:marker>';
  const dl=s.labels?'<c:dLbls><c:spPr><a:noFill/><a:ln><a:noFill/></a:ln></c:spPr><c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="900" b="1"><a:solidFill><a:srgbClr val="0B3446"/></a:solidFill></a:defRPr></a:pPr><a:endParaRPr lang="pl-PL"/></a:p></c:txPr><c:dLblPos val="r"/><c:showLegendKey val="0"/><c:showVal val="0"/><c:showCatName val="0"/><c:showSerName val="0"/><c:showPercent val="0"/><c:showBubbleSize val="0"/>'+
   '<c:extLst><c:ext uri="{CE6537A1-D6FC-4f65-9D91-7224C49458BB}" xmlns:c15="'+C15+'"><c15:showDataLabelsRange val="1"/><c15:showLeaderLines val="0"/></c:ext></c:extLst></c:dLbls>':'';
  const ext=s.labels?'<c:extLst><c:ext uri="{02D57815-91ED-43cb-92C2-25804820EDAC}" xmlns:c15="'+C15+'"><c15:datalabelsRange><c15:f>'+xesc(s.labels)+'</c15:f><c15:dlblRangeCache><c:ptCount val="'+s.labelVals.length+'"/>'+s.labelVals.map((v,i)=>v!==''?'<c:pt idx="'+i+'"><c:v>'+xesc(v)+'</c:v></c:pt>':'').join('')+'</c15:dlblRangeCache></c15:datalabelsRange></c:ext></c:extLst>':'';
  return '<c:ser><c:idx val="'+i+'"/><c:order val="'+i+'"/><c:tx><c:v>'+xesc(s.name)+'</c:v></c:tx>'+sp+dl+
   '<c:xVal><c:numRef><c:f>'+xesc(s.x)+'</c:f>'+numCache(s.pts,0)+'</c:numRef></c:xVal><c:yVal><c:numRef><c:f>'+xesc(s.y)+'</c:f>'+numCache(s.pts,1)+'</c:numRef></c:yVal><c:smooth val="0"/>'+ext+'</c:ser>';
 }).join('');
 // Zakres osi = prostokąt Polski w tej samej projekcji co Atlas (proporcje mapy jak w aplikacji).
 const ax=(id,cross,pos,min,max)=>'<c:valAx><c:axId val="'+id+'"/><c:scaling><c:orientation val="minMax"/><c:max val="'+max+'"/><c:min val="'+min+'"/></c:scaling><c:delete val="1"/><c:axPos val="'+pos+'"/><c:numFmt formatCode="General" sourceLinked="0"/><c:majorTickMark val="none"/><c:minorTickMark val="none"/><c:tickLblPos val="none"/><c:crossAx val="'+cross+'"/><c:crosses val="autoZero"/><c:crossBetween val="midCat"/></c:valAx>';
 return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><c:roundedCorners val="0"/>'+
  '<c:chart><c:autoTitleDeleted val="1"/><c:plotArea><c:layout><c:manualLayout><c:layoutTarget val="inner"/><c:xMode val="edge"/><c:yMode val="edge"/><c:x val="0.03"/><c:y val="0.03"/><c:w val="0.94"/><c:h val="0.84"/></c:manualLayout></c:layout>'+
  '<c:scatterChart><c:scatterStyle val="lineMarker"/><c:varyColors val="0"/>'+ser+'<c:axId val="500100"/><c:axId val="500200"/></c:scatterChart>'+
  ax(500100,500200,'b',(14.0*KX).toFixed(3),(24.3*KX).toFixed(3))+ax(500200,500100,'l','48.95','54.95')+
  '<c:spPr><a:solidFill><a:srgbClr val="F6F1E4"/></a:solidFill><a:ln><a:noFill/></a:ln></c:spPr></c:plotArea>'+
  '<c:legend><c:legendPos val="b"/><c:legendEntry><c:idx val="1"/><c:delete val="1"/></c:legendEntry><c:overlay val="0"/><c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="1000"><a:solidFill><a:srgbClr val="0B3446"/></a:solidFill></a:defRPr></a:pPr><a:endParaRPr lang="pl-PL"/></a:p></c:txPr></c:legend>'+
  '<c:plotVisOnly val="1"/><c:dispBlanksAs val="gap"/></c:chart>'+
  '<c:spPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:ln w="9525"><a:solidFill><a:srgbClr val="D9D2C0"/></a:solidFill></a:ln></c:spPr></c:chartSpace>';
}

// ===================================================================== XLSX — odczyt
async function readXLSX(buf){
 const z=await unzip(buf),P=new DOMParser();
 const xml=async n=>{const s=await z.text(n);return s==null?null:P.parseFromString(s,'application/xml')};
 const wb=await xml('xl/workbook.xml');if(!wb)throw new Error('no-workbook');
 const rels=await xml('xl/_rels/workbook.xml.rels'),relMap={};
 if(rels)[...rels.getElementsByTagName('Relationship')].forEach(r=>{relMap[r.getAttribute('Id')]=r.getAttribute('Target')});
 const ss=[],sst=await xml('xl/sharedStrings.xml');
 if(sst)[...sst.getElementsByTagName('si')].forEach(si=>ss.push([...si.getElementsByTagName('t')].map(t=>t.textContent).join('')));
 const out={};
 for(const s of [...wb.getElementsByTagName('sheet')]){
  const name=s.getAttribute('name'),rid=s.getAttribute('r:id')||s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id');
  let target=relMap[rid];if(!target)continue;target=target.replace(/^\//,'');if(!target.startsWith('xl/'))target='xl/'+target;
  const doc=await xml(target);if(!doc)continue;
  const rows=[];
  [...doc.getElementsByTagName('row')].forEach(r=>{const ri=+r.getAttribute('r')-1;const row=rows[ri]=[];
   [...r.getElementsByTagName('c')].forEach(c=>{const ref=c.getAttribute('r')||'',m=/^([A-Z]+)/.exec(ref);if(!m)return;let ci=0;for(const ch of m[1])ci=ci*26+ch.charCodeAt(0)-64;ci--;
    const ty=c.getAttribute('t'),v=c.getElementsByTagName('v')[0];let val;
    if(ty==='s')val=v?ss[+v.textContent]:'';else if(ty==='inlineStr'){val=[...c.getElementsByTagName('t')].map(t=>t.textContent).join('')}
    else if(ty==='str'||ty==='e')val=v?v.textContent:'';else if(ty==='b')val=v?v.textContent==='1':false;else val=v&&v.textContent!==''?+v.textContent:null;
    row[ci]=val})});
  out[name]=rows;
 }
 return out;
}
const cellStr=v=>v==null?'':typeof v==='number'?String(v):String(v).trim();
function toDate(v){if(typeof v==='number'&&v>20000&&v<80000){const d=new Date(Date.UTC(1899,11,30)+Math.round(v)*864e5);return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate())}
 const s=cellStr(v);let m=/^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);if(m)return m[1]+'-'+pad(+m[2])+'-'+pad(+m[3]);m=/^(\d{1,2})[./](\d{1,2})[./](\d{4})/.exec(s);if(m)return m[3]+'-'+pad(+m[2])+'-'+pad(+m[1]);return ''}
function toTime(v){if(typeof v==='number'&&v>=0&&v<1){const m=Math.round(v*1440);return pad(Math.floor(m/60))+':'+pad(m%60)}const m=/^(\d{1,2})[:.](\d{2})/.exec(cellStr(v));return m?pad(+m[1])+':'+m[2]:''}

// Rozpoznaj arkusz po nazwie (PL lub EN) i wiersz nagłówka po tekście w kolumnie A.
function findSheet(book,key){const names=[T.pl[key],T.en[key]];for(const n of Object.keys(book))if(names.includes(n))return book[n];return null}
function headerRow(rows,key){const names=[norm(T.pl[key]),norm(T.en[key])];for(let i=0;i<Math.min(12,rows.length);i++){const r=rows[i];if(r&&names.includes(norm(r[0])))return i}return 3}

async function parseXLSX(buf){
 const book=await readXLSX(buf);
 const cats={pl:await catalogue('pl'),en:await catalogue('en')};
 const byLabel=new Map(),byName=new Map();
 ['pl','en'].forEach(l=>cats[l].forEach(c=>{byLabel.set(norm(c.label),c.key);const n=norm(c.name);byName.set(n,byName.has(n)&&byName.get(n)!==c.key?'?':c.key)}));
 const keyOf=(label,keyCell)=>{const k=cellStr(keyCell);if(k&&/^(city|region|town|place|waw):/.test(k))return k;const n=norm(label);if(!n)return null;if(byLabel.has(n))return byLabel.get(n);const b=byName.get(n);return b&&b!=='?'?b:null};
 const res={trips:[],days:[],visited:[],placeStamps:[],warsaw:[],journal:[],skipped:[]};
 // Plany
 const pl=findSheet(book,'shPlans');
 if(pl){const h=headerRow(pl,'hPlan'),groups=new Map();
  for(let i=h+1;i<pl.length;i++){const r=pl[i]||[];const name=cellStr(r[0]),place=cellStr(r[6]);if(!name&&!place)continue;
   const kindRaw=norm(r[1]),kind=kindRaw===norm(T.pl.kDay)||kindRaw===norm(T.en.kDay)?'day':'trip';
   const gk=kind+'\u0001'+(name||'—');let g=groups.get(gk);
   if(!g){g={kind,name:name||(kind==='day'?T[lang()].kDay:T[lang()].kTrip),date:'',start:'',mode:'',items:[]};groups.set(gk,g)}
   if(!g.date)g.date=toDate(r[2]);if(!g.start)g.start=toTime(r[3]);
   if(!g.mode&&cellStr(r[4])){const m=norm(r[4]);g.mode=m===norm(T.pl.mWalk)||m===norm(T.en.mWalk)?'walking':'driving'}
   if(!place)continue;const k=keyOf(place);if(!k){res.skipped.push((T[lang()].shPlans)+' '+(i+1)+': '+place);continue}
   const no=typeof r[5]==='number'?r[5]:parseFloat(cellStr(r[5]));g.items.push({k,no:isFinite(no)?no:1e6+i,row:i})}
  groups.forEach(g=>{g.items.sort((a,b)=>a.no-b.no||a.row-b.row);const seen=new Set();const items=[];g.items.forEach(x=>{if(!seen.has(x.k)){seen.add(x.k);items.push(x.k)}});
   const plan={name:g.name,keys:items};if(g.kind==='day'){plan.date=g.date;plan.start=g.start||'09:00';if(g.mode)plan.mode=g.mode}(g.kind==='day'?res.days:res.trips).push(plan)});
 }
 // Pieczątki
 const st=findSheet(book,'shStamps');
 if(st){const h=headerRow(st,'hPlace');for(let i=h+1;i<st.length;i++){const r=st[i]||[];const lab=cellStr(r[0]);if(!lab)continue;const k=keyOf(lab);
  if(!k){res.skipped.push(T[lang()].shStamps+' '+(i+1)+': '+lab);continue}
  if(k.startsWith('place:'))res.placeStamps.push(k.slice(6));else if(k.startsWith('waw:'))res.warsaw.push(k.slice(4));else res.visited.push(k)}}
 // Dziennik
 const jr=findSheet(book,'shJournal');
 if(jr){const h=headerRow(jr,'hPlace');for(let i=h+1;i<jr.length;i++){const r=jr[i]||[];const lab=cellStr(r[0]),notes=cellStr(r[1]),jk=cellStr(r[4]);if(!notes)continue;
  let key=/^(reg|waw|atlas):/.test(jk)?jk:null;
  if(!key){const k=keyOf(lab);if(!k){res.skipped.push(T[lang()].shJournal+' '+(i+1)+': '+lab);continue}key=k.startsWith('place:')?'reg:'+k.slice(6):k.startsWith('waw:')?k:'atlas:'+k}
  res.journal.push({key,title:lab,notes})}}
 if(!pl&&!st&&!jr)throw new Error('not-iwh');
 return res;
}

// ===================================================================== JSON — pełna kopia
const blobToDataURL=b=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(r.error);r.readAsDataURL(b)});
function dataURLToBlob(u){const m=/^data:([^;,]+)?(;base64)?,(.*)$/.exec(u||'');if(!m)return null;const bin=m[2]?atob(m[3]):decodeURIComponent(m[3]);const a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return new Blob([a],{type:m[1]||'image/jpeg'})}
async function buildJSON(){
 const d=collectLocal(),journal=await journalAll();
 const j=[];for(const e of journal){const photos=[];for(const p of e.photos||[]){try{photos.push({id:p.id,w:p.w,h:p.h,added:p.added,taken:p.taken,data:await blobToDataURL(p.blob)})}catch(_){}}j.push({key:e.key,title:e.title,icon:e.icon,notes:e.notes||'',updated:e.updated,photos})}
 const out={app:'I Was Here — Places & Memories',format:FORMAT,formatVersion:FORMAT_VERSION,appVersion:APP_VERSION,exported:new Date().toISOString(),
  data:{iwh_trips:d.trips,iwh_days:d.days,iwh_visited:d.visited,iwh_region_visited:d.placeStamps,iwh_region_favs:d.favs,warsawVisited:d.warsaw,tb_saved_trips:d.legacyTrips,journal:j}};
 return new Blob([JSON.stringify(out,null,1)],{type:'application/json'});
}
function parseJSON(text){
 const j=JSON.parse(text);if(!j||j.format!==FORMAT||!j.data)throw new Error('not-iwh');const d=j.data,arr=v=>Array.isArray(v)?v:[];
 const plan=p=>({id:p.id,name:String(p.name||''),created:p.created,keys:arr(p.items).filter(i=>i&&i.t).map(itemKey),raw:arr(p.items).filter(i=>i&&i.t),date:p.date,start:p.start,mode:p.mode});
 return{trips:arr(d.iwh_trips).map(plan),days:arr(d.iwh_days).map(plan),visited:arr(d.iwh_visited).filter(x=>typeof x==='string'),placeStamps:arr(d.iwh_region_visited).filter(x=>typeof x==='string'),
  warsaw:arr(d.warsawVisited),favs:arr(d.iwh_region_favs),legacyTrips:arr(d.tb_saved_trips),journal:arr(d.journal).filter(e=>e&&e.key),skipped:[],full:true};
}

// ===================================================================== import (scalanie)
function summarize(p){return{trips:p.trips.length,days:p.days.length,stamps:p.visited.length+p.placeStamps.length,warsaw:p.warsaw.length,journal:p.journal.length,photos:p.journal.reduce((a,e)=>a+((e.photos&&e.photos.length)||0),0),skipped:p.skipped}}
async function apply(p,mode){
 const L=collectLocal(),catPl=await catalogue('pl'),byKey=new Map(catPl.map(c=>[c.key,c]));
 const toItem=k=>{const it=keyToItem(k);if(it.t==='waw'){const c=byKey.get(k);if(!c)return null;return{t:'waw',id:it.id,name:c.name,lat:c.lat,lon:c.lon}}return it};
 const stats={newPlans:0,updPlans:0,stamps:0,journal:0,photos:0};
 // Nowe plany trafiają na początek listy (jak w aplikacji) — w kolejności z pliku.
 const mergePlans=(local,incoming,isDay)=>{
  incoming.slice().reverse().forEach(inc=>{
   const items=(inc.raw&&inc.raw.length===inc.keys.length?inc.raw:inc.keys.map(toItem)).filter(Boolean);
   let cur=(inc.id&&local.find(x=>x.id===inc.id))||local.find(x=>norm(x.name)===norm(inc.name));
   if(!cur){const np={id:inc.id&&!local.some(x=>x.id===inc.id)?inc.id:uid(),name:inc.name.slice(0,60),created:inc.created||new Date().toISOString(),items};
    if(isDay){np.date=inc.date||isoDay(new Date());np.start=inc.start||'09:00';if(inc.mode)np.mode=inc.mode}local.unshift(np);stats.newPlans++;return}
   if(mode==='update'){const changed=JSON.stringify(cur.items.map(itemKey))!==JSON.stringify(items.map(itemKey));cur.items=items;if(isDay){if(inc.date)cur.date=inc.date;if(inc.start)cur.start=inc.start;if(inc.mode)cur.mode=inc.mode}if(changed)stats.updPlans++;return}
   const have=new Set(cur.items.map(itemKey));let add=0;items.forEach(it=>{if(!have.has(itemKey(it))){cur.items.push(it);have.add(itemKey(it));add++}});
   if(isDay){if(!cur.date&&inc.date)cur.date=inc.date;if(!cur.mode&&inc.mode)cur.mode=inc.mode}
   if(add)stats.updPlans++;
  });
 };
 mergePlans(L.trips,p.trips,false);mergePlans(L.days,p.days,true);
 const union=(a,b)=>{const s=new Set(a);let n=0;b.forEach(x=>{if(!s.has(x)){s.add(x);n++}});stats.stamps+=n;return[...s]};
 const visited=union(L.visited,p.visited),placeStamps=union(L.placeStamps,p.placeStamps);
 const w=read('odkryjWarszawe_1',{}),wv=Array.isArray(w.visited)?w.visited:[];const ws=new Set(wv);let wn=0;(p.warsaw||[]).forEach(id=>{if(!ws.has(id)){ws.add(id);wn++}});stats.stamps+=wn;
 const ok=write('iwh_trips',L.trips)&&write('iwh_days',L.days)&&write('iwh_visited',visited)&&write('iwh_region_visited',placeStamps);
 if(!ok)throw new Error('storage');
 if(wn){w.visited=[...ws];write('odkryjWarszawe_1',w)}
 if(p.favs&&p.favs.length){const f=new Set(L.favs);p.favs.forEach(x=>f.add(x));write('iwh_region_favs',[...f])}
 if(p.legacyTrips&&p.legacyTrips.length&&!L.legacyTrips.length)write('tb_saved_trips',p.legacyTrips);
 // Dziennik: nowe wpisy dodajemy, istniejące uzupełniamy (notatki dopisane, zdjęcia do limitu 5).
 const J=journalApi();
 if(J&&J.save&&p.journal.length){
  for(const e of p.journal){
   const cur=await J.get(e.key)||{key:e.key,title:e.title||'',icon:e.icon||'📍',notes:'',photos:[],updated:''};
   let changed=false;const n=String(e.notes||'').trim();
   if(n&&!String(cur.notes||'').includes(n)){cur.notes=(cur.notes||'').trim()?cur.notes.trim()+'\n\n'+n:n;changed=true}
   for(const ph of e.photos||[]){if(cur.photos.length>=(J.MAX_PHOTOS||5))break;if(cur.photos.some(x=>x.id===ph.id))continue;const b=dataURLToBlob(ph.data);if(!b)continue;cur.photos.push({id:ph.id||uid(),blob:b,w:ph.w,h:ph.h,added:ph.added||new Date().toISOString(),taken:ph.taken||null});stats.photos++;changed=true}
   if(changed){if(!cur.title)cur.title=e.title||'';cur.updated=new Date().toISOString();await J.save(cur);stats.journal++}
  }
  document.dispatchEvent(new CustomEvent('iwh-journal-change',{detail:{import:true}}));
 }
 document.dispatchEvent(new CustomEvent('iwh-stamps-change',{detail:{import:true}}));
 document.dispatchEvent(new CustomEvent('iwh-data-imported',{detail:stats}));
 return stats;
}
async function parseFile(file){
 const buf=await file.arrayBuffer(),u=new Uint8Array(buf);
 if(u[0]===0x50&&u[1]===0x4B)return parseXLSX(buf);
 return parseJSON(new TextDecoder().decode(u));
}

// ===================================================================== pobieranie, udostępnianie, e-mail
const fileName=ext=>'I-Was-Here_'+isoDay(new Date())+'.'+ext;
function download(blob,name){const a=document.createElement('a'),u=URL.createObjectURL(blob);a.href=u;a.download=name;a.rel='noopener';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)}
async function sendByMail(blob,name){
 const t=tx(),email=(read('iwh_profile',{}).email||'').trim();
 const file=new File([blob],name,{type:blob.type});
 if(navigator.canShare&&navigator.canShare({files:[file]})){
  try{await navigator.share({files:[file],title:t.mailSubject,text:t.mailBody+(email?'\n'+email:'')});return 'shared'}catch(e){if(e&&e.name==='AbortError')return 'aborted'}
 }
 download(blob,name);
 setTimeout(()=>{location.href='mailto:'+encodeURIComponent(email)+'?subject='+encodeURIComponent(t.mailSubject)+'&body='+encodeURIComponent(t.mailBody+'\n\n('+name+')')},600);
 return 'mailto';
}

// ===================================================================== interfejs (Profil Atlasu)
function mount(host){
 const t=tx(),prof=read('iwh_profile',{});
 host.innerHTML='<section class="ud-box" aria-labelledby="udTitle"><h3 id="udTitle">'+esc(t.sec)+'</h3><p class="muted small">'+esc(t.intro)+'</p>'+
  '<div class="ud-actions">'+
  '<button type="button" class="ud-btn" data-ud="xlsx"><b>'+esc(t.xlsx)+'</b><small>'+esc(t.xlsxSub)+'</small></button>'+
  '<button type="button" class="ud-btn" data-ud="mail"><b>'+esc(t.mail)+'</b><small>'+esc(t.mailSub)+'</small></button>'+
  '<button type="button" class="ud-btn" data-ud="json"><b>'+esc(t.json)+'</b><small>'+esc(t.jsonSub)+'</small></button>'+
  '<label class="ud-btn ud-file"><input type="file" accept=".xlsx,.json,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" data-ud="import"><b>'+esc(t.imp)+'</b><small>'+esc(t.impSub)+'</small></label>'+
  '</div><label class="ud-email"><span>'+esc(t.email)+'</span><input type="email" inputmode="email" autocomplete="email" placeholder="'+esc(t.emailPh)+'" value="'+esc(prof.email||'')+'" data-ud="email"></label>'+
  '<p class="ud-status" role="status" aria-live="polite"></p><div class="ud-preview" hidden></div></section>';
 const status=s=>{host.querySelector('.ud-status').textContent=s};
 host.querySelector('[data-ud="email"]').addEventListener('change',e=>{const p=read('iwh_profile',{});p.email=e.target.value.trim();write('iwh_profile',p)});
 host.addEventListener('click',async e=>{
  const b=e.target.closest('button[data-ud]');if(!b)return;const what=b.dataset.ud;
  if(what==='apply'||what==='update'||what==='cancel')return;
  b.disabled=true;status(t.busy);
  try{
   if(what==='xlsx'){const name=fileName('xlsx');download(await buildXLSX(),name);status(t.done+name)}
   else if(what==='json'){const name=fileName('json');download(await buildJSON(),name);status(t.done+name)}
   else if(what==='mail'){const name=fileName('xlsx'),r=await sendByMail(await buildXLSX(),name);status(r==='shared'?t.shared:r==='mailto'?t.mailFallback:'')}
  }catch(err){console.error(err);status(t.err)}finally{b.disabled=false}
 });
 host.querySelector('[data-ud="import"]').addEventListener('change',async e=>{
  const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;status(t.busy);
  let parsed;try{parsed=await parseFile(f)}catch(err){console.error(err);status(t.readErr);return}
  showPreview(host,parsed,f.name);status('');
 });
}
function showPreview(host,parsed,fname){
 const t=tx(),s=summarize(parsed),box=host.querySelector('.ud-preview');
 const row=(k,v)=>v?'<li><span>'+esc(k)+'</span><b>'+v+'</b></li>':'';
 box.hidden=false;
 box.innerHTML='<h4>'+esc(t.preview)+' — '+esc(fname)+'</h4><ul>'+row(t.pTrips,s.trips)+row(t.pDays,s.days)+row(t.pStamps,s.stamps)+row(t.pWaw,s.warsaw)+row(t.pJournal,s.journal)+row(t.pPhotos,s.photos)+'</ul>'+
  (s.skipped.length?'<details><summary>'+esc(t.pSkipped)+': '+s.skipped.length+'</summary><ul class="ud-skip">'+s.skipped.slice(0,30).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></details>':'')+
  '<p class="muted small">'+esc(t.mergeHint)+'</p><div class="ud-row"><button type="button" class="city-action" data-ud="apply">'+esc(t.merge)+'</button><button type="button" class="ghost-action" data-ud="update">'+esc(t.update)+'</button><button type="button" class="link-danger" data-ud="cancel">'+esc(t.cancel)+'</button></div>';
 box.onclick=async e=>{const b=e.target.closest('button[data-ud]');if(!b)return;
  if(b.dataset.ud==='cancel'){box.hidden=true;box.innerHTML='';return}
  box.querySelectorAll('button').forEach(x=>x.disabled=true);
  try{const st=await apply(parsed,b.dataset.ud==='update'?'update':'merge');box.hidden=true;box.innerHTML='';
   const msg=st.newPlans+st.updPlans+st.stamps+st.journal+st.photos?t.imported:t.nothing;host.querySelector('.ud-status').textContent=msg}
  catch(err){console.error(err);host.querySelector('.ud-status').textContent=t.err;box.querySelectorAll('button').forEach(x=>x.disabled=false)}};
}

window.IWH_DATA={buildXLSX,buildJSON,readXLSX,parseXLSX,parseJSON,parseFile,apply,summarize,catalogue,mount,sendByMail,_zip:zip,_unzip:unzip};
})();

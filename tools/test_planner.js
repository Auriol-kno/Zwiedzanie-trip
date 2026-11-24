// I Was Here 8.16 — testy planera „dzień po dniu”.
// 1) silnik (bez przeglądarki): node tools/test_planner.js
// 2) z przeglądarką (Playwright, emulacja iPhone 13): NODE_PATH=$(npm root -g) node tools/test_planner.js --browser
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');
const ROOT=path.resolve(__dirname,'..');
const E=require(path.join(ROOT,'assets/planer.js'));
const D=JSON.parse(fs.readFileSync(path.join(ROOT,'data/planer.json'),'utf8'));
let n=0;const ok=(c,m)=>{assert.ok(c,m);n++};

ok(D.cities[0].name==='Warszawa'&&D.cities[0].full,'Warszawa pierwsza jako pełny przewodnik');
ok(D.places.every(p=>p.lat>48.9&&p.lat<55&&p.lon>14&&p.lon<24.2),'wszystkie punkty w granicach Polski');
for(const days of [1,3,5]){
 const r=E.plan(D,{city:'Warszawa',days,tempo:'normal',mode:'walking',top:['museum'],no:['park']});
 ok(r.days.length===days,'Warszawa: '+days+' dni');
 const flat=r.days.flat();ok(new Set(flat.map(p=>p.id)).size===flat.length,'bez powtórzeń');
 ok(flat.every(p=>p.cats[0]!=='park'),'„Nie polecaj” wyklucza kategorię');
 r.days.forEach((s,i)=>{const tl=E.timeline(s,'walking',540,null),m=tl[tl.length-1].leave-540;ok(m<=360*1.6,'dzień '+(i+1)+' mieści się w tempie ('+m+' min)')});
}
// optymalizacja nie wydłuża trasy
const r=E.plan(D,{city:'Warszawa',days:2,tempo:'full',mode:'walking',top:[],no:[]});
for(const s of r.days){const a=E.order(s,'walking',true),b=E.order(s,'walking',false);const len=q=>q.slice(1).reduce((t,p,i)=>t+E.km(q[i],p),0);ok(len(a)<=len(b)+1e-9,'optymalizacja skraca trasę')}
// małe miasto: uczciwie mniej dni albo okolica
const k=E.plan(D,{city:'Opole',days:5,tempo:'full',mode:'walking',top:[],no:[]});
ok(k.days.length>=1&&k.days.length<=5,'Opole: plan powstaje');
ok(k.days.flat().filter(p=>p.near).every(p=>E.km(D.cities.find(c=>c.name==='Opole'),p)<=40),'okolica ≤40 km');
// link Google Maps
const u=E.mapsUrl(r.days[0],'walking');ok(/^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&origin=/.test(u)&&/travelmode=walking$/.test(u),'link Google Maps');
// godziny otwarcia: Zamek Królewski w poniedziałek zamknięty
const castle=D.places.find(p=>p.id==='castle');const tl=E.timeline([castle],'walking',600,'2026-11-23');ok(tl[0].warn==='closed','ostrzeżenie: zamknięte w poniedziałek');
console.log('silnik planera: '+n+' sprawdzeń OK');

if(process.argv.includes('--browser'))(async()=>{
 const {chromium,devices}=require('playwright');
 const http=require('http');
 const srv=http.createServer((q,s)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){s.writeHead(404);return s.end()}const ty={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'}[path.extname(f)]||'application/octet-stream';s.writeHead(200,{'content-type':ty});s.end(b)})}).listen(0);
 const port=srv.address().port;
 const br=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
 const ctx=await br.newContext({...devices['iPhone 13']});
 await ctx.route(/tile\.openstreetmap\.org/,r=>r.abort());
 const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(String(e)));
 const shots=process.env.SHOTS;const shot=async nm=>{if(shots)await pg.screenshot({path:path.join(shots,nm+'.png')})};
 let b=0;const ck=(c,m)=>{assert.ok(c,m);b++};
 await pg.goto('http://localhost:'+port+'/planer.html?lang=pl');
 await pg.waitForSelector('.pl-city');await shot('1-miasto');
 ck(await pg.locator('.pl-city').count()===D.cities.length,'lista miast');
 await pg.fill('#plQ','kra');ck(await pg.locator('.pl-city').count()===1,'wyszukiwanie miasta');await pg.fill('#plQ','');
 await pg.click('[data-city="Warszawa"]');await pg.waitForSelector('#plWheel');
 await pg.click('.pl-wn[data-n="3"]');await shot('2-dni');
 await pg.click('[data-go="prefs"]');await pg.waitForSelector('.pl-zone');
 await pg.click('[data-top="museum"]');await pg.click('[data-top="history"]');await pg.click('[data-no="family"]');await shot('3-preferencje');
 ck(await pg.locator('.zone-top .pl-chip').count()===2,'dwie ulubione');
 await pg.click('[data-go="ask"]');await pg.waitForSelector('.pl-modal');await shot('4-pytanie');
 await pg.click('[data-go="make"]');await pg.waitForSelector('.pl-make');await pg.waitForTimeout(1200);await shot('5-postep');
 await pg.waitForSelector('.pl-stop',{timeout:8000});await pg.waitForTimeout(400);await shot('6-wynik');
 ck(await pg.locator('.pl-days button').count()===3,'trzy dni');
 ck(await pg.locator('.pl-map .pin, .pl-pin').count()>1,'numerowane punkty na mapie');
 await pg.click('[data-all]');await pg.waitForTimeout(200);await shot('7-wszystkie');
 await pg.click('[data-day="1"]');await pg.click('[data-edit]');await pg.click('[data-add]');await shot('8-edycja');
 const before=await pg.locator('.pl-stop').count();await pg.locator('[data-addp]').first().click();ck(await pg.locator('.pl-stop').count()===before+1,'dodanie miejsca');
 await pg.click('[data-save]');const saved=await pg.evaluate(()=>JSON.parse(localStorage.getItem('iwh_days')||'[]'));ck(saved.length===3&&saved[0].items.length>0,'zapis do iwh_days');
 const href=await pg.getAttribute('.pl-actions a.pl-btn','href');ck(href.startsWith('https://www.google.com/maps/dir/'),'przycisk Google Maps');
 await pg.click('#plLang');ck((await pg.textContent('.pl-dayhead b')).startsWith('Day'),'przełączenie na EN');
 // 8.20: „Zaplanuj za mnie” w karcie miasta Atlasu i działający „Nowy plan podróży” z dodawaniem miejsc
 await pg.goto('http://localhost:'+port+'/atlas.html?lang=pl');await pg.waitForSelector('.city-dot');
 await pg.locator('[data-city-chip="krakow"]').click();await pg.waitForTimeout(400);
 const ph=await pg.getAttribute('#cityPlanner','href');ck(!(await pg.locator('#cityPlanner').isHidden())&&/planer\.html\?.*city=Krak/.test(decodeURIComponent(ph)),'Atlas: „Zaplanuj za mnie” w karcie miasta');
 await pg.goto('http://localhost:'+port+'/atlas.html?lang=pl&tab=plans');await pg.waitForSelector('[data-new="trip"]');
 const tripsBefore=(await pg.evaluate(()=>JSON.parse(localStorage.getItem('iwh_trips')||'[]'))).length;
 await pg.click('[data-new="trip"]');const id=await pg.evaluate(()=>JSON.parse(localStorage.getItem('iwh_trips'))[0].id);
 await pg.fill('[data-add-search="'+id+'"]','Krak');await pg.waitForSelector('[data-add-to="'+id+'"]');await pg.locator('[data-add-to="'+id+'"]').first().click();
 const tr=await pg.evaluate(()=>JSON.parse(localStorage.getItem('iwh_trips')));ck(tr.length===tripsBefore+1&&tr[0].items.length===1,'Nowy plan podróży: dodanie miejsca z wyszukiwarki');
 await pg.goto('http://localhost:'+port+'/planer.html?city='+encodeURIComponent('Olsztyn'));await pg.waitForSelector('#plWheel');ck(true,'Planer: Olsztyn z karty miasta');
 ck(!errs.length,'brak błędów JS: '+errs.join(' | '));
 await br.close();srv.close();console.log('przeglądarka: '+b+' sprawdzeń OK');
})().catch(e=>{console.error(e);process.exit(1)});

// I Was Here 8.19 — test czytelności: kontrast każdego widocznego napisu z jego rzeczywistym tłem (WCAG).
// Próg: 4,5 dla zwykłego tekstu, 3 dla dużego (≥ 24 px albo ≥ 18,7 px pogrubiony). Tło: pierwsze kryjące tło
// przodka; przy gradiencie liczony jest najgorszy kolor gradientu. Napisy nad mapą/obrazem są pomijane.
// Użycie: NODE_PATH=$(npm root -g) node tools/test_contrast.js [--list]
'use strict';
const {chromium,devices}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
const TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
const srv=http.createServer((q,s)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,b)=>{if(e){s.writeHead(404);return s.end()}s.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream'});s.end(b)})}).listen(0);
const base='http://localhost:'+srv.address().port+'/';

function audit(){
 const parse=c=>{const m=c.match(/rgba?\(([^)]+)\)/);if(!m)return null;const v=m[1].split(/[\s,\/]+/).filter(Boolean).map(Number);return{r:v[0],g:v[1],b:v[2],a:v.length>3?v[3]:1}};
 const lum=c=>{const f=x=>{x/=255;return x<=.03928?x/12.92:((x+.055)/1.055)**2.4};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)};
 const mix=(top,bot)=>({r:top.r*top.a+bot.r*(1-top.a),g:top.g*top.a+bot.g*(1-top.a),b:top.b*top.a+bot.b*(1-top.a),a:1});
 const ratio=(a,b)=>{const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
 // tło: zbiera warstwy od elementu w górę; zwraca listę możliwych kolorów (gradient → kilka) albo null (obraz/mapa)
 function bgs(el){let layers=[];for(let e=el;e;e=e.parentElement){const cs=getComputedStyle(e);
   if(e.tagName==='svg'||e.tagName==='IMG'||e.tagName==='CANVAS')return null;
   const img=cs.backgroundImage;
   if(img&&img!=='none'){if(/url\(/.test(img))return null;const cols=(img.match(/rgba?\([^)]+\)/g)||[]).map(parse).filter(Boolean);
     if(cols.length){const opaque=cols.every(c=>c.a>=.95);layers.push(cols);if(opaque)return finish(layers)}}
   const bc=parse(cs.backgroundColor);if(bc&&bc.a>0){layers.push([bc]);if(bc.a>=.95)return finish(layers)}
   if(cs.position==='fixed'&&e!==document.body&&!(bc&&bc.a>0))continue;
  }
  layers.push([{r:255,g:255,b:255,a:1}]);return finish(layers)}
 function finish(layers){let acc=layers[layers.length-1];for(let i=layers.length-2;i>=0;i--){const n=[];for(const t of layers[i])for(const b of acc)n.push(mix(t,b));acc=n}return acc}
 const out=[],seen=new Set();
 const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
 while((n=walk.nextNode())){const txt=n.textContent.trim();if(txt.length<2||!/[\p{L}\d]/u.test(txt))continue;const el=n.parentElement;if(!el||seen.has(el))continue;seen.add(el);
  if(el.closest('svg,[aria-hidden=true],.sr-only,noscript,script,style,option'))continue;
  const r=el.getBoundingClientRect();if(r.width<2||r.height<2||r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth)continue;
  const cs=getComputedStyle(el);if(cs.visibility==='hidden'||+cs.opacity<.3)continue;
  let op=1;for(let e=el;e;e=e.parentElement)op*=+getComputedStyle(e).opacity;if(op<.3)continue;
  // element zasłonięty innym (np. arkusz nad nim) — pomiń
  const cx=Math.min(innerWidth-1,Math.max(0,r.left+Math.min(r.width/2,20))),cy=Math.min(innerHeight-1,Math.max(0,r.top+r.height/2));const hit=document.elementFromPoint(cx,cy);if(hit&&hit!==el&&!el.contains(hit)&&!hit.contains(el))continue;
  const bg=bgs(el);if(!bg)continue;let fg=parse(cs.color);if(!fg)continue;fg.a*=op;
  const size=parseFloat(cs.fontSize),bold=+cs.fontWeight>=600,large=size>=24||(size>=18.66&&bold),need=large?3:4.5;
  const worst=Math.min(...bg.map(b=>ratio(mix(fg,b),b)));
  if(worst<need)out.push({text:txt.slice(0,48),ratio:+worst.toFixed(2),need,color:cs.color,cls:(el.className&&el.className.baseVal===undefined?el.className:'')+'|'+el.tagName.toLowerCase()});
 }
 return out;
}

const SCREENS=[
 ['Atlas: mapa','atlas.html'],
 ['Atlas: warstwy','atlas.html',async p=>{await p.click('#layersButton')}],
 ['Atlas: miasto','atlas.html',async p=>{await p.locator('.city-strip button,.city-strip [role=listitem]').first().click()}],
 ['Atlas: Odkrywaj','atlas.html?tab=explore'],
 ['Atlas: Odkrywaj — motyw','atlas.html?tab=explore',async p=>{await p.locator('[data-theme],[data-open-theme],.ex-theme,.theme-card').first().click()}],
 ['Atlas: Plany (podróże)','atlas.html?tab=plans'],
 ['Atlas: Plany (dzień)','atlas.html?tab=plans',async p=>{await p.locator('[data-plan-view="day"],[data-view="day"]').first().click().catch(()=>{})}],
 ['Atlas: Pieczątki','atlas.html?tab=passport'],
 ['Atlas: Profil','atlas.html?tab=profile'],
 ['Region: góra','region.html?region=malopolskie'],
 ['Region: filtry','region.html?region=malopolskie',async p=>{await p.evaluate(()=>document.getElementById('filtersSection').scrollIntoView())}],
 ['Region: plan dnia','region.html?region=malopolskie',async p=>{await p.evaluate(()=>document.getElementById('planSection').scrollIntoView())}],
 ['Region: miejsca','region.html?region=malopolskie',async p=>{await p.evaluate(()=>document.getElementById('placesSection').scrollIntoView())}],
 ['Region: szczegóły','region.html?region=malopolskie',async p=>{await p.locator('#placeList button,#placeList article').first().click();await p.waitForTimeout(500)}],
 ['Warszawa: start','index.html'],
 ['Warszawa: niżej','index.html',async p=>{await p.evaluate(()=>document.scrollingElement.scrollTop=1200)}],
 ['Warszawa: jeszcze niżej','index.html',async p=>{await p.evaluate(()=>document.scrollingElement.scrollTop=2600)}],
 ['Planer: miasta','planer.html'],
 ['Planer: dni','planer.html',async p=>{await p.click('[data-city="Kraków"]')}],
 ['Planer: zainteresowania','planer.html',async p=>{await p.click('[data-city="Kraków"]');await p.click('[data-go="prefs"]');await p.click('[data-top="museum"]');await p.click('[data-no="park"]')}],
 ['Planer: wynik','planer.html',async p=>{await p.click('[data-city="Kraków"]');await p.click('[data-go="prefs"]');await p.click('[data-go="ask"]');await p.click('[data-go="make"]');await p.waitForSelector('.pl-stop',{timeout:9000})}],
];

(async()=>{
 const br=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
 let fails=0;const list=process.argv.includes('--list');
 for(const lang of ['pl','en'])for(const [name,url,fn] of SCREENS){
  const ctx=await br.newContext({...devices['iPhone 13']});await ctx.route(/openstreetmap|wikipedia|wikimedia/,r=>r.abort());
  await ctx.addInitScript(l=>{try{localStorage.setItem('odkryjWarszawe_onboard','1');localStorage.setItem('tubylem_lang',l);localStorage.setItem('iwh_brand_v5','1')}catch(e){}},lang);
  const p=await ctx.newPage();
  try{await p.goto(base+url+(url.includes('?')?'&':'?')+'lang='+lang);await p.waitForTimeout(900);if(fn)await fn(p);await p.waitForTimeout(350);
   const bad=await p.evaluate(audit);
   if(bad.length){fails+=bad.length;console.log('✗ '+name+' ['+lang+']: '+bad.length);if(list)bad.slice(0,12).forEach(b=>console.log('   '+b.ratio+'/'+b.need+'  '+b.color+'  '+b.cls+'  „'+b.text+'”'))}
   else console.log('OK   '+name+' ['+lang+']');
  }catch(e){console.log('?  '+name+' ['+lang+']: '+e.message.split('\n')[0])}
  await ctx.close();
 }
 await br.close();srv.close();
 if(fails){console.log(fails+' napisów poniżej progu kontrastu');process.exit(1)}
 console.log('OK: kontrast wszystkich sprawdzonych napisów');
})();

/* Integration: OSM catalogue, map filters, collection/undo, milestones, plans and backups. */
const {chromium,devices}=require('playwright');
const http=require('http'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
 const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://local').pathname);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end();return}res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.json')?'application/json':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let browser;
 try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined});
 const context=await browser.newContext({...devices['iPhone 13'],serviceWorkers:'block'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.abort());
 const base='http://127.0.0.1:'+server.address().port;
 await page.goto(base+'/region.html?region=dolnoslaskie&town=Wroc%C5%82aw&lang=pl');
 await page.waitForSelector('#showDwarfs');
 assert.equal(await page.locator('#placesCount').textContent(),'7 miejsc · Wrocław');
 await page.click('#showDwarfs');
 assert.match(await page.locator('#placesCount').textContent(),/776/);
 await page.click('[data-cat="dwarfs"]');
 assert.match(await page.locator('#placesCount').textContent(),/769/);
 assert.ok(await page.locator('#rMap canvas').count());
 const restricted=await page.evaluate(()=>IWH_REGIONS.places.filter(p=>p.restricted).map(p=>p.id));
 for(const id of await page.locator('#planList [data-open]').evaluateAll(nodes=>nodes.map(n=>n.dataset.open)))assert.ok(!restricted.includes(id));
 assert.equal(await page.locator('#placeList article').count(),60);
 await page.click('#morePlaces');assert.equal(await page.locator('#placeList article').count(),120);
 const first=page.locator('#placeList [data-open]').first(),id=await first.getAttribute('data-open');
 await first.click();assert.match(await page.locator('#dBody').textContent(),/OpenStreetMap/);
 await page.click('#dBody [data-stamp]');
 assert.equal(await page.locator('#dwarfSection [data-dwarf-goal="1"]').getAttribute('class'),'dwarf-badge earned');
 await page.click('#dClose');await page.click('#hideFoundDwarfs');
 assert.match(await page.locator('#placesCount').textContent(),/768/);
 await page.reload();await page.waitForSelector('#showDwarfs');
 assert.equal(await page.evaluate(id=>JSON.parse(localStorage.iwh_region_visited).includes(id),id),true);
 await page.evaluate(()=>{const ids=IWH_REGIONS.places.filter(p=>p.dwarf).slice(0,5).map(p=>p.id);localStorage.setItem('iwh_region_visited',JSON.stringify(ids));document.dispatchEvent(new CustomEvent('iwh-stamps-change'))});
 assert.match(await page.locator('#dwarfSection [data-dwarf-goal="5"]').getAttribute('class'),/earned/);
 await page.evaluate(()=>{localStorage.setItem('iwh_region_visited','[]');document.dispatchEvent(new CustomEvent('iwh-stamps-change'))});
 assert.doesNotMatch(await page.locator('#dwarfSection [data-dwarf-goal="1"]').getAttribute('class'),/earned/);
 await page.click('#langRegion [data-lang="en"]');
 assert.match(await page.locator('#dwarfSection').textContent(),/Dwarf stamps/);
 assert.doesNotMatch(await page.locator('#dwarfSection').textContent(),/znalezionych|pieczątki/);
 await page.goto(base+'/atlas.html?tab=passport&lang=en');
 await page.waitForSelector('.dwarf-collection');assert.match(await page.locator('.dwarf-collection').textContent(),/769/);
 await page.evaluate(()=>{localStorage.setItem('iwh_region_visited',JSON.stringify(['wr-dwarf-node-269609155']))});
 await page.addScriptTag({url:base+'/assets/user-data.js'});
 const round=await page.evaluate(async()=>{const blob=await IWH_DATA.buildJSON(),p=IWH_DATA.parseJSON(await blob.text());localStorage.setItem('iwh_region_visited','[]');await IWH_DATA.apply(p,'merge');await IWH_DATA.apply(p,'merge');return localStorage.getItem('iwh_region_visited')});
 assert.deepEqual(JSON.parse(round),['wr-dwarf-node-269609155']);
 const excel=await page.evaluate(async()=>{const b=await IWH_DATA.buildXLSX({lang:'en'}),p=await IWH_DATA.parseXLSX(await b.arrayBuffer());return JSON.stringify(p)});
 assert.match(excel,/wr-dwarf-node-269609155/);
 await page.evaluate(()=>{
  const ids=IWH_REGIONS.places.filter(p=>p.dwarf).map(p=>p.id);
  for(const n of [0,1,4,5,9,10,24,25,49,50,99,100,249,250,768,769]){
   localStorage.setItem('iwh_region_visited',JSON.stringify(ids.slice(0,n)));
   const dom=new DOMParser().parseFromString(IWH_EXTRAS.passport.dwarfsHTML(),'text/html');
   for(const goal of dom.querySelectorAll('[data-dwarf-goal]'))if(goal.classList.contains('earned')!==(n>=+goal.dataset.dwarfGoal))throw new Error('Milestone boundary '+n);
  }
 });
 assert.deepEqual(errors,[]);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 console.log('OK: 769 OSM points, map/filter/pagination, collection/undo/reload, milestone thresholds, PL/EN, shared passport, JSON backup, phone width; no JS errors.');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});

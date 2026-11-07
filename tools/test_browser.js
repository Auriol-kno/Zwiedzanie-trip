#!/usr/bin/env node
/* Test w prawdziwej przeglądarce (Chromium, emulacja iPhone 13): Atlas ⇄ Warszawa, PL/EN,
 * klawiatura, zoom i pinch, przyklejony nagłówek, brak błędów JS. Bez internetu i kluczy API.
 * Uruchom: node tools/test_browser.js  (wymaga pakietu playwright z przeglądarką Chromium). */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium, devices } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };

function serve() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html';
      const file = path.join(ROOT, rel);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

let failures = 0;
function check(ok, message) {
  console.log((ok ? 'OK   ' : 'FAIL ') + message);
  if (!ok) failures++;
}

(async () => {
  const server = await serve();
  const base = 'http://127.0.0.1:' + server.address().port + '/';
  const browser = await chromium.launch();
  const context = await browser.newContext({ ...devices['iPhone 13'] });
  // Zewnętrzne zasoby (Leaflet z CDN, kafelki OSM) blokujemy: test ma działać offline i deterministycznie.
  await context.route(url => !url.href.startsWith(base), route => route.abort());
  await context.addInitScript(() => { try { localStorage.setItem('odkryjWarszawe_onboard', '1'); } catch (e) {} });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  // --- Atlas
  await page.goto(base + 'atlas.html');
  await page.waitForSelector('.city-dot');
  check(await page.evaluate(() => document.documentElement.lang) === 'en', 'Atlas: pierwsze uruchomienie po angielsku');
  check(await page.locator('.city-dot').count() === 14, 'Atlas: 14 miast (z Kielcami)');
  await page.click('#langButton [data-lang="pl"]');
  check(await page.evaluate(() => document.documentElement.lang === 'pl' && document.querySelector('#cityAction').textContent === 'Odkryj Warszawę'), 'Atlas: przełącznik PL');
  await page.click('#langButton [data-lang="en"]');

  await page.focus('[data-city="krakow"]');
  await page.keyboard.press('Enter');
  check(await page.evaluate(() => document.activeElement?.dataset?.city === 'krakow'), 'Atlas: fokus klawiatury zostaje na wybranym mieście');
  check(await page.evaluate(() => !document.querySelector('#cityAction').disabled && /Krak/.test(document.querySelector('#cityAction').textContent)), 'Atlas: Kraków otwiera atrakcje miasta w przewodniku Małopolski');

  const scaleNow = () => page.evaluate(() => Number(/scale\(([\d.]+)\)/.exec(document.querySelector('#world').getAttribute('transform'))[1]));
  await page.click('#resetView');
  await page.waitForTimeout(650);
  const homeZoom = await scaleNow();
  check(homeZoom > 0.9 && homeZoom < 1.7, 'Atlas: przycisk z zarysem Polski pokazuje cały kraj (skala ' + homeZoom.toFixed(2) + ')');
  await page.click('#zoomIn');
  check(Math.abs(await scaleNow() - homeZoom * 1.3) < 0.01, 'Atlas: przycisk + powiększa mapę ×1,3');
  await page.click('#resetView');
  await page.waitForTimeout(650);
  const pinched = (await page.evaluate(() => {
    const svg = document.querySelector('#polandSvg'), r = svg.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const ev = (type, id, x) => svg.dispatchEvent(new PointerEvent(type, { pointerId: id, clientX: x, clientY: cy, bubbles: true, pointerType: 'touch', isPrimary: id === 1 }));
    ev('pointerdown', 1, cx - 30); ev('pointerdown', 2, cx + 30);
    ev('pointermove', 2, cx + 90);
    ev('pointerup', 2, cx + 90); ev('pointerup', 1, cx - 30);
    return Number(/scale\(([\d.]+)\)/.exec(document.querySelector('#world').getAttribute('transform'))[1]);
  })) / homeZoom;
  check(pinched > 1.5, 'Atlas: gest pinch powiększa mapę (×' + pinched.toFixed(2) + ')');

  // --- Warszawa z Atlasu EN
  await page.click('#resetView');
  await page.click('#cityStrip [data-city-chip="warsaw"]');
  await page.click('#cityAction');
  await page.waitForSelector('#langWarsaw');
  await page.waitForTimeout(600);
  const w = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    hero: document.querySelector('.hero h1').textContent,
    toggles: document.querySelectorAll('#langWarsaw, #tbLanguage').length,
    legacyMap: !!document.querySelector('#polandHome'),
    home: document.querySelector('#atlasFloat')?.getAttribute('href'),
    // Szablon „offers a worthwhile stop” albo mechanicznie zmieniona nazwa bez redakcyjnego przekładu.
    generic: window.WARSAW_DB.attractions.filter(p => /offers a worthwhile stop/.test(p.desc) ||
      (/not available yet/.test(p.desc) && p.name !== p.__originalI18n.name && !/Sigismund|Kościuszko/.test(p.name))).length,
    honest: window.WARSAW_DB.attractions.filter(p => /not available yet/.test(p.desc)).length,
    overflow: document.documentElement.scrollWidth - innerWidth
  }));
  check(w.lang === 'en' && w.hero.startsWith('Your city'), 'Warszawa: wejście z Atlasu EN otwiera wersję angielską');
  check(w.toggles === 1, 'Warszawa: dokładnie jeden przełącznik języka');
  check(!w.legacyMap, 'Warszawa: brak zdublowanej mapy Polski');
  check(w.home === './atlas.html?lang=en', 'Warszawa: logo z mapą wraca do Atlasu w tym samym języku');
  check(w.generic === 0, 'Warszawa EN: brak szablonowych opisów i błędnie odmienionych nazw (' + w.honest + ' miejsc czeka na przekład)');
  check(w.overflow === 0, 'Warszawa: brak poziomego przewijania na iPhonie');

  await page.evaluate(() => { document.scrollingElement.scrollTop = 3000; });
  await page.waitForTimeout(200);
  check(await page.evaluate(() => {
    const c = document.querySelector('#atlasFloat .mark-atlas').getBoundingClientRect();
    return c.top >= 0 && c.top < 60 && c.left < 200 && !!document.elementFromPoint(c.left + c.width / 2, c.top + c.height / 2)?.closest('#atlasFloat');
  }), 'Warszawa: mapa Polski przy logo widoczna i klikalna po przewinięciu');

  // 8.3: wybór rodzajów atrakcji przed mapą; Wikipedia i dziennik w szczegółach atrakcji
  check(await page.evaluate(() => !!(document.querySelector('#interestSection').compareDocumentPosition(document.querySelector('#mapSection')) & Node.DOCUMENT_POSITION_FOLLOWING)
    && document.querySelectorAll('#categories .chip').length > 3), 'Warszawa: wybór rodzajów atrakcji jest przed mapą');
  check(await page.evaluate(() => document.querySelector('#transport [data-mode="walking"]') !== null), 'Warszawa: tryb pieszy w planerze');
  await page.evaluate(() => openDetail('castle'));
  check(await page.evaluate(() => { const a = document.querySelector('#detailContent .iwh-wiki[data-l="en"] a');
    return !!a && a.offsetParent !== null && /^https:\/\/(en|pl)\.wikipedia\.org\//.test(a.href) && !document.querySelector('#detailContent .iwh-wiki[data-l="pl"] a').offsetParent; }),
    'Warszawa EN: „More information — Wikipedia” przy opisie');
  check(await page.evaluate(() => !!document.querySelector('#detailContent [data-journal="waw:castle"]')), 'Warszawa: przycisk notatek i zdjęć w szczegółach');
  await page.evaluate(() => closeOverlay('detailOverlay'));
  await page.click('#langWarsaw [data-lang="pl"]');
  await page.waitForTimeout(400);
  check(await page.evaluate(() => document.documentElement.lang === 'pl' && localStorage.getItem('tubylem_lang') === 'pl'), 'Warszawa: PL zapamiętany');
  await page.click('#atlasFloat');
  await page.waitForSelector('.city-dot');
  check(await page.evaluate(() => document.documentElement.lang) === 'pl', 'Powrót do Atlasu zachowuje język PL');

  // --- Atlas 7.0: warstwy, granice zależne od powiększenia, karta miasta, plany z trwałym zapisem
  await page.goto(base + 'atlas.html?lang=pl');
  await page.waitForSelector('.city-dot');
  await page.waitForTimeout(700);
  const lineAt = () => page.evaluate(() => ({ w: parseFloat(getComputedStyle(document.querySelector('#polandSvg')).getPropertyValue('--prov-w')), names: parseFloat(getComputedStyle(document.querySelector('#polandSvg')).getPropertyValue('--names-o')) }));
  const far = await lineAt();
  await page.click('#zoomIn'); await page.click('#zoomIn'); await page.click('#zoomIn');
  const near = await lineAt();
  check(near.w > far.w + 0.5 && near.names > far.names && near.names > 0.5, 'Atlas: przy zbliżeniu granice grubsze (' + far.w + '→' + near.w + ' px), pojawiają się nazwy województw');
  check(await page.evaluate(() => document.querySelectorAll('#provinceLines .prov-line').length === 16 && document.querySelectorAll('#regions .region-name').length === 16), 'Atlas: 16 granic i 16 nazw województw');
  await page.click('#layersButton');
  await page.click('[data-layer="borders"]');
  check(await page.evaluate(() => getComputedStyle(document.querySelector('#provinceLines')).display === 'none' && JSON.parse(localStorage.getItem('iwh_layers')).borders === false), 'Warstwy: wyłączenie granic działa i jest zapamiętane');
  await page.click('[data-layer="borders"]');
  await page.click('#styleLight');
  check(await page.evaluate(() => document.body.dataset.style === 'light' && getComputedStyle(document.querySelector('.relief')).display === 'none' && localStorage.getItem('tubylem_map_style') === 'light'), 'Styl „Jasny”: dawny atlas ilustracyjny, zapamiętany');
  await page.click('#styleAtlas');
  check(await page.evaluate(() => document.body.dataset.style === 'atlas' && getComputedStyle(document.querySelector('.relief')).display !== 'none'), 'Styl „Atlas”: mapa z reliefem terenu');
  await page.keyboard.press('Escape');
  await page.click('#resetView'); await page.waitForTimeout(600);
  await page.click('#cityStrip [data-city-chip="gdansk"]');
  check(await page.evaluate(() => !document.querySelector('#placeSheet').hidden && document.querySelector('#cityName').textContent === 'Gdańsk' && document.querySelector('#cityDescription').textContent.length > 30), 'Karta miasta: nazwa, opis i status');
  await page.click('#addTrip');
  await page.waitForSelector('#planPicker[open]');
  await page.fill('#planPicker input[name="name"]', 'Bałtyk 2027');
  await page.click('#pickAdd');
  await page.click('#addDay');
  await page.waitForSelector('#planPicker[open]');
  await page.click('#pickAdd');
  await page.click('#toggleVisited');
  await page.reload();
  await page.waitForSelector('.city-dot');
  const saved = await page.evaluate(() => ({ trips: JSON.parse(localStorage.getItem('iwh_trips') || '[]'), days: JSON.parse(localStorage.getItem('iwh_days') || '[]'), visited: JSON.parse(localStorage.getItem('iwh_visited') || '[]'), pin: document.querySelector('[data-city="gdansk"]').getAttribute('class') }));
  check(saved.trips.length === 1 && saved.trips[0].name === 'Bałtyk 2027' && saved.trips[0].items[0].id === 'gdansk', 'Plan podróży: nowy plan zapisany i przetrwał odświeżenie');
  check(saved.days.length === 1 && saved.days[0].items.length === 1, 'Plan dnia: pozycja zapisana');
  check(saved.visited.includes('city:gdansk') && saved.pin.includes('st-visited'), 'Status „Byłem tu”: zapisany, pinezka odwiedzona');
  await page.click('.tabbar [data-tab="trips"]');
  check(await page.evaluate(() => !document.querySelector('#tabPanel').hidden && [...document.querySelectorAll('#tabPanel input')].some(i => i.value === 'Bałtyk 2027') && document.querySelector('#tabPanel').textContent.includes('Gdańsk')), 'Zakładka „Plan podróży” pokazuje zapisany plan');
  await page.click('.tabbar [data-tab="day"]');
  check(await page.evaluate(() => /\d\d:\d\d–\d\d:\d\d/.test(document.querySelector('#tabPanel').textContent)), 'Zakładka „Mój plan dnia”: szacunkowy harmonogram');
  await page.click('#tabPanel [data-mode="walking"]');
  check(await page.evaluate(() => JSON.parse(localStorage.getItem('iwh_days'))[0].mode === 'walking' && document.querySelector('#tabPanel [data-mode="walking"]').getAttribute('aria-pressed') === 'true'
    && /travelmode=walking/.test(document.querySelector('#tabPanel .ghost-action')?.href || 'travelmode=walking')), 'Mój plan dnia: wycieczka piesza zapisana (Google Maps pieszo)');
  await page.click('.tabbar [data-tab="memories"]');
  check(await page.evaluate(() => document.querySelector('#tabPanel').textContent.includes('Gdańsk')), 'Zakładka „Wspomnienia”: odwiedzone miasto');
  await page.click('.tabbar [data-tab="profile"]');
  await page.click('[data-set-lang="en"]');
  check(await page.evaluate(() => document.documentElement.lang === 'en' && document.querySelector('#tabPanel h2').textContent === 'Profile' && document.querySelector('#tabProfile').textContent === 'Profile'), 'Profil: zmiana języka na EN');
  // W EN żadnych polskich fragmentów interfejsu (poza nazwami własnymi miejsc).
  const leftovers = async () => page.evaluate(() => {
    const allow = /Gdańsk|Kraków|Łódź|Wrocław|Poznań|Toruń|Białystok|Rzeszów|Świętokrzyskie|Śląskie|Łódzkie|Małopolskie|Dolnośląskie|Bałtyk 2027|Kujawsko|Warmińsko|Podkarpackie|Zachodniopomorskie|Pomorskie|Mazowieckie|Lubelskie|Lubuskie|Opolskie|Podlaskie|Wielkopolskie|Sandomierz|Chęciny|Kielce|Nowa Słupia/g;
    const pl = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]|\b(Mapa|Plan podróży|Wspomnienia|Profil|Wybierz|miasto|Województwa|Szukaj|Zamknij|Byłem|Dodaj|Język|Styl|Warstwy|Granice|Nazwy|Pokaż|Usuń|Nowy|dnia)\b/;
    // Nazwy własne miejscowości i atrakcji z bazy regionów też są dozwolone (np. „Wąchock”).
    const names = [...new Set((window.IWH_REGIONS ? window.IWH_REGIONS.places : []).flatMap(p => [p.town, p.name.pl]))].sort((a, b) => b.length - a.length);
    const strip = v => names.reduce((acc, n) => acc.split(n).join(''), v.replace(allow, ''));
    const out = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) { const n = w.currentNode, el = n.parentElement; if (!el || el.closest('script,style,svg text.town-label,[hidden]')) continue;
      const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || !el.getClientRects().length) continue;
      const tx = strip(n.nodeValue).trim(); if (tx && pl.test(tx)) out.push(tx.slice(0, 50)); }
    document.querySelectorAll('[aria-label],[placeholder],[title]').forEach(e => { for (const a of ['aria-label', 'placeholder', 'title']) { const v = strip(e.getAttribute(a) || ''); if (v && pl.test(v)) out.push(a + ': ' + v.slice(0, 50)); } });
    return out; });
  let left = await leftovers();
  check(left.length === 0, 'EN: brak polskich fragmentów w Profilu' + (left.length ? ': ' + left.join(' | ') : ''));
  await page.click('.tabbar [data-tab="map"]');
  await page.click('#cityStrip [data-city-chip="krakow"]');
  left = await leftovers();
  check(left.length === 0, 'EN: brak polskich fragmentów na mapie i w karcie miasta' + (left.length ? ': ' + left.join(' | ') : ''));
  await page.click('#langButton [data-lang="pl"]');
  check(await page.evaluate(() => document.documentElement.lang === 'pl' && document.querySelector('#tabMap').textContent === 'Mapa Polski' && document.querySelector('#addTripLabel').textContent === 'Podróż'), 'PL: przełącznik wraca do polskiego');
  await page.click('#sheetClose');
  await page.evaluate(() => { for (const k of ['iwh_trips', 'iwh_days', 'iwh_visited']) localStorage.removeItem(k); });

  // --- Województwa: Atlas → Świętokrzyskie → Sandomierz → przewodnik regionu → powrót
  await page.click('#resetView');
  await page.click('[data-region-chip="swietokrzyskie"]');
  await page.waitForTimeout(700);
  const reg = await page.evaluate(() => ({
    name: document.querySelector('#cityName').textContent,
    outline: !!document.querySelector('#provinceFocus .region-outline'),
    pins: document.querySelectorAll('#towns .town-pin').length,
    zoom: Number(/scale\(([\d.]+)\)/.exec(document.querySelector('#world').getAttribute('transform'))[1]),
    focus: document.body.dataset.focus
  }));
  check(reg.name === 'Świętokrzyskie' && reg.outline && reg.focus === 'region', 'Atlas: wybór województwa pokazuje jego obrys');
  check(reg.pins >= 15 && reg.zoom > homeZoom * 1.6, 'Atlas: przybliżenie do województwa i pinezki miejscowości (' + reg.pins + ')');
  await page.click('[data-card-town="Sandomierz"]');
  check(await page.evaluate(() => document.querySelector('#cityAction').textContent.includes('Sandomierz')), 'Atlas: wybór miejscowości w województwie');
  await page.click('#cityAction');
  await page.waitForSelector('#placeList .place');
  const guide = await page.evaluate(() => ({
    url: location.search, lang: document.documentElement.lang, title: document.querySelector('#rTitle').textContent,
    list: document.querySelectorAll('#placeList .place').length, plan: document.querySelectorAll('#planList li .n').length,
    overflow: document.documentElement.scrollWidth - innerWidth
  }));
  check(guide.url.includes('region=swietokrzyskie') && guide.url.includes('town=Sandomierz') && guide.lang === 'pl', 'Przewodnik regionu: otwiera się z miejscowością i językiem PL');
  check(guide.list >= 5 && guide.plan >= 3, 'Przewodnik regionu: lista Sandomierza i plan dnia (' + guide.list + ' miejsc, ' + guide.plan + ' przystanków)');
  check(guide.overflow === 0, 'Przewodnik regionu: brak poziomego przewijania');
  check(await page.evaluate(() => !!(document.querySelector('.filters').compareDocumentPosition(document.querySelector('#mapSection')) & Node.DOCUMENT_POSITION_FOLLOWING)),
    'Przewodnik regionu: filtry (co pokazać na mapie) są przed mapą');
  check(await page.evaluate(() => document.querySelector('#planMode [data-mode="walking"]').classList.contains('active') && /Pieszo/.test(document.querySelector('#modeWalk').textContent)),
    'Przewodnik regionu: wycieczka piesza domyślna dla miejscowości');
  await page.click('#placeList [data-open]');
  const wikiR = await page.evaluate(() => { const a = document.querySelector('#dBody .iwh-wiki[data-l="pl"] a'); return a && a.offsetParent !== null ? a.href : ''; });
  check(/^https:\/\/(pl|en)\.wikipedia\.org\//.test(wikiR), 'Przewodnik regionu: „Więcej informacji o miejscu — Wikipedia” (' + decodeURIComponent(wikiR).slice(0, 60) + ')');
  // Dziennik podróży: notatki + zdjęcia z biblioteki (limit 5), zapis w IndexedDB
  const png = await page.screenshot({ clip: { x: 0, y: 0, width: 60, height: 60 } });
  const jkey = await page.evaluate(() => document.querySelector('#dBody [data-journal]').dataset.journal);
  await page.click('#dBody [data-journal]');
  await page.waitForSelector('.iwh-journal:not([hidden]) #ijNotes');
  await page.fill('#ijNotes', 'Piękny widok z Bramy Opatowskiej');
  await page.setInputFiles('.ij-add input', [{ name: 'a.png', mimeType: 'image/png', buffer: png }]);
  await page.waitForFunction(() => document.querySelectorAll('.ij-grid figure').length === 1);
  await page.setInputFiles('.ij-add input', Array.from({ length: 6 }, (_, i) => ({ name: 'b' + i + '.png', mimeType: 'image/png', buffer: png })));
  await page.waitForFunction(() => document.querySelectorAll('.ij-grid figure').length === 5);
  check(await page.evaluate(() => document.querySelector('.ij-add input').disabled && /najwyżej 5/.test(document.querySelector('.ij-msg').textContent)), 'Dziennik: najwyżej 5 zdjęć, czytelny komunikat');
  await page.click('.ij-done');
  const jr = await page.evaluate(k => IWH_EXTRAS.journal.get(k).then(e => e && { notes: e.notes, photos: e.photos.length, jpeg: e.photos.every(p => p.blob && p.blob.type === 'image/jpeg') }), jkey);
  check(jr && jr.notes.includes('Bramy') && jr.photos === 5 && jr.jpeg, 'Dziennik: notatka i 5 zdjęć zapisane w IndexedDB (' + JSON.stringify(jr) + ')');
  await page.waitForFunction(() => /📷 5/.test(document.querySelector('#dBody [data-journal-count]').textContent));
  check(true, 'Dziennik: licznik zdjęć na przycisku');
  await page.click('#dBody [data-stamp]');
  check(await page.evaluate(() => JSON.parse(localStorage.getItem('iwh_region_visited') || '[]').length === 1), 'Przewodnik regionu: pieczątka „Byłem tu” zapisana');
  await page.click('#dClose');
  await page.click('#langRegion [data-lang="en"]');
  check(await page.evaluate(() => document.documentElement.lang === 'en' && document.querySelector('#planTitle').textContent === 'Day plan'), 'Przewodnik regionu: przełącznik EN');
  await page.click('#atlasFloat');
  await page.waitForSelector('#provinceFocus .region-outline');
  check(await page.evaluate(() => document.documentElement.lang === 'en' && document.querySelector('#cityName').textContent.startsWith('Świętokrzyskie')), 'Powrót z regionu do Atlasu: to samo województwo i język');
  await page.click('.tabbar [data-tab="memories"]');
  await page.waitForSelector('#memJournal li.plan-item');
  check(await page.evaluate(() => document.querySelectorAll('#memJournal li.plan-item').length === 1 && /5 photos/.test(document.querySelector('#memJournal').textContent)
    && !!document.querySelector('#memJournal .journal-thumb img')), 'Atlas → Wspomnienia: dziennik podróży z miniaturą i licznikiem zdjęć');
  check(await page.evaluate(() => !!document.querySelector('#atlasApp .brand-logo img[src*="brand-atlas"]')), 'Atlas: logo z mapą Polski jako jeden znak');

  check(errors.length === 0, 'Brak błędów JavaScript' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  server.close();
  if (failures) { console.error(failures + ' test(y) nie przeszły.'); process.exit(1); }
  console.log('OK: test przeglądarkowy Atlas ⇄ Warszawa.');
})().catch(err => { console.error(err); process.exit(1); });

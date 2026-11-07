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
  check(await page.locator('.city-dot').count() === 13, 'Atlas: 13 miast');
  await page.click('#langButton [data-lang="pl"]');
  check(await page.evaluate(() => document.documentElement.lang === 'pl' && document.querySelector('#cityAction').textContent === 'Odkryj Warszawę'), 'Atlas: przełącznik PL');
  await page.click('#langButton [data-lang="en"]');

  await page.focus('[data-city="krakow"]');
  await page.keyboard.press('Enter');
  check(await page.evaluate(() => document.activeElement?.dataset?.city === 'krakow'), 'Atlas: fokus klawiatury zostaje na wybranym mieście');
  check(await page.evaluate(() => document.querySelector('#cityAction').disabled), 'Atlas: miasto „Coming soon” nie otwiera przewodnika');

  await page.click('#resetView');
  await page.click('#zoomIn');
  check(await page.evaluate(() => document.querySelector('#world').getAttribute('transform')) === 'translate(-135 -102) scale(1.3)',
    'Atlas: przycisk + powiększa wokół środka mapy');
  await page.click('#resetView');
  const pinched = await page.evaluate(() => {
    const svg = document.querySelector('#polandSvg'), r = svg.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const ev = (type, id, x) => svg.dispatchEvent(new PointerEvent(type, { pointerId: id, clientX: x, clientY: cy, bubbles: true, pointerType: 'touch', isPrimary: id === 1 }));
    ev('pointerdown', 1, cx - 30); ev('pointerdown', 2, cx + 30);
    ev('pointermove', 2, cx + 90);
    ev('pointerup', 2, cx + 90); ev('pointerup', 1, cx - 30);
    return Number(/scale\(([\d.]+)\)/.exec(document.querySelector('#world').getAttribute('transform'))[1]);
  });
  check(pinched > 1.5, 'Atlas: gest pinch powiększa mapę (skala ' + pinched.toFixed(2) + ')');

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
    const c = document.querySelector('.atlas-chip').getBoundingClientRect();
    return c.top >= 0 && c.top < 60 && c.left < 200 && !!document.elementFromPoint(c.left + c.width / 2, c.top + c.height / 2)?.closest('#atlasFloat');
  }), 'Warszawa: mapa Polski przy logo widoczna i klikalna po przewinięciu');

  await page.click('#langWarsaw [data-lang="pl"]');
  await page.waitForTimeout(400);
  check(await page.evaluate(() => document.documentElement.lang === 'pl' && localStorage.getItem('tubylem_lang') === 'pl'), 'Warszawa: PL zapamiętany');
  await page.click('#atlasFloat');
  await page.waitForSelector('.city-dot');
  check(await page.evaluate(() => document.documentElement.lang) === 'pl', 'Powrót do Atlasu zachowuje język PL');

  check(errors.length === 0, 'Brak błędów JavaScript' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  server.close();
  if (failures) { console.error(failures + ' test(y) nie przeszły.'); process.exit(1); }
  console.log('OK: test przeglądarkowy Atlas ⇄ Warszawa.');
})().catch(err => { console.error(err); process.exit(1); });

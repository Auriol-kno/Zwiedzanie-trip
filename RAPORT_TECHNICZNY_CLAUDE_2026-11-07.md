# Raport techniczny — I Was Here — Places & Memories
Autor: Claude Code · 7 listopada 2026 r. · stan `main` @ `46e0db8`

To jest raport z analizy. **Nie zmieniono żadnego pliku aplikacji.** Proponowane poprawki trzeba przygotować na osobnych gałęziach i wysłać jako osobne Pull Requesty.

## Metoda
- Przeczytałem `CLAUDE.md`, dokumentację (`README.txt`, `ATLAS_5_0.md`) i wszystkie pliki HTML/CSS/JS, dane oraz testy.
- Uruchomiłem `tools/sync_database.py`, `tools/test_bundle.py`, `tools/test_atlas.py` i `node --check` dla wszystkich plików JS. **Wszystko przechodzi.**
- Uruchomiłem aplikację lokalnie (`python -m http.server`) w Chromium/Playwright z emulacją **iPhone 13** (390×664). Sprawdziłem PL/EN, przejście Atlas → Warszawa, klawiaturę i błędy JS.
- Ograniczenia: piaskownica blokuje `unpkg.com` i kafelki OSM, więc mapy Leaflet się nie wczytały. Service Worker nie rejestruje się na `http://localhost` (warunek `https:`). **Nie testowałem na fizycznym iPhonie ani w Safari.**

## 1. Architektura i powiązania plików

```
atlas.html (start_url PWA)
 ├─ assets/atlas.css + assets/atlas-light-v5.css   (wygląd, safe areas, 100dvh)
 ├─ assets/brand-v5.js        (jednorazowo przy v5: tubylem_lang=en, tubylem_map_style=atlas)
 ├─ assets/poland-geography.js (window.POLAND_GEO: obrys, 16 województw, Wisła, Odra)
 ├─ assets/atlas-illustrated.js (window.IWH_ATLAS_ART: lasy, pola, góry, miniatury miast)
 └─ assets/atlas.js           (13 miast, projekcja, zoom/pan, wyszukiwarka, PL/EN, style)
        └── "Explore Warsaw" → ./index.html?lang=xx&from=atlas

index.html (przewodnik Warszawy)
 ├─ <style> inline (~25 KB) + assets/upgrade3.css + nav4.css + brand-v5.css
 ├─ assets/brand-v5.js
 ├─ unpkg.com/leaflet@1.9.4 (CDN, poza cache SW)
 ├─ data/atrakcje.js (window.WARSAW_DB), data/restauracje.js (window.WARSAW_FOOD)
 ├─ <script> inline: stan, planer, mapa, karty, paszport, rejestracja SW
 ├─ assets/features3.js (jedzenie, GPS, foto/rodzina, mowa, preferencje)
 │     └── dynamicznie dołącza assets/poland-explorer.js  ← starszy moduł
 ├─ assets/i18n4.js (tłumaczenie DOM PL→EN + nadpisywanie pól bazy)
 └─ <a id="atlasFloat">  ← umieszczony PO skrypcie i18n4.js

service-worker.js — cache "network-first", rejestrowany tylko w index.html
```

Klucze `localStorage`: `tubylem_lang`, `tubylem_map_style`, `iwh_brand_v5`, `odkryjWarszawe_1`, `odkryjWarszawe_onboard`, `waw3_prefs`, `waw3_food_favs`. Stary moduł dodaje własne: `tb_lang`, `tb_map_style`, `tb_saved_trips`, `tubylem_priority`.

## 2. Błędy — potwierdzone w przeglądarce

### B1 (krytyczny) — angielska wersja Warszawy nie włącza się przy wejściu
`assets/i18n4.js:223` w `refresh()` ustawia `$('#atlasFloat').href`, ale element `#atlasFloat` znajduje się w `index.html` **po** tagu `<script src="assets/i18n4.js">`. Przy pierwszym uruchomieniu wynikiem jest `null` i wyjątek:
```
TypeError: Cannot set properties of null (setting 'href') at refresh (i18n4.js:223)
```
Skutek: po kliknięciu „Explore Warsaw” w atlasie EN strona Warszawy jest **po polsku** (`<html lang="pl">`, nagłówek „Twoje miasto. Twoja trasa.”), a przycisk już pokazuje „EN”. Nie działa też obserwator DOM, a przycisk powrotu prowadzi do `./atlas.html` bez `?lang`. Dopiero dwukrotne kliknięcie PL/EN naprawia widok. Testy tego nie wykrywają, bo sprawdzają tylko teksty w plikach.
**Poprawka:** przenieść `#atlasFloat` przed skrypty albo użyć `?.`/sprawdzenia `null` w `refresh()`. Dodać test w przeglądarce dla `?lang=en`.

### B2 (wysoki) — przestarzały moduł „Tu Byłem” na górze przewodnika Warszawy
`features3.js:119` wczytuje `assets/poland-explorer.js`. Ten moduł wstawia na samą górę strony (`prepend`) blok **„Tu Byłem / Miejsca i Wspomnienia · Odkrywaj Polskę”** z drugą mapą Polski (Leaflet + OSM). Dodaje też do nagłówka **drugi przełącznik języka** i przycisk mapy (w sumie 5 przycisków na 390 px). Używa osobnych kluczy `tb_lang`/`tb_map_style`, więc jego język nie zgadza się z resztą aplikacji (w trybie EN nadal „Miejsca i Wspomnienia”, „Pełny ekran”, „Cała Polska”). Bez sieci pokazuje tylko „Mapa wymaga połączenia z internetem.” na pierwszym ekranie.
Plik nie jest w cache Service Workera ani w `node --check` w CI.
**Poprawka (do decyzji właściciela):** wyłączyć ładowanie `poland-explorer.js` (jego rolę przejął `atlas.html`) albo przenieść przydatne funkcje (zapisane wycieczki, eksport .ics) do Warszawy pod wspólnym `tubylem_lang`. Ta praca może pochodzić od innego asystenta, więc nie usuwam niczego bez zgody.

### B3 (wysoki) — Warszawa offline niedostępna z Atlasu
`service-worker.js` buforuje `./index.html`, ale atlas otwiera `./index.html?lang=en&from=atlas`. `caches.match()` jest wywoływane bez `ignoreSearch`, więc offline ten adres nie pasuje i SW zwraca **atlas.html** zamiast przewodnika. Dodatkowo:
- SW jest rejestrowany tylko w `index.html`. Ktoś, kto zainstalował PWA z `atlas.html` i nigdy nie wszedł do Warszawy, nie ma trybu offline.
- Odpowiedzią zapasową dla każdego nieudanego GET (także obrazka czy JS) jest `atlas.html`.
- Każdy wariant `?lang=…` trafia do cache jako osobny wpis.

**Poprawka:** `caches.match(req,{ignoreSearch:true})` dla nawigacji, zapasowy HTML tylko dla `request.mode==='navigate'`, rejestracja SW także w `atlas.js`, dodanie `poland-explorer.js` (jeśli zostaje) do CORE i podbicie wersji cache.

### B4 (średni) — mechaniczne, błędne tłumaczenia EN atrakcji
W trybie EN **158 ze 184** atrakcji dostaje szablonowy opis z `fallback()`, np.:
> „Explore historical site in Bemowo. Fort Bema offers a worthwhile stop while discovering the city.”

`properEnglish()` zamienia tylko prefiks i zostawia polską odmianę: „Monument to **Małego Powstańca**”, „Museum of **Katyńskie**”, „Museum of **Więzienia Pawiak**”, „Monument to **Mikołaja Kopernika**”. Według `CLAUDE.md` angielski nie powinien mieć polskich fragmentów ani automatycznie zmyślanych treści. Po przełączeniu na EN zostaje około 109 widocznych polskich fragmentów (część to poprawne nazwy własne, np. dzielnice).
**Poprawka:** dodać pola `name_en`/`desc_en`/`story_en` w `data/atrakcje.json` (wypełniane redakcyjnie, stopniowo). Do tego czasu w EN pokazywać oryginalną polską nazwę i krótką, uczciwą informację („Description available in Polish”) zamiast złej odmiany i szablonu.

### B5 (średni, dostępność) — utrata fokusu klawiatury w Atlasie
`atlas.js` `select()` → `renderMarkers()` usuwa i tworzy na nowo wszystkie `.city-dot`. Po Enter/Spacji na mieście fokus wraca na `<body>` (potwierdzone: `activeElement = BODY`). Użytkownik klawiatury lub VoiceOver traci pozycję.
**Poprawka:** zmieniać tylko klasy `selected`, bez przebudowy, albo przywracać fokus na nowy element `[data-city=id]`.

### B6 (niski) — niespójna marka i resztki „Tu Byłem”
- `atlas.html`: `apple-mobile-web-app-title="Tu Byłem"` (manifest i `index.html` mają „I Was Here”). Ta nazwa pojawia się pod ikoną na iPhonie, gdy dodaje się stronę z Safari.
- `atlas.js` aria-label marki w PL: „Tu Byłem — mapa Polski”.
- `index.html`: „przewodnik 4.0” w hero i „Wersja demonstracyjna 3.0” w stopce, a aplikacja ma wersję 5.0. Tłumaczenie EN stopki mówi „Version 4.0 preview”.
- `localize()` odwołuje się do nieistniejącego `#atlasTitle` (to nie błąd, ale martwy kod).

### B7 (niski) — drobne usterki Atlasu
- `zoomTo()` liczy środek jako (450, 325), a viewBox ma 900×680 (środek 340). Powiększanie lekko „ucieka” w górę.
- Brak gestu **pinch-zoom** na dotyku (jest tylko `wheel` i przyciski +/−). `touch-action:none` na SVG blokuje też natywny zoom, więc na iPhonie nie da się powiększyć mapy dwoma palcami.
- Początkowy HTML ma `lang="en"`, ale polskie teksty (`cityStatus`, placeholder, aria-label). Przez chwilę przed uruchomieniem JS widać mieszankę języków.
- Etykiety regionów (POMERANIA, MASOVIA…) częściowo zasłaniają miniatury miast i lasy.
- Nazwy w EN bez polskich znaków („Krakow”, „Gdansk”, „Lodz”). To akceptowalne, ale `CLAUDE.md` mówi o zachowaniu nazw własnych. Do decyzji: „Kraków”, „Gdańsk”, „Łódź” w obu językach.

### B8 (niski) — PWA/ikony
- `icon-512.png` ma `"purpose": "any maskable"`. Zalecane są osobne ikony, bo maskowanie przycina ikonę „any”.
- Pliki PNG (870 B / 2,7 KB) to prawdopodobnie stara, uproszczona grafika (co przyznaje `README.txt`). iOS używa `apple-touch-icon` PNG, nie SVG.

## 3. Luki w testach
Obecne testy sprawdzają obecność tekstów i ID w plikach, a nie działanie aplikacji. Dlatego B1–B5 przechodzą CI na zielono. Brakuje:
1. testu Playwright (Chromium jest dostępny w CI ubuntu): Atlas EN → Warszawa, `html[lang]`, brak `pageerror`, dwa języki;
2. `node --check assets/poland-explorer.js` w `validate.yml`;
3. testu, że każdy plik ładowany dynamicznie jest w CORE Service Workera;
4. testu offline (nawigacja z parametrem `?lang`).

## 4. Co działa dobrze
- Geografia: 571-punktowy obrys i 16 województw z Natural Earth. Wszystkie 13 miast leży wewnątrz granicy (test). Dekoracje są w osobnej warstwie z `clip-path` i nie przesuwają pinezek.
- Wygląd Atlasu (koncepcja nr 1) na 390 px: brak poziomego przewijania, `100dvh`, `env(safe-area-inset-*)` w nagłówku, kontrolkach i dolnym panelu.
- Tylko Warszawa jest oznaczona jako dostępna. Pozostałe miasta mają „Coming soon” / „W przygotowaniu”.
- Dane: `coordinateStatus` uczciwie oznacza 158 współrzędnych jako „orientacyjne”. `googleRating` wymuszone na `null` (nie ma zmyślonych ocen Google). Brak kluczy API w kodzie.
- Bez Leaflet przewodnik Warszawy działa dalej (komunikat zamiast awarii, lista i planer działają).
- Pływający przycisk Atlasu w Warszawie omija dolną nawigację i safe area, a przy arkuszach i ekranie powitalnym przesuwa się na górę.

## 5. Proponowane PR-y (małe, osobne, kolejno)
| # | Gałąź | Zakres | Ryzyko |
|---|---|---|---|
| 1 | `claude/fix-i18n-startup` | B1: kolejność `#atlasFloat`/zabezpieczenie `null` + test Playwright `?lang=en` | niskie |
| 2 | `claude/fix-sw-offline` | B3: `ignoreSearch`, fallback tylko dla nawigacji, rejestracja SW w Atlasie, wersja cache | niskie |
| 3 | `claude/atlas-a11y-focus` | B5 + środek zoomu + pinch-zoom na iPhonie | średnie (gesty) |
| 4 | `claude/brand-cleanup` | B6: tytuł iOS, aria-label, wersje 5.0 w PL i EN | niskie |
| 5 | *(decyzja właściciela)* | B2: wyłączenie lub integracja `poland-explorer.js` | średnie |
| 6 | *(etap redakcyjny)* | B4: pola `*_en` w bazie i uczciwy fallback EN | średnie, dużo treści |
| 7 | `claude/ci-browser-tests` | Sekcja 3: testy Playwright i rozszerzenie `validate.yml` | niskie |

Każdy PR: polski opis, `sync_database.py`, oba testy, `node --check`, przegląd diffu. Wymagany też ręczny test na iPhonie (Safari i PWA z ekranu początkowego), którego nie mogę wykonać.

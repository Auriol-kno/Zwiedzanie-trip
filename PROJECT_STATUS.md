# PROJECT_STATUS — I Was Here / Places & Memories

**Stan na:** 2026-11-07 · **Wersja:** 8.3 (gałąź `claude/guide-wiki-passport`, PR do scalenia) · **`main`:** 8c1c27d („Scal #9: Kielce w Atlasie…”)
**Cache PWA:** `i-was-here-v8-3-20261107` · **Publikacja:** https://auriol-kno.github.io/Zwiedzanie-trip/atlas.html

> Ten plik opisuje *bieżący* stan. Aktualizuj go przy każdym PR, który zmienia funkcje,
> dane, znane błędy albo następne zadanie. Historia jest w `CHANGELOG.md`, plan w `ROADMAP.md`.

---

## 1. Działające funkcje (zweryfikowane testami 2026-11-07)

### Atlas Polski — `atlas.html` (ekran startowy PWA)
- Mapa SVG 900×680, rzut równoodległościowy z równoleżnikiem 52° (`GEO.projection`).
- Granice, rzeki, jeziora i sąsiedzi z Natural Earth 1:10m; relief z Terrain Tiles.
- 4 style: **Atlas** (domyślny, premium), **Jasny/Light** (ilustrowany), **Noc**, **Teren**;
  wybór pamiętany w `tubylem_map_style`.
- 14 miast z pinami w poprawnych miejscach (Kielce od 8.2), 16 województw:
  wybór przybliża, obrysowuje i pokazuje miejscowości z miejscami.
- Wyszukiwarka miast, województw i miejscowości, zoom +/−, pinch-zoom, przesuwanie.
- Panel warstw (`iwh_layers`), skala km, kompas.
- Przycisk „Polska/Poland” animuje powrót do całego kraju.
- Karta miejsca zawiera cztery akcje: przewodnik, plan podróży, plan dnia i „Byłem tu”.
- Dolne zakładki: Mapa, Plan podróży (`iwh_trips`), Mój plan dnia (`iwh_days`),
  Wspomnienia (`iwh_visited`), Profil.

### Przewodniki regionalne — `region.html?region=…&town=…`
- 16 województw, 207 miejsc (Kielce: 14). Mazowieckie jest częściowe: Warszawa ma osobny
  pełny przewodnik, a w przewodniku regionu jest 8 miejsc.
- Funkcje:
  - lista i mapa Leaflet;
  - filtry miejscowości i kategorii;
  - zapisane miejsca (`iwh_region_favs`) i stemple (`iwh_region_visited`);
  - szacunkowy plan dnia;
  - PL/EN;
  - powrót do Atlasu na to samo województwo.
- 166 z 207 współrzędnych zweryfikowano w OSM (`coordinateStatus:"osm"` + `osm.id`).
  Pozostałe są oznaczone jako orientacyjne. Atrybucja ODbL jest widoczna w aplikacji.

### Przewodnik Warszawy — `index.html`
- Dane: 184 atrakcje w 18 dzielnicach i 36 lokali gastronomicznych.
- Planer trasy i ocena redakcyjna 1–5 (to nie jest ocena Google).
- Ulubione, wirtualne stemple, preferencje rodzinne i fotograficzne.
- Synteza mowy i GPS (za zgodą użytkownika).
- Biblioteka tras i eksport .ics.
- Logo w lewym górnym rogu zawsze wraca do Atlasu.

### Wspólne
- **Logo = jeden znak** (`assets/brand-atlas.svg`, pinezka w sylwetce Polski) w lewym górnym rogu każdej strony; zawsze wraca do Atlasu.
- **„Więcej informacji o miejscu — Wikipedia”** przy opisie każdej atrakcji (regiony + Warszawa), PL/EN; potwierdzony artykuł
  (OSM `wikidata` + Wikidata) albo uczciwe wyszukiwanie w Wikipedii — patrz liczby w §2.
- **Dziennik podróży (paszport):** notatki + do 5 zdjęć z biblioteki na miejsce, lokalnie w IndexedDB `iwh_journal`;
  w szczegółach atrakcji, paszporcie Warszawy (📝) i w Atlasie → Wspomnienia.
- **Wycieczka piesza:** Warszawa (planer), przewodnik regionu (domyślnie przy wejściu z miejscowości), Atlas → Mój plan dnia.
- **Wybór rodzajów atrakcji przed mapą** w regionie i w Warszawie.
- Język PL/EN (`tubylem_lang`) jest wspólny dla Atlasu, regionów i Warszawy.
- PWA na iPhone'a: manifest, `start_url ./atlas.html`, skróty, safe-area,
  service worker network-first z cache offline plików aplikacji.
- CI (`.github/workflows/validate.yml`) przy każdym push/PR na `main`:
  - sync danych + `git diff`;
  - testy Python;
  - `node --check`;
  - Playwright (`tools/test_browser.js`).

## 2. Funkcje niedokończone / częściowe
- **Wikipedia:** potwierdzone artykuły ma 110 z 207 miejsc regionalnych i 69 ze 184 atrakcji Warszawy
  (OSM `wikidata` + Wikidata, 9 dopasowań odrzuconych ręcznie — lista `REJECT` w `tools/wiki_links.py`). Pozostałe mają
  uczciwy link „szukaj w Wikipedii”. Kolejne artykuły: ROADMAP etap B.
- Spośród 14 miast tylko **Warszawa** ma pełny przewodnik miejski. Pozostałe 13 miast ma
  swoje atrakcje w przewodniku województwa i nie wolno ich przedstawiać jako pełnych przewodników.
- **Mazowieckie** poza Warszawą ma tylko 8 miejsc.
- **Opisy EN w Warszawie**: ok. 158 atrakcji pokazuje „English description not available yet”
  (uczciwy placeholder, bez maszynowego tłumaczenia).
- **Współrzędne**:
  - 41 z 207 miejsc regionalnych jest orientacyjnych, bo nie ma pewnego dopasowania w OSM
    (np. Exploseum, Ostrów Tumski, Dworek Laszczyków, Muzeum Żeromskiego);
  - ok. 158 współrzędnych atrakcji Warszawy jest orientacyjnych.
- **Komunikacja i trasy** to szacunki i linki zewnętrzne (Google Maps),
  bez walidowanego routingu WTP w czasie rzeczywistym.
- **Oceny Google** są tylko linkiem zewnętrznym; `googleRating` ma wartość `null` (bez klucza Places API).
- **Wspomnienia/Profil/Dziennik** działają tylko lokalnie (`localStorage` + IndexedDB): nie ma kont, synchronizacji
  ani kopii zapasowej — wyczyszczenie danych Safari usuwa notatki i zdjęcia (eksport/import: ROADMAP etap D).

## 3. Znane błędy i ryzyka
| # | Problem | Gdzie | Waga |
|---|---------|-------|------|
| 1 | Leaflet (CDN unpkg) i kafelki OSM nie są cache'owane: mapa regionu offline jest pusta (lista działa) | `region.html`, `service-worker.js` | średnia |
| 2 | Na małych ekranach przycisk „Polska” może zasłaniać piny i etykiety na południowym wschodzie (np. Rzeszów) lub wybraną etykietę | `atlas-premium.css` | niska |
| 3 | Przy otwartej karcie miejsca paski miast i województw są ukryte (świadomy kompromis wysokości) | `atlas.js` / CSS | niska |
| 4 | i18n Warszawy (`i18n4.js`) to kruchy „DOM-walker” na tekstach: nowe teksty w `index.html` wymagają dopisania tłumaczeń | `assets/i18n4.js` | średnia |
| 5 | `assets/poland-explorer.js` ma mylącą nazwę historyczną: zostały w nim tylko biblioteka tras i .ics | Warszawa | niska |
| 6 | Workflow `sync-icons.yml` pushuje bezpośrednio na `main` (wyjątek od zasady PR) | `.github/workflows` | niska |
| 7 | Brak testu na fizycznym iPhonie / Safari: testowano wyłącznie emulację Chromium iPhone 13 | — | średnia |
| 8 | `data/SCHEMA.md` (118 rekordów) i `PLAN_ROZWOJU.md` (React/MapLibre) są nieaktualne: to dokumenty historyczne | docs | niska |
| 9 | `github.io` jest niedostępne z sandboxa Claude: wdrożenie sprawdza się przez status GitHub Actions „pages build and deployment” | środowisko | info |

## 4. Ostatnio wykonane prace
- PR #9 (8.2): Kielce w Atlasie, 14 atrakcji kieleckich, weryfikacja OSM 166/207.
- PR #7 (8.0/8.1): przewodniki wszystkich 16 województw.
- PR #6 (6.0 + 7.0): województwa z obrysem, przewodnik regionu, premium mapa z reliefem, plany.
- PR #4 (5.2/5.3): logo jako stały powrót, poprawki z raportu, test przeglądarkowy.
- PR #2 (5.1b): jeden przełącznik PL | EN.
- 8.3 (gałąź `claude/guide-wiki-passport`, zawiera PR #10 z dokumentacją): logo z mapą jako jeden znak, Wikipedia przy
  atrakcjach, filtry przed mapą, wycieczka piesza w regionach i planie dnia, dziennik podróży (notatki + 5 zdjęć).
- PR #10 (gałąź `claude/project-docs`): dokumentacja długoterminowa (ten plik, `ROADMAP.md`, `CHANGELOG.md`, `CLAUDE.md`).
- Raport techniczny `RAPORT_TECHNICZNY_CLAUDE_2026-11-07.md` leży tylko na gałęzi
  `claude/i-was-here-analysis-augprr` (niescalonej). Jego zalecenia wdrożono w PR #2–#4.

## 5. Zależności i konfiguracja środowiska
- **Runtime aplikacji:** brak builda. Statyczne HTML/CSS/JS na GitHub Pages
  (Settings → Pages → `main`, root).
- **Zewnętrzne zasoby w runtime:**
  - Leaflet 1.9 z `unpkg.com` i kafelki `tile.openstreetmap.org` (tylko `region.html`);
  - linki zewnętrzne (Google Maps).
  - Brak kluczy API i sekretów.
- **Narzędzia deweloperskie:**
  - Python 3.12+: `sync_database.py`, testy i `verify_coordinates.py` używają tylko
    biblioteki standardowej; `build_geography.py` wymaga `numpy`, `Pillow`, `shapely`,
    a `render_icons.py` wymaga `cairosvg` (uruchamiane w workflow `sync-icons.yml`);
  - Node 20+;
  - Playwright 1.63 + Chromium (w CI instalowane przez workflow; w sandboxie Claude
    jest preinstalowany globalnie, więc uruchamiaj z `NODE_PATH=$(npm root -g)`).
- **Sieć potrzebna tylko narzędziom:**
  - `nominatim.openstreetmap.org` dla `verify_coordinates.py` i `wiki_links.py`, `www.wikidata.org` dla `wiki_links.py`
    (oba na allowliście środowiska Claude; `*.wikipedia.org` z sandboxa niedostępne); host jest na allowliście
    środowiska Claude, a narzędzie trzyma tempo 2.5 s i ponawia przy 429;
  - `raw.githubusercontent.com` (Natural Earth) i `s3.amazonaws.com` (Terrain Tiles) dla `build_geography.py`
    (pliki wynikowe są w repo, więc zwykle nie trzeba).
- **Uruchomienie lokalne:** `python3 -m http.server 8000` → http://localhost:8000/atlas.html.
- **Sprawdzone 2026-11-07 na świeżym klonie z GitHuba:**
  - sync bez różnic;
  - `test_bundle`, `test_atlas`: OK;
  - `node --check` wszystkich JS: OK;
  - `py_compile` narzędzi: OK;
  - `test_browser`: OK, bez błędów JS;
  - wszystkie lokalne zasoby z HTML/SW istnieją.

## 6. Najbliższe zadanie do realizacji
**Najpierw:** ręczny test 8.3 na iPhonie (wybór zdjęć z biblioteki w Safari/PWA, dziennik, logo). Potem:
**Offline dla przewodnika regionu (błąd #1):** wkleić Leaflet lokalnie
(`assets/vendor/leaflet/`), dodać go do cache SW i pokazywać czytelny komunikat
„Mapa niedostępna offline / Map unavailable offline” zamiast pustego kafla. Bump cache.
Następne w kolejce: patrz `ROADMAP.md` → „Etap A”.

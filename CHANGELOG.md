# CHANGELOG — I Was Here / Places & Memories

## 8.9.0 — Motyw „kulki na torze” (2026-11-13, PR do scalenia po „Scal”)

- Na polecenie właściciela cała aplikacja (Atlas, przewodniki regionów, Warszawa) zmienia kolorystykę z granatu/bursztynu/oliwki/kremu na niebieski motyw z makiety „kulki na torze”: głęboki granat `#0C2C59`, niebieski ląd, różowe akcenty `#F4288B`, żółte `#FFD84A`, morski `#3FA396` dla sukcesu, jasnoniebieskie tła zamiast kremu.
- Kolory przeliczono skryptem we wszystkich plikach CSS/JS/SVG, `index.html`, `atlas.html`, `region.html`, `manifest.webmanifest`, `data/szlaki.json` i `tools/build_logo.py`; jasność każdego koloru została zachowana, więc kontrasty są takie jak wcześniej. Raster `assets/poland-relief.webp` przekolorowano na niebieski (geometria i cieniowanie bez zmian).
- Nowy arkusz `assets/theme-marbles.css` (ładowany jako ostatni): aktywne przyciski menu jako różowe „kulki” z połyskiem, różowo-żółta szyna nad dolnym menu, żółta obwódka mapki Polski w nagłówku, `--accent` Warszawy na różowy.
- Bez zmian: logo (pinezka i znaczek mapy mają teraz niebieskie barwy), układ, funkcje, dane. Eksport Excel zachowuje dotychczasowe kolory arkuszy.
- Cache: `i-was-here-v8-9-0-20261113`. `APP_VERSION` kopii JSON: 8.9.0. Testy: sync_database (bez diffu), test_bundle, test_atlas, `node --check`, pełny test_browser.js i test_dwarfs.js przeszły w Chromium (emulacja iPhone 13). Nie testowano na fizycznym iPhonie.

## 8.8.0 — Wrocław: krasnale (2026-11-09, PR #23, przygotowano do scalenia po zgodzie właściciela)

- 769 lokalizacji OSM z miejskiej mapy `https://mobile.wroclaw.pl/krasnale.geojson`, stan danych 2026-08-11, pobrano 2026-11-09. Licencja ODbL; to nie jest pełny ani zweryfikowany na miejscu rejestr.
- Osobny katalog `data/wroclaw-krasnale.json`, dołączany przez `tools/sync_database.py` do plików regionu, lekkiej bazy Atlasu i indeksu. 213 dotychczasowych atrakcji z długimi historiami pozostaje oddzielną redakcyjną kolekcją; krasnale mają krótkie opisy PL/EN oparte wyłącznie na tagach OSM, z autorem/datą, gdy dostępne, i ostrzeżeniami o dostępie. Razem 982 punkty regionalne.
- Wrocław: włączana warstwa krasnali, filtr kategorii, ukrywanie znalezionych, piny Canvas (zielone po zdobyciu), lista po 60 wpisów, szczegóły, dojazd, ulubione, dziennik i dodawanie do planów. Miejsca z ograniczonym dostępem nie trafiają do automatycznego planu.
- Pieczątki każdego krasnala oraz progi 1/5/10/25/50/100/250/769, PL/EN; wspólny zapis `iwh_region_visited`, odznaki wyliczane bez osobnego stanu. Odznaki są też w Excelu; pieczątki i plany przechodzą przez istniejący eksport/import Excel i JSON.
- Walidacja: synchronizacja danych, test_bundle.py, test_atlas.py, kontrola składni JS, pełny test_browser.js i test_dwarfs.js przeszły w Chromium (emulacja iPhone 13).
- Cache PWA `i-was-here-v8-8-0-20261109`; nowe testy `tools/test_dwarfs.js` w CI. Nie testowano na fizycznym iPhonie.
- Aktualizacja danych: pobierz GeoJSON z powyższego adresu, uruchom `python tools/import_wroclaw_dwarfs.py <plik.geojson>`, potem `python tools/sync_database.py`. Importer nie pobiera zdjęć ani nie kopiuje cudzych opisów.
- Nie wdrożono jeszcze pełnego przewodnika miejskiego Wrocławia na wzór Warszawy ani dodatkowych zwykłych atrakcji — ten PR obejmuje zamówioną kolekcję krasnali.


## 8.7.1 — 2026-11-09 — linki do Atlasu (PR #24, scalone)
- Na polecenie właściciela mała mapka Polski jest pierwszym elementem nagłówka, skrajnie po lewej; logo stoi obok niej. Oba są linkami do całej mapy Atlasu, z zachowaniem języka. W samym Atlasie oba zamykają zakładki i wracają do widoku całej Polski bez przeładowania.
- Na wąskich ekranach nazwa przy logo przewodnika jest ukryta, aby mapka, logo i przyciski nie zachodziły na siebie. Logo pozostaje dostępne z klawiatury i ma etykietę PL/EN.
- Testy: synchronizacja bazy, test_bundle.py, test_atlas.py, kontrola składni i pełny test_browser.js przeszły w Chromium (emulacja iPhone 13). Sprawdzono kliknięcie logo z zakładki Pieczątek oraz mapkę po lewej w Warszawie.
- Cache: `i-was-here-v8-7-1-20261109`. Poprawka oparta na main 8.7.0; niezależna od oczekującego PR #23 z krasnalami. Nie testowano na fizycznym iPhonie.

Historia zmian odtworzona z `git log` gałęzi `main` i Pull Requestów #1–#9.
Najnowsze na górze. Daty w formacie RRRR-MM-DD. Numery wersji są zgodne z plikami
dokumentacji (`ATLAS_*.md`, `REGIONY_*.md`) i kluczem cache w `service-worker.js`.

Zasada: każda zmiana scalana do `main` dopisuje tu wpis (wersja, data, PR, co się zmieniło,
znane ograniczenia). Aktualny klucz cache PWA: `i-was-here-v8-7-0-20261108`.

---

## 8.7.0 — 2026-11-08 — PR #22 (scalone)
- **Moje dane — Excel** (Profil w Atlasie, `assets/user-data.js`, `window.IWH_DATA`), prośba właściciela:
  - plik `.xlsx` powstaje w przeglądarce, bez bibliotek i bez serwera (własny ZIP, kompresja `CompressionStream`; ok. 120 KB);
  - arkusze: **Start** (instrukcja, podsumowanie), **Plany** (podróże i plany dnia: wiersz = miejsce; listy rozwijane z miejscami, rodzajem planu i trybem; formuły uzupełniają typ, województwo i współrzędne), **Pieczątki**, **Odznaki** (postęp miast, Warszawy i 16 województw z formuł), **Dziennik** (notatki), **Mapa** (wykres-mapa: granica Polski i województw z Natural Earth, 14 miast, zaplanowane miejsca z numerami i pieczątki — odświeża się po dopisaniu wierszy w Excelu), **Miejsca** (katalog 580 pozycji dla list) i ukryty `_mapa`;
  - PL i EN (nazwy arkuszy, nagłówki, typy); import rozpoznaje oba języki;
  - **Wyślij Excel e-mailem:** arkusz Udostępnij z plikiem (iPhone: Poczta z załącznikiem), zapasowo pobranie + `mailto:`; opcjonalny e-mail użytkownika zapisany tylko lokalnie (`iwh_profile`). Aplikacja nie wysyła poczty sama — nie ma serwera;
  - **Pełna kopia `.json`** z plikami zdjęć dziennika (base64);
  - **Wczytaj dane z pliku** (`.xlsx` lub `.json`) z podglądem: „Scal” (domyślnie: dodaje nowe plany, brakujące miejsca, pieczątki, notatki i zdjęcia do limitu 5) albo „Zaktualizuj plany z pliku” (plany o tych samych nazwach przyjmują wersję z pliku). Nic nie jest usuwane; nieznane miejsca są wypisane jako pominięte wiersze;
  - plany przyjmują atrakcje Warszawy (`{t:'waw',id,name,lat,lon}`, ROADMAP B3 w wersji podstawowej).
- **Mapa regionu offline:** Leaflet 1.9.4 lokalnie w `assets/vendor/leaflet/` (licencja BSD-2) zamiast unpkg — także w przewodniku Warszawy; komunikat PL/EN „Brak podkładu mapy (offline)”, gdy brak kafelków OSM.
- **Baza danych, etap 1 (BAZA_DANYCH.md §4):** `sync_database.py` generuje lekkie `data/regiony-lite.js` (Atlas, 69 KB zamiast 134 KB, bez opisów) i `data/regiony/<województwo>.json` (pełne dane); `assets/region-loader.js` pobiera plik otwartego województwa (zapasowo pełny `data/regiony.js`). Wszystkie pliki w cache PWA i w kontroli CI.
- **Widok całej Polski na telefonie** zaczyna się pod przyciskami mapy (warstwy, +, −): Gdańsk i Olsztyn nie są zasłonięte; widok województwa bez zmian.
- **Wydajność:** `setTransform` najpierw czyta układ (jedno przeliczenie zamiast trzech), trzyma listy węzłów i przepisuje znaczki tylko przy zmianie skali: ok. 75 → 39 ms na przerysowanie (iPhone 13, CPU ×4).
- **Porządki:** `assets/poland-explorer.js` → `assets/trips-ics.js`; `data/SCHEMA.md` i `PLAN_ROZWOJU.md` oznaczone jako archiwalne.
- Testy przeglądarkowe: 94 kontrole (+11: Excel PL/EN, kopia JSON, import scal/aktualizuj, pliki województw, Leaflet lokalny, komunikat offline). Cache `i-was-here-v8-7-0-20261108`.

## 8.6.5 — 2026-11-08 — PR #21 (scalone 9e028c5)
- **Naprawa: pinezki miast odjeżdżały od mapy przy przybliżaniu.** `.city-dot` miał w `assets/atlas.css` `transform-box: fill-box; transform-origin: center`, więc skala pinezki (stały rozmiar na ekranie, `scale(1/zoom)`) była liczona wokół środka całej grupy (pinezka + znaczek + podpis), a nie wokół czubka pinezki. Czubek był ok. 19 px od miasta w widoku kraju i ok. 72 px po przybliżeniu (emulacja iPhone 13). Teraz `transform-box: view-box; transform-origin: 0 0` — odchyłka 0 px przy każdym powiększeniu, także w widoku województwa.
- Nowa kontrola w teście przeglądarkowym (83): czubek każdej pinezki leży na współrzędnych miasta przed i po przybliżeniu (bez poprawki test pokazuje 5,5 / 65,5 px).
- Cache `i-was-here-v8-6-5-20261108`.

## 8.6.4 — 2026-11-08 — PR #19 (scalone e00884e)
- **Płynna mapa Atlasu** przy przesuwaniu, pinch-zoomie, kółku myszy i animacji przelotu do województwa:
  - w trakcie gestu przesuwana i skalowana jest gotowa warstwa (`.atlas-map`, transformacja CSS na GPU), bez przerysowania tysięcy ścieżek, filtrów, znaczków i podpisów;
  - pełny rysunek powstaje raz — po puszczeniu palca, po zatrzymaniu palców na ok. 0,25 s albo przy bardzo dużej zmianie skali;
  - transformacja jest na kontenerze, nie na `<svg>`, bo granice i rzeki mają `vector-effect: non-scaling-stroke` (zmiana transformacji samego `<svg>` wymuszała ich przerysowanie w każdej klatce);
  - pomiar (emulacja iPhone 13, procesor ×4 wolniejszy): przesuwanie 83 → 17 ms/klatkę (60 kl./s), pinch 272 → 21 ms/klatkę; obraz po puszczeniu palca pokrywa się z podglądem co do piksela.
- Cache `i-was-here-v8-6-4-20261108`; nowa kontrola w teście przeglądarkowym.

## 8.6.1–8.6.3 — 2026-11-08 — PR #18 (scalone b503643)
- **8.6.3 — historie wszystkich 184 atrakcji Warszawy** (≥10 zdań PL i EN) w `data/warszawa-historia/*.json` z mapą `index.json` generowaną przez `sync_database.py`; przewodnik Warszawy wczytuje je na żądanie w „Historii miejsca” (krótkie `story` zostaje jako zapas). Przy mniej znanych parkach i skwerach opisujemy historię dzielnicy i kontekst, bez zgadywania szczegółów; ostatnie zdania części tekstów uzupełniono danymi z bazy (dzielnica, szacowany czas pobytu). Cache `i-was-here-v8-6-3-20261108`, 81 kontroli w teście przeglądarkowym.
- **Historie dla wszystkich województw:** każde z 213 miejsc regionalnych ma historię ≥10 zdań PL i EN (16 plików `data/historia/<region>.json`). `sync_database.py` wymaga teraz historii dla każdego nowego miejsca.
- **Plany zwiedzania dla 16 województw** w Odkrywaj: nowy motyw „Plany województw” (ilustracja mapy z pinezką), 8–12 przystanków w kolejności geograficznej, wstęp PL/EN, link „Przewodnik województwa” (46 szlaków, 15 motywów).
- **Podpis autora „Made by Tomasz Kmiecik”** (prośba właściciela): Profil w Atlasie, stopki przewodników regionów i Warszawy, `<meta name="author">`, README.
- Wszystkie 16 plików historii w cache PWA (ok. 0,5 MB), cache `i-was-here-v8-6-2-20261108`; testy przeglądarkowe: 80 kontroli.
- **Historie ≥10 zdań PL/EN** dla kolejnych 65 miejsc: całe Pomorskie (13), Dolnośląskie (12) i Świętokrzyskie (40). Razem 95 z 213 miejsc regionalnych.
- **Baza danych, etap 1 (`BAZA_DANYCH.md`):** `sync_database.py` generuje lekki indeks `data/index/places.json` (397 obiektów: 213 w regionach + 184 w Warszawie, pole rodzaju `k`, flaga historii `h`).
  Pieczątki pobierają go na żądanie, gdy strona nie ma pełnej bazy: w Warszawie można teraz szukać i odblokowywać miejsca z regionów, a w Atlasie i regionach — atrakcje Warszawy (wcześniej był tylko link do drugiej strony).
- Właściciel zaakceptował motywy i ilustracje Odkrywaj, etap 1 bazy danych oraz kolejność województw (Pomorskie, Dolnośląskie, Świętokrzyskie).
- Cache `i-was-here-v8-6-1-20261108`.

## 8.6 — 2026-11-08 — PR #17 (scalone 71aeaed)
- **Odkrywaj = szlaki tematyczne** (`assets/explore-themes.js`, `.css`, dane `data/szlaki.json`):
  - 14 motywów z ilustrowanymi, wektorowymi kafelkami w stylu logo (kolor motywu, złota ramka): Historia i królowie, Zamki i rycerze, Baśnie i legendy, Czarownice, diabły i duchy, II wojna światowa i pamięć, Nauka i Kopernik, Technika i przemysł, Podziemia i jaskinie, Dzika przyroda, Wiele kultur i wyznań, Skarby UNESCO, Pałace i ogrody, Morze i latarnie, Dinozaury i rodzinne przygody;
  - 30 szlaków (m.in. Szlak Orlich Gniazd, Łysa Góra — sabat czarownic, Duchy i diabeł Boruta, Wrzesień 1939, Szlak Kopernikowski, Szlak Piastowski, Szlak Zabytków Techniki);
  - każdy szlak: wstęp PL/EN, przystanki z notatkami, dystans i czas (szacunek), „Zapisz jako podróż”, „Utwórz plan dnia”, trasa w Google Maps, głęboki link `atlas.html?tab=explore&route=<id>`.
- **Rozszerzona historia miejsc** (≥10 zdań PL i EN, `data/historia/<region>.json`, wczytywane dynamicznie w szczegółach miejsca, czytane też przez lektora): 30 miejsc — całe Małopolskie i Śląskie. Legendy oznaczone jako legendy, status „redakcyjne”.
- **6 nowych zamków Szlaku Orlich Gniazd** z pozycjami z OSM: Pieskowa Skała, Rabsztyn, Olsztyn k. Częstochowy, Mirów, Bobolice, Smoleń (213 miejsc regionalnych). Wikipedia PL z tagów OSM; Bobolice bez potwierdzonego artykułu (wyszukiwanie).
- W szczegółach miejsca regionu: „Na szlakach tematycznych” z linkami do szlaków.
- **Propozycja bazy danych** dla setek obiektów, zdjęć i restauracji: `BAZA_DANYCH.md` (etap 1 static-first w repozytorium, etap 2 PostgreSQL/PostGIS w Supabase z nocnym eksportem — decyzja właściciela).
- `sync_database.py` waliduje historie (≥10 zdań) i szlaki; testy przeglądarkowe +7 kontroli; cache `i-was-here-v8-6-0-20261108`.

## 8.5.3 — 2026-11-07 — PR #16 (scalone 62cc8af, zawiera #15) — 2026-11-07 — gałąź `claude/fab-inline-stamps` (zawiera dokumentację przekazania)
- **Mapka Polski w jednej linii z logo:** środkowy element nagłówka (logo · mapka · przyciski), już nie opuszczona pod
  nagłówkiem. Zawsze widoczna, zawsze prowadzi do pełnej mapy Polski. Na ekranach ≤370 px napis logo ukryty (zostaje pinezka).
- **„✣ Zdobądź pieczątkę” w szczegółach atrakcji** (regiony jak w Warszawie, pomarańczowy przycisk) zamiast „Notatki i zdjęcia”;
  „📝 Notatki i zdjęcia” pojawia się dopiero po zdobyciu pieczątki, także jako 📝 przy zdobytych pieczątkach w Pieczątkach.
- Cache `i-was-here-v8-5-3-20261107`; testy dostosowane.

## Dokumentacja przekazania — 2026-11-07 — PR #15 (scalone w 62cc8af)
- Pełna aktualizacja `CLAUDE.md`, `PROJECT_STATUS.md`, `ROADMAP.md`, `CHANGELOG.md` oraz nowy rejestr ustaleń
  `DECYZJE_PROJEKTOWE.md` (interfejs, mapa, kolorystyka, logo, nawigacja, PL/EN, plany) — przed wyczyszczeniem
  kontekstu sesji. Bez zmian w kodzie aplikacji.

## 8.5 — 2026-11-07 — PR #14 (gałąź `claude/stamps`, scalone 76d6aae)
- **Znaczki pocztowe na mapie** (wybrany styl 5): 14 miast jako ząbkowane znaczki z jednobarwnym rytowanym rysunkiem
  i nazwą miasta; odwiedzone miasto ma stempel „✓”. Widoczne na mapie (także po wejściu w województwo), w karcie miasta,
  w nagłówku przewodnika regionu i w Pieczątkach.
- **„Paszport” → „Pieczątki”** w menu, oknach i opisach (PL/EN: Pieczątki/Stamps). Nowe Pieczątki: klikalne liczniki
  (miasta, miejsca w regionach, Warszawa, dziennik) przewijają do listy; 14 znaczków miast z przyciskiem „Byłem tu”
  (odblokuj/odznacz); wyszukiwarka miejsc w regionach i atrakcji Warszawy z „Byłem tu”; dziennik ze zdjęciami.
- **Punkt na mapie regionu → plan:** w szczegółach miejsca przyciski „🗓️ Do planu dnia” i „🧳 Do podróży” (plany Atlasu).
- **Podróż → plan dnia:** w Planach przycisk „🗓️ Dodaj do planu dnia” tworzy plan dnia z pozycji podróży.
- **Logo i mapka (jak wcześniej):** w lewym górnym rogu logo = pinezka z pejzażem po lewej stronie napisu „PLACES & MEMORIES /
  I WAS HERE”. Zielona **mapka Polski** to osobny, pływający przycisk na środku u góry (tuż pod nagłówkiem): zawsze
  widoczna — przy przewijaniu, nad zakładkami i oknami — i zawsze prowadzi do pełnej mapy Polski (w Atlasie bez
  przeładowania). Samo logo nie jest już linkiem (bez dwóch przycisków do tego samego).
- **Porządki (duplikaty i nieużywane elementy):** usunięty dawny przycisk „Polska” w rogu mapy (zastępuje go pływająca mapka u góry); z Profilu usunięte
  wybór języka i stylu mapy (są w nagłówku i w panelu Warstwy); „Odkrywaj” w Atlasie otwiera wyszukiwarkę zamiast
  dublować listę miast i województw z paska; usunięte nieużywane pliki `brand-atlas.svg`, `brand-mark-flag.svg`,
  `brand-pin.svg`, `logo-en.svg`. Dane użytkownika bez zmian. Cache `i-was-here-v8-5-2-20261107`.

## 8.4 — 2026-11-07 — PR #13 (gałąź `claude/brand-nav-passport`, scalone ed7fc79)
- **Nowe logo (wariant właściciela):** zielony kafelek ze złotą ramką, Polska z pejzażem, białą trasą i pomarańczową pinezką —
  wektorowy `assets/brand-mark.svg` z `tools/build_logo.py` (kontur Natural Earth). Ten sam znak jako ikona PWA (`icon.svg`,
  `icon-180.png`, `icon-512.png`). Pinezka z pejzażem `assets/brand-pin-landscape.svg` = godło Paszportu odkrywcy.
  Poprzednie logo zachowane jako `assets/brand-mark-flag.svg`.
- **Logo zawsze widoczne** w lewym górnym rogu każdej strony; kliknięcie pokazuje **całą mapę Polski** (w Atlasie bez
  przeładowania: zamyka kartę i zakładki; z regionu i Warszawy — Atlas z całym krajem).
- **Jedno dolne menu wszędzie** (`assets/app-nav.js` + `.css`): Mapa · Odkrywaj · Plany · Paszport · Profil — te same ikony,
  kolejność i podpisy PL/EN w Atlasie, przewodnikach regionów i Warszawie. Atlas: nowa zakładka „Odkrywaj” (miasta i województwa),
  „Plany” łączą plany podróży i plany dnia (przełącznik), `atlas.html?tab=profile|passport|plans|explore`.
  Region/Warszawa: Mapa → Atlas (to samo województwo), Odkrywaj → wybór atrakcji, Plany → plan dnia, Paszport → okno paszportu,
  Profil → profil w Atlasie. W Warszawie „Jedzenie” przeniesione do nagłówka (w miejsce przycisku Paszportu).
- **Paszport odkrywcy** bardziej widoczny: wspólne okno (pieczątki Warszawy, regionów, odwiedzone miasta, dziennik ze zdjęciami),
  karta paszportu na górze Profilu, zakładka „Paszport” w Atlasie; w szczegółach atrakcji przycisk „📔 Paszport: notatki i zdjęcia”.
- **Malowane motywy miast** (`assets/atlas-illustrated.js`): 14 osobnych, stylizowanych akwarelowo ilustracji (Pałac Kultury, Wawel,
  Żuraw, ratusze, Spodek, pałace i zamki) — bez filtrów SVG (płynny zoom). Widoczne na mapie, w karcie miasta i w nagłówku
  przewodnika regionu (Lubuskie i Opolskie bez motywu — brak miasta Atlasu).
- Cache `i-was-here-v8-4-20261107`; testy statyczne i przeglądarkowe dla menu, logo, paszportu.

## 8.3.1 — 2026-11-07 — PR #12 (gałąź `claude/new-logo`, scalone b56976b)
- **Nowe logo właściciela** w lewym górnym rogu Atlasu, Warszawy i przewodników regionów: Polska w barwach biało-czerwonych
  z pinezką z górskim pejzażem — **wektorowy** `assets/brand-mark.svg` (≈10 KB) budowany przez `tools/build_logo.py`
  na podstawie logo właściciela: kontur Polski z Natural Earth (ten sam co w Atlasie), bez białej poświaty wokół konturu.
  Napis „PLACES & MEMORIES / I WAS HERE” zostaje tekstem HTML (ostry na iPhonie); w Atlasie ułożony jak w logo.
  Poprzedni znak `assets/brand-atlas.svg` zostaje w repozytorium (nieużywany). Ikony PWA bez zmian.
- Cache `i-was-here-v8-3-1-20261107`.

## 8.3 — 2026-11-07 — PR #11 (gałąź `claude/guide-wiki-passport`, scalone 4688a13; zawiera PR #10)
- **Jedno logo z mapą:** nowy znak `assets/brand-atlas.svg` — pinezka I Was Here wbita w sylwetkę Polski (w miejscu
  Warszawy) jako jeden symbol w lewym górnym rogu Atlasu, Warszawy i przewodników regionów; osobna ikonka mapy usunięta.
  Logo nadal zawsze wraca do Atlasu w tym samym języku.
- **„Więcej informacji o miejscu — Wikipedia”** przy opisie każdej atrakcji (regiony i Warszawa), PL i EN.
  Artykuł tylko wtedy, gdy potwierdzony: tag `wikidata` obiektu w OpenStreetMap + tytuły z Wikidata
  (`tools/wiki_links.py`, pole `wiki` w danych). W pozostałych przypadkach uczciwy link „szukaj w Wikipedii”.
  Wynik: 110/207 miejsc regionalnych i 69/184 atrakcji Warszawy z potwierdzonym artykułem; 9 niedokładnych dopasowań
  (np. „Stare Miasto” → ratusz) odrzuconych ręcznie. Współrzędne bez zmian.
- **Kolejność:** wybór rodzajów atrakcji (ikonki kategorii) jest teraz *przed* mapą — w przewodniku regionu
  („Co pokazać na mapie?”) i w Warszawie („Co Cię interesuje?”).
- **Wycieczka piesza:** tryb „Pieszo” w planie dnia przewodnika regionu (domyślny, gdy wchodzimy z miasta/miejscowości;
  tempo 4,5 km/h, miejsca do ~6 km, Google Maps pieszo) i w „Moim planie dnia” w Atlasie. Warszawa — bez zmian (tryb był).
- **Dziennik podróży w paszporcie:** notatki i do 5 zdjęć z każdego miejsca, także wcześniej zrobionych
  (wybór z biblioteki zdjęć iPhone'a). Zdjęcia zmniejszane na urządzeniu (JPEG ≤1600 px), zapis wyłącznie lokalnie w IndexedDB
  `iwh_journal` — nic nie jest wysyłane. Dostęp: szczegóły atrakcji (region, Warszawa), paszport Warszawy (📝 przy pieczątce),
  Atlas → Wspomnienia (lista wpisów z miniaturą). Moduł `assets/place-extras.js` + `.css`.
- i18n Warszawy pomija elementy `data-i18n-skip` (dwujęzyczne bloki renderowane przez moduł).
- Testy: statyczne (`test_atlas.py`, walidacja `wiki` w `sync_database.py`) i przeglądarkowe (filtry przed mapą, tryb pieszy,
  Wikipedia PL/EN, dziennik z limitem 5 zdjęć i zapisem w IndexedDB, Wspomnienia). Cache `i-was-here-v8-3-20261107`.

## Dokumentacja długoterminowa — 2026-11-07 — PR #10 (gałąź `claude/project-docs`, scalone razem z #11)
- Dodano `PROJECT_STATUS.md`, `ROADMAP.md`, `CHANGELOG.md`; rozszerzono `CLAUDE.md`
  o procedurę startu sesji, indeks dokumentów, komendy, środowisko i potoki danych.
- Bez zmian w kodzie aplikacji.

## 8.2 — 2026-11-07 — PR #9 (zawiera #8)
- **Kielce** jako 14. miasto Atlasu (pin, karta miasta, skrót w manifeście „Świętokrzyskie”).
- Przewodnik świętokrzyski: 14 miejsc w Kielcach (łącznie 207 miejsc regionalnych).
- **Weryfikacja współrzędnych w OpenStreetMap** (`tools/verify_coordinates.py`, Nominatim):
  166 z 207 miejsc ma `coordinateStatus: "osm"` + identyfikator OSM; reszta pozostaje
  `orientacyjne`. Dopasowanie po rdzeniu nazwy, to samo województwo, ≤12 km, lista KEEP
  (obiekty powierzchniowe — punkt nie jest przesuwany do centroidu), OVERRIDES nazw OSM.
- Atrybucja © OpenStreetMap contributors (ODbL) w przewodniku regionu.
- Naprawiono zdublowane identyfikatory (`la-zamek`→`lc-zamek`, `go-zamek`→`gl-zamek`).
- Cache `i-was-here-v8-2-20261107`.

## 8.0 / 8.1 — 2026-11-07 — PR #7
- Przewodniki **wszystkich 16 województw** (`data/regiony.json`, 198 miejsc w 8.0/8.1).
- Każde z miast Atlasu otwiera swoje atrakcje w przewodniku województwa
  (`region.html?region=…&town=…`); tylko Warszawa ma pełny przewodnik miejski.
- Szczegóły: `REGIONY_8_0.md`.

## 7.0 — 2026-11-07 — PR #6 (zawiera #5)
- Nowy domyślny styl **„Atlas”** (premium kartograficzny): granatowy Bałtyk, oliwkowy ląd,
  prawdziwy relief (Terrain Tiles → `assets/poland-relief.webp`), bursztynowe piny.
- Dawny jasny atlas ilustrowany pozostaje jako styl **„Jasny/Light”**; dodatkowo Noc i Teren.
- Geografia generowana skryptem `tools/build_geography.py` z Natural Earth 1:10m.
- Warstwy (granice, nazwy, relief, miejscowości, ilustracje) zapisywane w `iwh_layers`.
- Dolne zakładki: Mapa, Plan podróży, Mój plan dnia, Wspomnienia, Profil
  (`assets/atlas-plans.js`; `iwh_trips`, `iwh_days`, `iwh_visited`).
- Stałe piny niezależne od zoomu, kolizje etykiet, przycisk „Polska/Poland” z animacją powrotu.
- Test przeglądarkowy `tools/test_browser.js` (Playwright) dołączony do CI.
- Szczegóły: `ATLAS_7_0.md`.

## 6.0 — 2026-11-07 — PR #6 (część #5)
- Województwa: wybór przybliża, obrysowuje i pokazuje miejscowości z miejscami.
- Pierwszy przewodnik regionu (`region.html`, `assets/region.js`, `assets/region.css`) i baza
  świętokrzyska; Mazowieckie z Sierpcem (Muzeum Wsi Mazowieckiej). Szczegóły: `REGIONY_6_0.md`.

## 5.2 / 5.3 — 2026-11-07 — PR #4 (zawiera #3)
- 5.3 — poprawki z raportu technicznego: offline uruchamiany z Atlasu, uczciwe EN
  („English description not available yet” zamiast mieszanki PL), pinch-zoom, widoczny fokus.
- 5.2 — Warszawa: logo z mapą Polski w lewym górnym rogu jako stały powrót do Atlasu,
  nagłówek zawsze widoczny (zastąpił pływającą ikonę mapy).

## 5.1 / 5.1b — 2026-11-07 — PR #2 (zawiera #1)
- Jeden przełącznik języka **PL | EN** (usunięto zdublowane przyciski języka w Warszawie).
- Podpisane ikony, logo jako powrót do Atlasu, bez zdublowanej mini-mapy Polski.

## 5.0 — 2026-11-07 — commity na `main` (ChatGPT / właściciel)
- Nowa marka **I Was Here — Places & Memories** (dawniej „Tu Byłem — Miejsca i Wspomnienia”),
  logo-znacznik, ikony PWA generowane `tools/render_icons.py` + workflow `sync-icons.yml`.
- Ilustracyjny jasny Atlas (koncepcja nr 1), 16 województw i rzeki z Natural Earth,
  13 dokładnie umieszczonych miast. Instrukcje współpracy AI w `CLAUDE.md`.
- Szczegóły: `ATLAS_5_0.md`.

## 4.0 — 2026-11-06 — commity na `main`
- Wektorowy **Atlas Polski 13 miast**: style, zoom, PL/EN, układ dla iPhone'a.
- Nawigacja Warszawa ⇄ Polska, pływająca mini-mapa, PWA otwiera Atlas (skróty Warszawa/Polska).
- Pełne PL/EN w przewodniku Warszawy (`assets/i18n4.js`), synteza mowy w wybranym języku.
- Testy regresji `tools/test_atlas.py`. Szczegóły: `ATLAS_4_0.md`.

## 3.x — 2026-11-06
- Rebranding „Tu Byłem — Miejsca i Wspomnienia”, ekran Polski i pełnoekranowy eksplorator.
- Biblioteka zapisanych tras i eksport do Kalendarza Apple (.ics) (`assets/poland-explorer.js`).
- README 3.0: ograniczenia Google/WTP/AI; model danych Warszawy (`INTEGRACJE_3_0.md`):
  184 atrakcje, 18 dzielnic, 36 lokali, ocena redakcyjna 1–5 (nie Google).

## Wcześniej
- „Odkryj Warszawę” — pierwotny przewodnik po Warszawie i wizja produktu (`PLAN_ROZWOJU.md`, historyczne).

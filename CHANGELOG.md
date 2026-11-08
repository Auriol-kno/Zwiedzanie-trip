# CHANGELOG — I Was Here / Places & Memories

Historia zmian odtworzona z `git log` gałęzi `main` i Pull Requestów #1–#9.
Najnowsze na górze. Daty w formacie RRRR-MM-DD. Numery wersji są zgodne z plikami
dokumentacji (`ATLAS_*.md`, `REGIONY_*.md`) i kluczem cache w `service-worker.js`.

Zasada: każda zmiana scalana do `main` dopisuje tu wpis (wersja, data, PR, co się zmieniło,
znane ograniczenia). Aktualny klucz cache PWA: `i-was-here-v8-6-0-20261108`.

---

## [Nieopublikowane] 8.6 — 2026-11-08 — gałąź `claude/odkrywaj-szlaki`
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

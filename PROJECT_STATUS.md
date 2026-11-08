# PROJECT_STATUS — I Was Here / Places & Memories

**Stan na:** 2026-11-08 · **Wersja:** 8.6.1 (gałąź) / 8.6 (`main`) · **`main`:** `71aeaed` („Scal #17: 8.6 — Odkrywaj ze szlakami tematycznymi, historie miejsc ≥10 zdań, propozycja bazy danych”)
**Cache PWA:** `i-was-here-v8-6-1-20261108` (na gałęzi 8.6.1) · **Publikacja:** https://auriol-kno.github.io/Zwiedzanie-trip/atlas.html (wdrożenie 8.5 potwierdzone w GitHub Actions)

> Ten plik opisuje **bieżący** stan projektu. Aktualizuj go w każdym PR, który zmienia funkcje, dane, znane błędy albo następne zadanie.
> - Ustalenia właściciela (logo, kolory, nawigacja, PL/EN) są w `DECYZJE_PROJEKTOWE.md`.
> - Historia zmian jest w `CHANGELOG.md`, a plan w `ROADMAP.md`.

---

## 0. Repozytorium, gałęzie i Pull Requesty (stan 2026-11-07)
- **Otwarte PR:** 8.6.1 — historie ≥10 zdań dla Pomorskiego i Dolnośląskiego (gałąź `claude/historie-pomorze-dolny-slask`). Czeka na „Scal”.
- **Scalone do `main`:**
  - #1–#4: UX 5.1b–5.3;
  - #5–#6: Atlas 6.0/7.0;
  - #7: 16 przewodników regionów;
  - #8–#9: OSM i Kielce, 8.2;
  - #10–#11: dokumentacja i 8.3;
  - #12: 8.3.1;
  - #13: 8.4;
  - #14: 8.5;
  - #15–#16: dokumentacja przekazania i 8.5.3;
  - #17: 8.6 (Odkrywaj, historie, propozycja bazy danych).
- **Gałęzie zdalne:** wszystkie `claude/*` są w pełni scalone, z jednym wyjątkiem: `claude/i-was-here-analysis-augprr` ma 3 niescalone commity, w tym `RAPORT_TECHNICZNY_CLAUDE_2026-11-07.md`. To pierwszy raport techniczny; jego zalecenia wdrożono w PR #2–#4. Gałęzi nie usuwamy.
- Workflow `sync-icons.yml` może sam dopisać commit z ikonami PNG na `main` po zmianie `icon.svg`. To znany wyjątek od zasady PR.

## 1. Działające funkcje (zweryfikowane testami 2026-11-07, emulacja iPhone 13 w Chromium)

### Wspólne dla wszystkich stron
- **Logo:**
  - pinezka z pejzażem po lewej stronie napisu „PLACES & MEMORIES / I WAS HERE” (logo nie jest linkiem);
  - **mapka Polski** (`#atlasFloat.poland-fab`) w jednej linii z logo, między logo a przyciskami; zawsze widoczna, zawsze prowadzi do pełnej mapy Polski. Na ekranach ≤370 px zostaje sama pinezka bez napisu.
- **Jedno dolne menu** (`assets/app-nav.js`): Mapa · Odkrywaj · Plany · Pieczątki · Profil (PL/EN).
- **Pieczątki** (`IWH_EXTRAS.passport`):
  - klikalne liczniki;
  - 14 znaczków miast z „Byłem tu” (odblokuj i odznacz);
  - wyszukiwarka miejsc w regionach i atrakcji Warszawy z „Byłem tu”;
  - dziennik podróży (notatki + do 5 zdjęć z biblioteki, IndexedDB `iwh_journal`, tylko lokalnie).
- **„Więcej informacji o miejscu — Wikipedia”** przy każdej atrakcji: potwierdzony artykuł albo uczciwe wyszukiwanie, PL/EN.
- **PL/EN:** przełącznik w nagłówku, wspólny klucz `tubylem_lang`, przekazywany parametrem `?lang=`.
- **PWA:**
  - manifest z `start_url ./atlas.html`;
  - ikona = zielony kafelek;
  - safe-area dla iPhone'a;
  - service worker network-first z cache plików aplikacji (`ignoreSearch` dla nawigacji).

### Atlas Polski — `atlas.html` (ekran startowy)
- Mapa SVG 900×680 w rzucie równoodległościowym (52°), oparta na Natural Earth 1:10m i reliefie Terrain Tiles.
- 4 style: Atlas (domyślny), Jasny, Noc i Teren. Styl wybiera się w panelu Warstwy (`tubylem_map_style`, `iwh_layers`).
- 14 miast i 16 województw: wybór przybliża, obrysowuje i pokazuje miejscowości. Działa wyszukiwarka, zoom, pinch-zoom i przesuwanie.
- **Znaczki pocztowe miast** na mapie (także po wejściu w województwo) i w karcie miasta. Odwiedzone miasto ma stempel „✓”.
- Karta miejsca ma akcje: przewodnik, „Podróż”, „Plan dnia” i „Byłem tu”.
- Zakładki:
  - **Odkrywaj** (8.6): 14 ilustrowanych motywów i 30 szlaków tematycznych (`data/szlaki.json`) z zapisem jako podróż / plan dnia; wyszukiwarka miast jest pod ⌕ w nagłówku;
  - **Plany** pokazują podróże i plany dnia z przełącznikiem; z podróży można zrobić plan dnia; plan dnia ma tryb pieszo/samochód;
  - **Pieczątki**;
  - **Profil**: karta Pieczątek, statystyki, dane i licencje.
- Adres `atlas.html?tab=explore|plans|passport|profile` otwiera wskazaną zakładkę, a `?region=<id>` otwiera województwo.

### Przewodniki regionów — `region.html?region=…&town=…`
- 16 województw i 213 miejsc (8.6: +6 zamków Szlaku Orlich Gniazd). Mazowieckie jest częściowe: Warszawa ma własny przewodnik, a w regionie jest 8 miejsc.
- W nagłówku jest znaczek głównego miasta województwa. Lubuskie i Opolskie go nie mają.
- Kolejność sekcji: „Co pokazać na mapie?” (miejscowości i kategorie) → mapa Leaflet → plan dnia → lista.
- Plan dnia ma tryby Pieszo (domyślny przy wejściu z miejscowości), Samochód i Komunikacja.
- Szczegóły miejsca zawierają:
  - opis, **„📜 Historia miejsca”** (≥10 zdań: Małopolskie, Śląskie, Pomorskie, Dolnośląskie) i link do Wikipedii;
  - „Na szlakach tematycznych” (linki do szlaków z Odkrywaj);
  - ♡ (zapisz);
  - „Byłem tu”;
  - „🗓️ Do planu dnia” i „🧳 Do podróży”;
  - nawigację, stronę obiektu i lektora;
  - główny przycisk „✣ Zdobądź pieczątkę”; „📝 Notatki i zdjęcia” pojawia się po zdobyciu pieczątki.
- 172 z 213 pozycji jest zweryfikowanych w OSM, a 115 ma potwierdzony artykuł Wikipedii (5 nowych zamków: tylko PL z tagu OSM).

### Przewodnik Warszawy — `index.html`
- 184 atrakcje w 18 dzielnicach i 36 lokali gastronomicznych.
- Planer trasy (pieszo, komunikacją, rowerem, samochodem); wybór rodzajów atrakcji stoi przed mapą.
- Ocena redakcyjna 1–5 (to nie jest ocena Google), ulubione i pieczątki Warszawy.
- Lektor (synteza mowy) i GPS za zgodą użytkownika; eksport .ics.
- W nagłówku są „Wygląd” i „Jedzenie”. Wikipedia ma potwierdzone artykuły dla 69 ze 184 atrakcji.

### Jakość i CI
- Testy:
  - `tools/test_bundle.py` i `tools/test_atlas.py` (statyczne);
  - `tools/test_browser.js` (Playwright, 67 kontroli: PL/EN bez polskich resztek, menu, Pieczątki, dziennik z 5 zdjęciami, plany, logo i mapka, Wikipedia);
  - `node --check`;
  - `tools/sync_database.py` (walidacja danych i pola `wiki`).
- CI (`.github/workflows/validate.yml`) uruchamia całość przy każdym push i PR na `main`.

## 2. Funkcje niedokończone / częściowe
- Pełny przewodnik miejski ma **tylko Warszawa**. Pozostałe 13 miast ma atrakcje w przewodnikach regionów.
- **Opisy EN Warszawy:** ok. 158 atrakcji ma uczciwy komunikat zamiast tłumaczenia.
- **Wikipedia:** 97 miejsc regionalnych i 115 atrakcji Warszawy ma tylko link do wyszukiwania.
- **Rozszerzona historia (≥10 zdań):** 55 z 213 miejsc regionalnych (Małopolskie, Śląskie, Pomorskie, Dolnośląskie); następne Świętokrzyskie (40 miejsc), potem pozostałe i Warszawa (`BAZA_DANYCH.md` §5).
- **Wikipedia EN** dla 5 nowych zamków do uzupełnienia, gdy Wikidata przestanie zwracać 429 (`tools/wiki_links.py`).
- **Współrzędne:** 41 z 213 miejsc regionalnych i ok. 158 atrakcji Warszawy jest orientacyjnych.
- **Brak kopii zapasowej** danych użytkownika. Wyczyszczenie danych Safari usuwa plany, pieczątki i dziennik.
- **Pieczątki poza „swoją” stroną:**
  - na stronie Warszawy lista pieczątek regionów odsyła do Atlasu, bo nie ładujemy tam `regiony.js`;
  - poza Warszawą lista atrakcji Warszawy odsyła do jej przewodnika.
- Plany dnia Atlasu nie przyjmują atrakcji Warszawy, bo Warszawa ma własny planer.
- Trasy to szacunki i linki do Google Maps. Nie ma routingu WTP na żywo ani ocen Google.

## 3. Znane błędy i ryzyka
| # | Problem | Gdzie | Waga |
|---|---------|-------|------|
| 1 | Leaflet (CDN unpkg) i kafelki OSM nie są w cache: mapa regionu offline jest pusta, ale lista i plan działają | `region.html`, `service-worker.js` | średnia |
| 2 | Na ekranach ≤370 px napis logo jest ukryty (zostaje pinezka), żeby mapka zmieściła się w linii | `app-nav.css` | niska |
| 3 | Przy otwartej karcie miejsca paski miast i województw są ukryte (świadomy kompromis wysokości) | `atlas.js`/CSS | niska |
| 4 | i18n Warszawy (`i18n4.js`) to słownik zdań: każdy nowy tekst w `index.html` trzeba dopisać | `assets/i18n4.js` | średnia |
| 5 | Plik `assets/poland-explorer.js` ma mylącą nazwę; zostały w nim tylko biblioteka tras i eksport .ics | Warszawa | niska |
| 6 | Workflow `sync-icons.yml` pushuje bezpośrednio na `main` | CI | niska |
| 7 | **Brak testu na fizycznym iPhonie/Safari** (wybór zdjęć z biblioteki, PWA, safe-area) | — | średnia |
| 8 | `data/SCHEMA.md` i `PLAN_ROZWOJU.md` są historyczne i nieaktualne | docs | niska |
| 9 | `*.github.io` i `*.wikipedia.org` są niedostępne z sandboxa Claude; wdrożenie sprawdza się w GitHub Actions | środowisko | info |

### Rozwiązane problemy (dla kontekstu)
- **Warszawa EN otwierała się po polsku** (`#atlasFloat` za skryptem i18n): przeniesiono element i dodano sprawdzanie `null` (5.3).
- **Offline z Atlasu:** `ignoreSearch`, fallback tylko dla nawigacji, rejestracja SW w Atlasie (5.3).
- **Zdublowane przełączniki języka i mapy:** jeden przełącznik PL | EN (5.1b).
- **Błędne dopasowania Nominatim:** dopasowanie po rdzeniu nazwy, listy KEEP i OVERRIDES, ponawianie przy 429 (8.1/8.2).
- **Biała obwódka wokół logo z JPG:** zastąpiona wektorem z `tools/build_logo.py` (8.3.1).
- **Mapka nie pływała w Warszawie:** nagłówek z `backdrop-filter` tworzy własny kontekst dla `position:fixed`, więc mapkę przeniesiono poza nagłówek (8.5).
- **Wyższy nagłówek Atlasu zmniejszał przybliżenie województwa:** pinezka w Atlasie dostała wysokość kafelka (8.5).
- **Polski komunikat (toast) zostawał po przełączeniu na EN:** czyszczenie przy zmianie języka (8.5).

## 4. Ostatnio wykonane prace
- **8.6.1 (gałąź `claude/historie-pomorze-dolny-slask`):** historie ≥10 zdań dla Pomorskiego i Dolnośląskiego (25 miejsc).
- **8.6 (PR #17):** Odkrywaj ze szlakami tematycznymi i ilustracjami, historie ≥10 zdań (30 miejsc), 6 zamków Jury, propozycja bazy danych `BAZA_DANYCH.md`.
- **8.5.3 (PR #16, z #15):** mapka Polski w jednej linii z logo, „Zdobądź pieczątkę”, dokumentacja przekazania.
- **8.5 (PR #14):**
  - znaczki pocztowe miast na mapie;
  - Pieczątki z „Byłem tu” i klikalnymi licznikami;
  - punkt z mapy regionu → plan; podróż → plan dnia;
  - logo: pinezka z lewej strony napisu i pływająca mapka Polski na środku u góry;
  - usunięte duplikaty (przycisk „Polska”, język i styl w Profilu, lista w „Odkrywaj”) oraz 4 nieużywane pliki SVG.
- **8.4 (PR #13):** kafelek-logo i ikona PWA, jedno dolne menu, Paszport (dziś Pieczątki), malowane motywy miast (w 8.5 zastąpione znaczkami).
- **8.3.1 (PR #12):** wektorowe biało-czerwone logo (później zastąpione).
- **8.3 (PR #11 + #10):** Wikipedia, filtry przed mapą, wycieczka piesza, dziennik podróży, dokumentacja długoterminowa.
- **Projekty wizualne do wyboru** (prywatne tablice w claude.ai):
  - 10 wersji logo: https://claude.ai/artifact/3vK2N3k66menpSRVZwnjkY
  - 5 stylów ilustracji miast (wybrany styl 5): https://claude.ai/artifact/61rgJrriroFaGWZBLLHWae

## 5. Zależności i środowisko
- **Aplikacja:** statyczne HTML/CSS/vanilla JS, bez kroku budowania. Publikacja przez GitHub Pages z `main` (root).
- **Zasoby zewnętrzne w działającej aplikacji:** Leaflet 1.9.4 z unpkg i kafelki OSM, tylko w `region.html`. Linki do Google Maps i Wikipedii. Brak kluczy API.
- **Narzędzia:**
  - Python 3.12+;
  - `build_geography.py`: numpy, Pillow, shapely;
  - `render_icons.py`: cairosvg;
  - Node 20+;
  - Playwright 1.63 + Chromium. W sandboxie Claude uruchamiaj z `NODE_PATH=$(npm root -g)`.
- **Sieć dla narzędzi** (allowlista środowiska Claude): `nominatim.openstreetmap.org` (tempo 2,5 s, ponawianie przy 429) oraz `www.wikidata.org` (przy 429 odczekać).
- **Uruchomienie lokalne:** `python3 -m http.server 8000`, potem http://localhost:8000/atlas.html.

## 6. Najbliższe zadanie
1. **Historie ≥10 zdań dla Świętokrzyskiego** (40 miejsc), potem **baza danych etap 1** (`BAZA_DANYCH.md` §4: lekki indeks + pliki województw) — oba zaakceptowane przez właściciela 2026-11-08.
2. **Ręczny test na iPhonie** (właściciel):
   - pływająca mapka i logo;
   - Pieczątki i „Byłem tu”;
   - dziennik ze zdjęciami z biblioteki;
   - nowa ikona: usuń skrót z ekranu początkowego i dodaj go ponownie.
3. **Kopia zapasowa danych** (ROADMAP A1): eksport/import planów, pieczątek i dziennika do pliku.
4. **Mapa regionu offline** (ROADMAP A2): Leaflet lokalnie w `assets/vendor/leaflet/` i komunikat PL/EN, gdy kafelków brak.

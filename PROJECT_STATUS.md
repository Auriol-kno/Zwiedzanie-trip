# PROJECT_STATUS — I Was Here / Places & Memories

## 8.10.0 — Mapa „Pergamin” (2026-11-13, PR czeka na „Scal”)
- Styl Atlas ma ciepłą mapę (krem, turkus, terakota, zielone lasy, pomarańczowe pinezki); szczegóły w CHANGELOG.md, decyzja w DECYZJE_PROJEKTOWE.md §3. Relief `poland-relief.webp` przekolorowany (przy ponownym generowaniu `build_geography.py` trzeba go przekolorować tak samo: niziny hue 43° s .26 v .99, góry hue 14° s .68 v .88).
- Styl Noc: nieczytelne napisy miast i ciemne „I WAS HERE” naprawione w 8.10.1.
- Do sprawdzenia przez właściciela: wygląd na prawdziwym iPhonie; styl Noc/Teren z jasnym reliefem.

## 8.9.1 — Główny akcent błękitny (2026-11-13)
- Różowy akcent z 8.9.0 zastąpiony błękitnym `#28A6F4` w całej aplikacji (CHANGELOG.md, DECYZJE_PROJEKTOWE.md §3). Ciemny tekst na błękitnych przyciskach dla kontrastu.
- Do sprawdzenia przez właściciela: wygląd na prawdziwym iPhonie; ciemny/leśny motyw Warszawy; PNG ikon (przerenderuje `sync-icons.yml`).

## 8.9.0 — Motyw „kulki na torze” (2026-11-13, PR czeka na „Scal”)
- Cała aplikacja ma nową kolorystykę (niebieski, różowy, żółty) wg makiety „kulki na torze”; szczegóły i lista zmienionych plików w CHANGELOG.md, decyzja w DECYZJE_PROJEKTOWE.md §3.
- Nowy `assets/theme-marbles.css` ładowany jako ostatni arkusz; relief `poland-relief.webp` przekolorowany (poza `tools/build_geography.py`: przy ponownym generowaniu relief trzeba przekolorować tak samo, odcień 208°).
- Do sprawdzenia przez właściciela: wygląd na prawdziwym iPhonie, ciemny/leśny motyw Warszawy (przyciski „Theme”), PNG ikon (workflow `sync-icons.yml` może dopisać nowe ikony po zmianie `icon.svg`), kolory arkuszy Excel (bez zmian).

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

**Stan na:** 2026-11-13 · **Wersja:** 8.10.0 (mapa „Pergamin”, motyw „kulki na torze”)
**Cache PWA:** `i-was-here-v8-10-0-20261113` · **Publikacja:** https://auriol-kno.github.io/Zwiedzanie-trip/atlas.html (wdrożenia #17–#22 sprawdzane w GitHub Actions)
**Autor aplikacji:** podpis „Made by Tomasz Kmiecik” (Profil Atlasu, stopki, `meta author`) — nie usuwać.

> Ten plik opisuje **bieżący** stan projektu. Aktualizuj go w każdym PR, który zmienia funkcje, dane, znane błędy albo następne zadanie.
> - Ustalenia właściciela (logo, kolory, nawigacja, PL/EN) są w `DECYZJE_PROJEKTOWE.md`.
> - Historia zmian jest w `CHANGELOG.md`, a plan w `ROADMAP.md`.

---

## Szybkie wznowienie pracy (nowa sesja)
1. `git fetch origin && git log origin/main -5` → oczekiwane merge „Scal #22” (8.7.0) lub nowsze; sprawdź otwarte PR.
2. Przeczytaj `CLAUDE.md` → ten plik → `DECYZJE_PROJEKTOWE.md` → `ROADMAP.md` → `CHANGELOG.md`.
3. Komunikacja po polsku; każda zmiana na gałęzi `claude/<temat>` + PR z polskim opisem; scalaj tylko po „Scal”, potem potwierdź „pages build and deployment” i „Sprawdź aplikację Warszawa”.
4. Testy: `python tools/sync_database.py` (bez diffu w `data/*.js`), `python tools/test_bundle.py && python tools/test_atlas.py`, `node --check`, `NODE_PATH=$(npm root -g) node tools/test_browser.js` (94/94).
5. Przy zmianie plików w cache podbij `KEY` w `service-worker.js` (dziś `v8-7-0`).
6. Najbliższe zadanie: §6 poniżej.

## 0. Repozytorium, gałęzie i Pull Requesty (stan 2026-11-08)
- **Otwarte PR:** brak.
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
  - #17: 8.6 (Odkrywaj, historie, propozycja bazy danych);
  - #18: 8.6.1–8.6.3 (historie wszystkich miejsc i atrakcji Warszawy, plany województw, indeks, podpis autora) — `b503643`;
  - #19: 8.6.4 (płynna mapa Atlasu) — `e00884e`;
  - #20: dokumentacja przekazania po 8.6.4;
  - #21: 8.6.5 (pinezki miast trzymają się mapy przy przybliżaniu; gałąź `claude/i-was-here-analysis-augprr` z raportem `RAPORT_TECHNICZNY_CLAUDE_2026-11-07.md`) — `9e028c5`;
  - #22: 8.7.0 (Moje dane — Excel, e-mail, kopia, import; mapa regionu offline; podział bazy; wydajność, porządki).
- **Gałęzie zdalne:** wszystkie `claude/*` są w pełni scalone (także `claude/i-was-here-analysis-augprr` z raportem technicznym, PR #21).
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
- Dane miejsc z lekkiego `data/regiony-lite.js` (8.7, bez opisów); pełne dane województwa pobiera dopiero przewodnik regionu (`data/regiony/<id>.json`).
- Widok całej Polski na telefonie zaczyna się pod przyciskami mapy (8.7); końcowe przerysowanie ok. 39 ms przy CPU ×4.
- **Płynny ruch (8.6.4):** w trakcie gestu/animacji `preview()` przesuwa kontener `.atlas-map` transformacją CSS (GPU), a `commit()`→`setTransform()` rysuje mapę raz po zakończeniu ruchu (po puszczeniu palca, po ~0,25 s pauzy palców albo przy bardzo dużej zmianie skali).
- 4 style: Atlas (domyślny), Jasny, Noc i Teren. Styl wybiera się w panelu Warstwy (`tubylem_map_style`, `iwh_layers`).
- 14 miast i 16 województw: wybór przybliża, obrysowuje i pokazuje miejscowości. Działa wyszukiwarka, zoom, pinch-zoom i przesuwanie.
- **Znaczki pocztowe miast** na mapie (także po wejściu w województwo) i w karcie miasta. Odwiedzone miasto ma stempel „✓”.
- Karta miejsca ma akcje: przewodnik, „Podróż”, „Plan dnia” i „Byłem tu”.
- Zakładki:
  - **Odkrywaj** (8.6): 15 ilustrowanych motywów (w tym „Plany województw” dla wszystkich 16 regionów) i 46 szlaków (`data/szlaki.json`) z zapisem jako podróż / plan dnia; wyszukiwarka miast jest pod ⌕ w nagłówku;
  - **Plany** pokazują podróże i plany dnia z przełącznikiem; z podróży można zrobić plan dnia; plan dnia ma tryb pieszo/samochód;
  - **Pieczątki**;
  - **Profil**: karta Pieczątek, statystyki, **Moje dane** (8.7: Excel z planami, pieczątkami, odznakami, dziennikiem i mapą; wysyłka e-mailem przez arkusz Udostępnij; pełna kopia `.json` ze zdjęciami; wczytanie `.xlsx`/`.json` ze scalaniem), dane i licencje.
- Adres `atlas.html?tab=explore|plans|passport|profile` otwiera wskazaną zakładkę, a `?region=<id>` otwiera województwo.

### Przewodniki regionów — `region.html?region=…&town=…`
- 16 województw i 213 miejsc (8.6: +6 zamków Szlaku Orlich Gniazd). Mazowieckie jest częściowe: Warszawa ma własny przewodnik, a w regionie jest 8 miejsc.
- W nagłówku jest znaczek głównego miasta województwa. Lubuskie i Opolskie go nie mają.
- Kolejność sekcji: „Co pokazać na mapie?” (miejscowości i kategorie) → mapa Leaflet → plan dnia → lista.
- Plan dnia ma tryby Pieszo (domyślny przy wejściu z miejscowości), Samochód i Komunikacja.
- Szczegóły miejsca zawierają:
  - opis, **„📜 Historia miejsca”** (≥10 zdań, wszystkie województwa) i link do Wikipedii;
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
- **„Historia miejsca”** (8.6.3): pełna historia ≥10 zdań PL/EN z `data/warszawa-historia/*.json`, wczytywana na żądanie; krótkie pole `story` zostaje jako zapas.
- Stopka: „Made by Tomasz Kmiecik”.

### Jakość i CI
- Testy:
  - `tools/test_bundle.py` i `tools/test_atlas.py` (statyczne);
  - `tools/test_browser.js` (Playwright, **94 kontrole**: Excel PL/EN, kopia JSON i import, pliki województw, Leaflet lokalny, komunikat offline; PL/EN bez polskich resztek, menu, Pieczątki, dziennik z 5 zdjęciami, plany, logo i mapka, Wikipedia, Odkrywaj i plany województw, historie regionów i Warszawy, podpis autora, płynny podgląd ruchu mapy);
  - `node --check`;
  - `tools/sync_database.py` (walidacja danych, pola `wiki`, historii ≥10 zdań dla 213 miejsc i 184 atrakcji, szlaków; generuje `data/*.js`, `data/regiony-lite.js`, `data/regiony/*.json`, `data/index/places.json`, `data/warszawa-historia/index.json`).
- CI (`.github/workflows/validate.yml`) uruchamia całość przy każdym push i PR na `main`.

## 2. Funkcje niedokończone / częściowe
- Pełny przewodnik miejski ma **tylko Warszawa**. Pozostałe 13 miast ma atrakcje w przewodnikach regionów.
- **Opisy EN Warszawy:** ok. 158 atrakcji ma uczciwy komunikat zamiast tłumaczenia.
- **Wikipedia:** 97 miejsc regionalnych i 115 atrakcji Warszawy ma tylko link do wyszukiwania.
- **Rozszerzona historia (≥10 zdań):** wszystkie 213 miejsc regionalnych i wszystkie 184 atrakcje Warszawy. Teksty mniej znanych parków Warszawy są ogólniejsze (historia dzielnicy) — warto je kiedyś uzupełnić o lokalne źródła.
- **Wikipedia EN** dla 5 nowych zamków do uzupełnienia, gdy Wikidata przestanie zwracać 429 (`tools/wiki_links.py`).
- **Współrzędne:** 41 z 213 miejsc regionalnych i ok. 158 atrakcji Warszawy jest orientacyjnych.
- **Kopia zapasowa jest ręczna** (8.7): Excel lub `.json` w Profilu. Bez pobranej kopii wyczyszczenie danych Safari nadal usuwa plany, pieczątki i dziennik. Aplikacja nie wysyła e-maili sama (brak serwera) — plik trafia do Poczty przez arkusz Udostępnij.
- **Excel — ograniczenia:** etykiety numerów na mapie pokazuje Excel 2013+ (LibreOffice i Numbers pokazują same punkty); zdjęcia dziennika są tylko w kopii `.json`; plik z Excela odczytujemy po nazwach arkuszy i kolejności kolumn.
- **Pieczątki poza „swoją” stroną** (rozwiązane w 8.6.1): listy korzystają z indeksu `data/index/places.json`; bez sieci przy pierwszym otwarciu zostaje link do drugiej strony.
- Atrakcje Warszawy można dodać do planów Atlasu przez Excel (8.7, `{t:'waw'}`); w samym Atlasie nie ma jeszcze przycisku „Do planu” dla atrakcji Warszawy.
- Trasy to szacunki i linki do Google Maps. Nie ma routingu WTP na żywo ani ocen Google.

## 3. Znane błędy i ryzyka
| # | Problem | Gdzie | Waga |
|---|---------|-------|------|
| 1 | Kafelki OSM nie są w cache: bez sieci mapa regionu ma tylko pinezki i komunikat (Leaflet jest lokalny od 8.7) | `region.html`, `index.html` | niska |
| 2 | Na ekranach ≤370 px napis logo jest ukryty (zostaje pinezka), żeby mapka zmieściła się w linii | `app-nav.css` | niska |
| 3 | Przy otwartej karcie miejsca paski miast i województw są ukryte (świadomy kompromis wysokości) | `atlas.js`/CSS | niska |
| 4 | i18n Warszawy (`i18n4.js`) to słownik zdań: każdy nowy tekst w `index.html` trzeba dopisać | `assets/i18n4.js` | średnia |
| 6 | Workflow `sync-icons.yml` pushuje bezpośrednio na `main` | CI | niska |
| 7 | **Brak testu na fizycznym iPhonie/Safari** (wybór zdjęć z biblioteki, PWA, safe-area) | — | średnia |
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
- **Przycinanie mapy Atlasu przy przesuwaniu i przybliżaniu** (8.6.4): pełne przerysowanie SVG w każdym `pointermove`, a `vector-effect: non-scaling-stroke` wymuszał przerysowanie granic przy każdej transformacji `<svg>`. Rozwiązanie: transformacja CSS na kontenerze `.atlas-map` w trakcie gestu + jeden rysunek na końcu (83 → 17 ms/klatkę przy CPU ×4).
- **Wikidata 429** (zbyt wiele zapytań przy `wiki_links.py`): dla 5 nowych zamków wzięto tytuły PL z tagów OSM `wikipedia`; EN do uzupełnienia później.
- **Licznik zdań** w walidacji historii pomija skróty (w., ok., św., m.in.…); brakujące 10. zdanie w tekstach Warszawy uzupełniono danymi z bazy (dzielnica, szacowany czas pobytu).
- **Pinezki miast odjeżdżały od mapy przy przybliżaniu** (8.6.5): skala pinezki liczona wokół środka grupy zamiast czubka (`transform-origin` w `.city-dot`); teraz `transform-origin: 0 0` w układzie viewBox, odchyłka 0 px.

## 4. Ostatnio wykonane prace
- **8.7.0 (PR #22):** Moje dane — Excel z mapą, kopia `.json`, import scalający, e-mail; Leaflet lokalnie i komunikat offline; lekki plik regionów dla Atlasu i pliki województw; widok Polski pod przyciskami; szybsze przerysowanie; porządki.
- **8.6.5 (PR #21, `9e028c5`):** pinezki miast trzymają się mapy przy przybliżaniu; test regresji w przeglądarce (83 kontrole).
- **8.6.4 (PR #19, `e00884e`):** płynne przesuwanie i przybliżanie mapy Atlasu (podgląd na GPU, jeden rysunek po geście).
- **8.6.3 (PR #18):** historie wszystkich 184 atrakcji Warszawy (PL/EN, ≥10 zdań).
- **8.6.2 (PR #18):** historie dla wszystkich województw (213/213), plany zwiedzania 16 województw, podpis „Made by Tomasz Kmiecik”.
- **8.6.1 (PR #18):** historie ≥10 zdań dla Pomorskiego, Dolnośląskiego i Świętokrzyskiego (65 miejsc); indeks bazy danych `data/index/places.json` używany przez Pieczątki.
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
1. **Ręczny test na iPhonie** (właściciel) po 8.7.0:
   - Profil → „Pobierz Excel”, otwarcie pliku w Excelu/Numbers na iPhonie (listy rozwijane, mapa);
   - „Wyślij Excel e-mailem” → Poczta z załącznikiem;
   - dopisanie planu w Excelu i „Wczytaj dane z pliku” (Scal / Zaktualizuj);
   - pełna kopia `.json` ze zdjęciami i odtworzenie na drugim urządzeniu;
   - przewodnik regionu w trybie samolotowym (komunikat o braku podkładu, lista i plan działają);
   - widok całej Polski na małym ekranie (Gdańsk, Olsztyn) i płynność mapy.
2. **Pieczątki i plany 2.0** (ROADMAP etap B): znaczki województw jako odznaki w aplikacji (dziś liczone w Excelu), data zdobycia pieczątki, przycisk „Do planu” dla atrakcji Warszawy.
3. **Baza danych:** Warszawa w formacie plików regionów (`BAZA_DANYCH.md` §4, 8.7 — reszta), potem zdjęcia z Wikimedia Commons (8.8).
4. **Jakość treści** (ROADMAP etap C): Wikipedia, opisy EN Warszawy, współrzędne.

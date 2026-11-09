# DECYZJE PROJEKTOWE — I Was Here / Places & Memories

Rejestr ustaleń właściciela (stan na 2026-11-08, wersja 8.6.4). To są **wiążące decyzje**. Nie zmieniaj ich bez wyraźnej prośby właściciela.
Jeśli nowe polecenie przeczy temu plikowi, wygrywa nowsze polecenie właściciela. Zaktualizuj wtedy ten plik w tym samym PR.

---

## 1. Zasady współpracy
- Komunikacja i opisy PR są **po polsku**. Interfejs aplikacji jest dwujęzyczny (PL/EN).
- Każda zmiana trafia na **osobną gałąź `claude/<temat>` i do Pull Requesta**. Scalanie do `main` następuje **wyłącznie po słowie „Scal”** od właściciela. Po scaleniu potwierdź wdrożenie w GitHub Actions („pages build and deployment”).
- **Nie usuwaj danych użytkowników** (plany, pieczątki, dziennik). Pliki i funkcje usuwaj tylko na wyraźną prośbę. W 8.5 właściciel poprosił o usunięcie duplikatów i nieużywanych plików.
- **Nie zmyślaj** ocen, historii, współrzędnych ani artykułów Wikipedii. Przybliżone dane oznaczaj uczciwie.
- **Prawdziwa geografia wygrywa z dekoracją.** Kontury pochodzą z Natural Earth, relief z Terrain Tiles, a pozycje miejsc z OSM, gdy są zweryfikowane.
- Przed każdym PR uruchom wszystkie testy. W raporcie zawsze napisz, że nie testowano na fizycznym iPhonie, jeśli tak było.
- Właściciel wybiera wygląd z **wariantów**: tablica 10 logo, tablica 5 stylów ilustracji. Przy dużych zmianach wizualnych najpierw zaproponuj warianty.

## 1a. Podpis autora (8.6.2)
- Aplikacja jest podpisana **„Made by Tomasz Kmiecik”** (prośba właściciela; w treści prośby „made in”, zapisane jako poprawne angielskie „made by”). Podpis jest w Profilu Atlasu, w stopkach przewodników regionów i Warszawy oraz w `<meta name="author">`. Nie usuwaj go.

## 2. Logo (stan 8.5 — ostateczny wybór właściciela)
- **Lewy górny róg każdej strony:** pinezka z pejzażem (`assets/brand-pin-landscape.svg`: słońce, ośnieżone góry, las, rzeka) **po lewej stronie** napisu „PLACES & MEMORIES / I WAS HERE”.
  - Napis jest tekstem HTML: małe kapitaliki u góry, pochylone szeryfowe „I WAS HERE” pod spodem.
  - Logo **nie jest linkiem**, żeby nie dublować przycisku mapy.
- **Mapka Polski** (`assets/brand-mark.svg`, zielony kafelek ze złotą ramką, Polska z pejzażem, białą kropkowaną trasą i pomarańczową pinezką):
  - stoi **w jednej linii z logo**, jako środkowy element nagłówka między logo a przyciskami (decyzja z 8.5.3: „nie może być opuszczona”);
  - nagłówek jest zawsze widoczny (przyklejony u góry, a w Atlasie stały), więc mapka też;
  - **zawsze prowadzi do pełnej mapy Polski**. W Atlasie mapa płynnie oddala się bez przeładowania;
  - element to `#atlasFloat.poland-fab` (48 px, w Atlasie 44 px);
  - na ekranach ≤370 px napis logo jest ukryty i zostaje sama pinezka, żeby mapka zmieściła się w linii;
  - **bez białej obwódki**, tylko cień. Właściciel odrzucił białe artefakty wokół logo.
- **Ikona PWA** (`icon.svg`, `icon-180.png`, `icon-512.png`) to ten sam zielony kafelek. Wszystkie znaki generuje `tools/build_logo.py`; nie edytuj ich ręcznie.
- Historia: 5.0 pinezka-ilustracja → 5.2 logo z miniaturą mapy → 8.3 pinezka w sylwetce Polski → 8.3.1 biało-czerwona Polska z pinezką (z JPG, potem wektor) → 8.4 kafelek → 8.5 pinezka + napis + pływająca mapka.

## 3. Kolorystyka i typografia
- Paleta Atlasu 7.0 na wszystkich ekranach:
  - granat Bałtyku: `#0B3446`, `#092D3E`, `#061F2C`;
  - bursztyn akcentów: `#F47C28`, `#FFB24A`;
  - oliwkowy ląd: `#68824B`, `#9EAF65`;
  - krem: `#FFF9E8`, `#F6F1E4`.
- Aktywne przyciski mają pomarańczowy gradient. Jasne przewodniki (Warszawa, regiony) stoją na kremowym tle z granatowymi kartami „hero”.
- Kolory logo-kafelka: zieleń `#3F8E73` → `#1B5243` i złota ramka `#F1D88E` → `#9E7A2E`.
- Napisy marki: szeryfowe, pochylone („I WAS HERE”, Georgia/Palatino). Interfejs: Inter / systemowy sans.

## 4. Mapa Polski (Atlas)
- Domyślny styl to **„Atlas”** (premium kartograficzny): granatowe morze, oliwkowy ląd z prawdziwym reliefem, kremowe granice województw grubsze przy zbliżeniu i bursztynowe pinezki. Pozostałe style: **Jasny/Light** (dawna koncepcja 1), **Noc**, **Teren**. Styl wybiera się w panelu **Warstwy**, nie w Profilu.
- 14 miast w poprawnych miejscach; Kielce dodane w 8.2. Pełny przewodnik ma **tylko Warszawa**. Pozostałe miasta mają atrakcje w przewodniku województwa i nigdy nie przedstawiaj ich jako pełnych przewodników.
- 16 województw: wybór przybliża, obrysowuje i pokazuje miejscowości z miejscami.
- **Ilustracje miast = znaczki pocztowe** (styl 5 wybrany z 5 propozycji): ząbkowany znaczek, jednobarwny rytowany rysunek z kreskowaniem, nazwa miasta, kolor tuszu przypisany do miasta.
  - Gdy użytkownik był w mieście, znaczek dostaje stempel „✓”.
  - Znaczki widać na mapie (także po wejściu w województwo), w karcie miasta, w nagłówku przewodnika regionu i w Pieczątkach.
  - Nie używaj filtrów SVG, żeby zoom na iPhonie był płynny.
- Dawny przycisk „Polska” w rogu mapy **usunięto w 8.5**: jego rolę przejęła pływająca mapka.
- Atrybucje muszą zostać: Natural Earth, Terrain Tiles (© Copernicus), © OpenStreetMap (ODbL).
- **Płynność mapy (8.6.4, prośba właściciela „przycina się ruch”):** w trakcie gestów mapa jest tylko przesuwana/skalowana na GPU (`preview()`), pełny rysunek raz po ruchu (`commit()`). Nie wracaj do `setTransform()` w każdym `pointermove`. Dopuszczalne: chwilowe rozmycie przy dużym przybliżeniu i mignięcie tła morza na krawędzi.

## 5. Nawigacja
- **Jedno dolne menu na każdej stronie** (`assets/app-nav.js`), zawsze w tej kolejności: **Mapa · Odkrywaj · Plany · Pieczątki · Profil** (EN: Map · Explore · Plans · Stamps · Profile).
  - **Mapa:** w Atlasie mapa; z regionu Atlas na tym samym województwie; z Warszawy Atlas.
  - **Odkrywaj:** w Atlasie **szlaki tematyczne** (decyzja z 8.6, patrz §10); wyszukiwarka miast zostaje pod ⌕ w nagłówku mapy. W przewodnikach przewija do wyboru atrakcji.
  - **Plany:** plany podróży i plany dnia z przełącznikiem. W przewodnikach przewija do planu dnia.
  - **Pieczątki:** okno lub zakładka Pieczątek (patrz §7).
  - **Profil:** karta Pieczątek, statystyki, dane i licencje. Język jest w nagłówku, a styl mapy w Warstwach, **nie** w Profilu.
- **Bez duplikatów** na jednym ekranie: ta sama funkcja nie może mieć dwóch przycisków. Tak zdecydowano w 8.5.
- W Warszawie przycisk „Jedzenie” jest w nagłówku obok „Wygląd”.
- Zawsze musi istnieć droga powrotu do pełnej mapy Polski, czyli pływająca mapka.

## 6. Język PL/EN
- Przełącznik **PL | EN** jest w nagłówku każdej strony. Wybór zapisuje się w `tubylem_lang` i przechodzi między Atlasem, regionami i Warszawą (`?lang=`).
- Zmieniając tekst, zawsze aktualizuj PL i EN razem. W wersji EN nie może zostać żaden polski fragment interfejsu poza nazwami własnymi (test w `tools/test_browser.js`).
- Warszawa tłumaczy przez `assets/i18n4.js` (słownik zdań). Elementy z `data-i18n-skip` są pomijane. Dwujęzyczne bloki modułów renderują oba języki naraz (`[data-l=pl|en]`).
- Bez maszynowych, zmyślonych opisów EN. Brakujące opisy mają uczciwy komunikat „English description not available yet”.

## 7. Pieczątki (dawny „Paszport odkrywcy”, nazwa zmieniona w 8.5)
- **Liczniki są klikalne**: miasta X/14, miejsca w regionach X/207, Warszawa X/184 i wpisy w dzienniku. Każdy przewija do swojej listy.
- 14 znaczków miast z przyciskiem **„Byłem tu”**, który odblokowuje pieczątkę i pozwala ją **odznaczyć**. Zablokowane znaczki są szare.
- Wyszukiwarka miejsc w regionach i atrakcji Warszawy, z „Byłem tu” przy każdym wyniku.
- **W szczegółach atrakcji** (Warszawa i regiony) główną akcją jest **„✣ Zdobądź pieczątkę”** (pomarańczowy przycisk), a po zdobyciu „✓ Pieczątka zdobyta”. Decyzja z 8.5.3: zamiast „Notatki i zdjęcia”.
- **Dziennik podróży:** notatki i **do 5 zdjęć** na miejsce, także z biblioteki zdjęć. Zapis jest **tylko lokalnie**, w IndexedDB `iwh_journal`; nic nie jest wysyłane.
  - Przycisk „📝 Notatki i zdjęcia” pojawia się **dopiero po zdobyciu pieczątki**: w szczegółach atrakcji oraz jako 📝 przy zdobytych pieczątkach na liście Pieczątek.
- Klucze zapisu: `iwh_visited` (`city:<id>`, `region:<id>`, `town:<region>:<nazwa>`), `iwh_region_visited` (id miejsc), `odkryjWarszawe_1.visited` (Warszawa).

## 8. Plany i zwiedzanie
- Plany podróży (`iwh_trips`) i plany dnia (`iwh_days`): pozycje `{t:'city'|'region'|'town'|'place', …}`; od 8.7 także `{t:'waw',id,name,lat,lon}` (atrakcja Warszawy, np. z Excela).
- **Podróż → plan dnia:** przycisk „🗓️ Dodaj do planu dnia” przy podróży.
- **Punkt z mapy regionu → plan:** „🗓️ Do planu dnia” i „🧳 Do podróży” w szczegółach miejsca.
- **Wycieczka piesza** jest w Warszawie, w przewodniku regionu (domyślna przy wejściu z miejscowości) i w planie dnia Atlasu.
- Wybór rodzajów atrakcji (ikonki kategorii) stoi **przed mapą** w regionie i w Warszawie.
- Czasy przejazdu to **szacunki**. Trasy prowadzą do Google Maps; nie ma routingu WTP na żywo.

## 9. Treści i dane
- Przy każdej atrakcji jest link „Więcej informacji o miejscu — Wikipedia”: potwierdzony artykuł (tag `wikidata` w OSM + Wikidata) albo uczciwe wyszukiwanie. Artykułów nie zgadujemy. Złe dopasowania są na liście `REJECT` w `tools/wiki_links.py`.
- Ocena 1–5 jest **redakcyjna**, a nie z Google. Nie ma kluczy API.

- **Historia miejsca** (decyzja z 8.6): min. **10 zdań** w PL i EN dla każdego miejsca, tylko utrwalone fakty, legendy oznaczone jako legendy. Pliki `data/historia/<region>.json`, wczytywane dynamicznie; walidacja w `sync_database.py`. Uzupełniamy partiami po województwach; kolejność zaakceptowana 2026-11-08: Pomorskie, Dolnośląskie, Świętokrzyskie, potem pozostałe.
- **Właściciel zaakceptował (2026-11-08):** motywy i ilustracje Odkrywaj oraz etap 1 bazy danych z `BAZA_DANYCH.md`.
- **Baza danych:** propozycja w `BAZA_DANYCH.md` — etap 1 (pliki w repozytorium dzielone i ładowane na żądanie) wdrażany od 8.6; etap 2 (PostgreSQL/PostGIS w Supabase z panelem i nocnym eksportem) wymaga zgody właściciela.

## 10. Odkrywaj — szlaki tematyczne (8.6)
- Właściciel poprosił o zwiedzanie z podziałem na motywy: historia, baśnie, legendy, II wojna światowa, nauka, Jura i Szlak Orlich Gniazd, czarownice i legendy — oraz o kolejne propozycje i ładne ilustracje.
- 14 motywów z wektorowymi kafelkami w stylu logo (kolor motywu, złota ramka, kremowy rysunek, bursztynowe akcenty; bez filtrów SVG). Dane w `data/szlaki.json`.
- **Plany województw** (8.6.2, prośba właściciela „plan i punkty dla wszystkich województw”): motyw na początku listy, jeden plan na każde z 16 województw z linkiem do przewodnika regionu.
- Szlak = wstęp PL/EN, przystanki (miejsca regionów lub miasto), notatki przy przystankach, dystans i czas jako szacunek, zapis jako podróż lub plan dnia.

## 10a. Moje dane — Excel, kopia, e-mail (8.7, prośba właściciela 2026-11-08)
- Właściciel poprosił o: wysłanie pliku na e-mail użytkownika, zapis danych **w Excelu** jako logicznego formularza, do którego można dopisywać dane, pobranie i **wczytanie danych z powrotem do profilu** (plany podróży, odznaki), **planowanie podróży przez edycję pliku Excel** oraz **mapę z zaznaczonymi planowanymi miejscami** w pliku.
- Realizacja: Profil Atlasu → „Moje dane”. Excel ma arkusze Start, Plany, Pieczątki, Odznaki, Dziennik, Mapa i Miejsca; listy rozwijane z katalogu miejsc, formuły uzupełniają resztę, mapa to wykres z prawdziwymi granicami (Natural Earth) w projekcji Atlasu.
- **E-mail:** aplikacja nie ma serwera, więc nie wysyła poczty sama. Na iPhonie plik idzie przez arkusz Udostępnij do Poczty (załącznik); na innych urządzeniach plik się pobiera i otwiera się `mailto:`. E-mail użytkownika jest opcjonalny i zostaje tylko na urządzeniu (`iwh_profile`).
- **Import nie kasuje danych:** domyślnie „Scal”; „Zaktualizuj plany z pliku” zastępuje tylko plany o tych samych nazwach. Zdjęcia dziennika są tylko w pełnej kopii `.json`.
- Dane nie opuszczają urządzenia bez działania użytkownika (pobranie lub udostępnienie pliku).

## 11. Planowane (uzgodnione kierunki, jeszcze niezrobione)
- Kolejne pełne przewodniki miast, np. Kraków albo Gdańsk; wybór należy do właściciela.
- Więcej potwierdzonych artykułów Wikipedii i opisów EN dla Warszawy.
- Szczegóły w `ROADMAP.md`.

## 12. Krasnale Wrocławia (polecenie właściciela 2026-11-09)
- Dodać rzeczywiste lokalizacje, opisy i pieczątki związane ze zbieraniem krasnali do istniejącej mapy.
- Krótkie opisy katalogowe na podstawie OSM są odrębne od długich historii 213 redakcyjnych atrakcji; nie dopisujemy zmyślonych historii figurek.
- Znalezienie potwierdza użytkownik ręcznie, tak jak inne pieczątki. Brak automatycznego śledzenia GPS. Postęp jest lokalny, odwracalny i uwzględniany w kopiach danych.

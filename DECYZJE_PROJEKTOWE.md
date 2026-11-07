# DECYZJE PROJEKTOWE — I Was Here / Places & Memories

Rejestr ustaleń właściciela (stan na 2026-11-07, wersja 8.5). To są **wiążące decyzje**. Nie zmieniaj ich bez wyraźnej prośby właściciela.
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

## 2. Logo (stan 8.5 — ostateczny wybór właściciela)
- **Lewy górny róg każdej strony:** pinezka z pejzażem (`assets/brand-pin-landscape.svg`: słońce, ośnieżone góry, las, rzeka) **po lewej stronie** napisu „PLACES & MEMORIES / I WAS HERE”.
  - Napis jest tekstem HTML: małe kapitaliki u góry, pochylone szeryfowe „I WAS HERE” pod spodem.
  - Logo **nie jest linkiem**, żeby nie dublować przycisku mapy.
- **Pływająca mapka Polski** (`assets/brand-mark.svg`, zielony kafelek ze złotą ramką, Polska z pejzażem, białą kropkowaną trasą i pomarańczową pinezką):
  - stoi **na środku u góry**, tuż pod nagłówkiem, i jest **zawsze widoczna**: przy przewijaniu, nad zakładkami i oknami;
  - **zawsze prowadzi do pełnej mapy Polski**. W Atlasie mapa płynnie oddala się bez przeładowania;
  - element `#atlasFloat.poland-fab` musi stać **poza** nagłówkiem z rozmyciem tła, bo inaczej nie pływa;
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

## 5. Nawigacja
- **Jedno dolne menu na każdej stronie** (`assets/app-nav.js`), zawsze w tej kolejności: **Mapa · Odkrywaj · Plany · Pieczątki · Profil** (EN: Map · Explore · Plans · Stamps · Profile).
  - **Mapa:** w Atlasie mapa; z regionu Atlas na tym samym województwie; z Warszawy Atlas.
  - **Odkrywaj:** w Atlasie otwiera wyszukiwarkę, bez dublowania listy z paska; w przewodnikach przewija do wyboru atrakcji.
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
- **Dziennik podróży:** notatki i **do 5 zdjęć** na miejsce, także z biblioteki zdjęć. Zapis jest **tylko lokalnie**, w IndexedDB `iwh_journal`; nic nie jest wysyłane.
  - Dostęp: przycisk „📝 Notatki i zdjęcia” w szczegółach atrakcji oraz lista w Pieczątkach.
- Klucze zapisu: `iwh_visited` (`city:<id>`, `region:<id>`, `town:<region>:<nazwa>`), `iwh_region_visited` (id miejsc), `odkryjWarszawe_1.visited` (Warszawa).

## 8. Plany i zwiedzanie
- Plany podróży (`iwh_trips`) i plany dnia (`iwh_days`): pozycje `{t:'city'|'region'|'town'|'place', …}`.
- **Podróż → plan dnia:** przycisk „🗓️ Dodaj do planu dnia” przy podróży.
- **Punkt z mapy regionu → plan:** „🗓️ Do planu dnia” i „🧳 Do podróży” w szczegółach miejsca.
- **Wycieczka piesza** jest w Warszawie, w przewodniku regionu (domyślna przy wejściu z miejscowości) i w planie dnia Atlasu.
- Wybór rodzajów atrakcji (ikonki kategorii) stoi **przed mapą** w regionie i w Warszawie.
- Czasy przejazdu to **szacunki**. Trasy prowadzą do Google Maps; nie ma routingu WTP na żywo.

## 9. Treści i dane
- Przy każdej atrakcji jest link „Więcej informacji o miejscu — Wikipedia”: potwierdzony artykuł (tag `wikidata` w OSM + Wikidata) albo uczciwe wyszukiwanie. Artykułów nie zgadujemy. Złe dopasowania są na liście `REJECT` w `tools/wiki_links.py`.
- Ocena 1–5 jest **redakcyjna**, a nie z Google. Nie ma kluczy API.

## 10. Planowane (uzgodnione kierunki, jeszcze niezrobione)
- Kopia zapasowa danych użytkownika (eksport/import planów, pieczątek i dziennika ze zdjęciami).
- Mapa przewodnika regionu offline (Leaflet lokalnie).
- Kolejne pełne przewodniki miast, np. Kraków albo Gdańsk; wybór należy do właściciela.
- Więcej potwierdzonych artykułów Wikipedii i opisów EN dla Warszawy.
- Szczegóły w `ROADMAP.md`.

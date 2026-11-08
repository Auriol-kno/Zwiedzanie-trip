# I Was Here 7.0 — nowa interaktywna mapa Polski (Atlas premium)
Data: 7 listopada 2026 r.

## Co nowego
- **Styl „Atlas” (domyślny)** według referencji `01_styl_kartograficzny` i `02_podglad_wojewodztw`:
  - granat Bałtyku (#092D3E/#061F2C), oliwkowy ląd (#68824B → #9EAF65), rzeki i jeziora #2E9AC4;
  - kremowe linie granic (#ECDCB5), bursztynowe pinezki (#F47C28/#FFB24A);
  - „płyta” kraju z ciepłą krawędzią i cieniem.
- **Prawdziwy relief terenu** z danych wysokościowych (cieniowanie + hipsometria): Sudety, Karpaty, Tatry, wyżyny, doliny rzek. To raster `assets/poland-relief.webp` (112 KB) w tej samej projekcji co wektory. Bez pliku mapa działa jako czytelna wersja 2D.
- **Granice 16 województw i kraju z Natural Earth 1:10m.** Ok. 2700 punktów województw i 870 punktów granicy (wcześniej 1:50m).
- **Rzeki i jeziora:** 20 rzek (Wisła, Odra, Warta, Bug, Narew, San, Pilica, Noteć…) i 20 jezior z prawdziwej geometrii.
- **Kraje sąsiednie** jako ciemne sylwetki.
- **Projekcja równoodległościowa z równoleżnikiem 52°N.** Skala W–E równa N–S, więc kształt kraju nie jest już rozciągnięty (wcześniej ok. +8% w poziomie).
- **13 dotychczasowych miast** bez zmian (te same nazwy i współrzędne WGS84). Test sprawdza, że każde leży w swoim województwie.

## Zoom i warstwy
- Granice województw są delikatne w widoku kraju i płynnie grubieją oraz wyraźnieją przy zbliżeniu (`--prov-w`, `--prov-o`).
- Nazwy województw (PL/EN) pojawiają się od ok. ×1,3, a miejscowości z bazy regionów od ok. ×2,3.
- Ilustracje miast na telefonie pojawiają się po przybliżeniu; na szerokim ekranie są widoczne od razu.
- **Warstwy** (zapamiętywane): granice, nazwy, relief, miejscowości, ilustracje.
- **Style:** Atlas, Jasny (dawny jasny atlas, koncepcja nr 1), Noc, Teren. Przełącznik „Atlas” pokazuje teraz docelową mapę.
- Podziałka w km liczona z prawdziwej skali projekcji, kompas, gesty: przesuwanie, pinch-zoom, kółko myszy.

## Miasta, karta i plany
- Pinezki mają stały rozmiar na ekranie i strefę dotyku 44 px.
- Status pinezki: **odwiedzone ✓** (zielona), **w planie ★** (bursztynowa), nieodwiedzone (pomarańczowa).
- Podpisy nie nachodzą na siebie ani na przyciski: przechodzą na drugą stronę pinezki, nad nią albo pod nią.
- **Karta (bottom sheet):** ilustracja miasta, opis, status, akcje „Zobacz”, „Plan podróży”, „Plan dnia”, „Byłem tu” i zamykanie ✕.
- Karta województwa pokazuje miejscowości i najlepsze miejsca z przyciskiem ＋ (do planu dnia).
- **Dodawanie do planu:** wybór istniejącego planu albo utworzenie nowego (nazwa, a dla planu dnia także data).
- **Zakładki:**
  - **Mapa Polski**;
  - **Plan podróży:** wiele planów, zmiana nazwy, usuwanie; widać też dotychczasowe zapisane wycieczki po Warszawie;
  - **Mój plan dnia:** data, godzina startu, kolejność ↑↓, szacunkowy harmonogram, trasa w Google Maps;
  - **Wspomnienia:** odwiedzone miasta i regiony, pieczątki regionów, paszport Warszawy;
  - **Profil:** język, styl, statystyki, dane i licencje.
- **Stały przycisk „Polska”** z zarysem kraju (prawy dół, nad panelem i poza safe area) animuje powrót do widoku całego kraju z każdego stanu.

## Dane i zapis
- localStorage:
  - `iwh_trips`, `iwh_days`, `iwh_visited`, `iwh_layers` — nowe;
  - `tubylem_lang`, `tubylem_map_style` — bez zmian; nowa wartość stylu `light`.
- Istniejące dane tylko odczytujemy, bez nadpisywania: `iwh_region_visited`, `odkryjWarszawe_1`, `tb_saved_trips`.
- Nazw planów użytkownika nie tłumaczymy. Etykiety miejsc z bazy są tłumaczone PL/EN.

## Źródła i licencje
| Dane | Źródło | Licencja |
|---|---|---|
| Granica Polski, 16 województw, kraje sąsiednie, rzeki, jeziora | Natural Earth 1:10m (admin-1, admin-0, rivers_lake_centerlines, rivers_europe, lakes, lakes_europe), repozytorium `nvkelso/natural-earth-vector`, wersja 5.2.0-pre | domena publiczna |
| Relief (wysokości) | Terrain Tiles (Mapzen / AWS Open Data, terrarium z8): SRTM, GMTED2010, ETOPO1, EU-DEM | domena publiczna; EU-DEM © Copernicus (atrybucja na mapie i w Profilu) |

Dane generuje `python tools/build_geography.py --cache <katalog>` (wymaga `shapely`, `numpy`, `Pillow`). Pobrane pliki trafiają tylko do katalogu cache. W repozytorium są wyłącznie wyniki: `assets/poland-geography.js` i `assets/poland-relief.webp`. Uproszczenie Douglasa–Peuckera wynosi 0,0025° (ok. 200–280 m).

## Renderowanie
- SVG (bez bibliotek mapowych, bez kluczy API, działa offline na GitHub Pages).
- Raster reliefu jest przycięty `clipPath` do granicy kraju.
- Linie mają `vector-effect: non-scaling-stroke`, więc grubość zależy od zmiennych CSS, a nie od skali.
- Pinezki i podpisy mają stały rozmiar w pikselach.
- Efekt 3D uzyskują tanie warstwy (przesunięta „płyta” i gradient światła) zamiast filtrów liczonych przy każdym ruchu.

## Testy
- `tools/test_atlas.py`: źródła, projekcja bez rozciągania, liczba punktów granic, 13 miast w swoich województwach, relief WebP < 400 KB, cache offline, elementy interfejsu i klucze zapisu.
- `tools/test_browser.js` (Chromium, iPhone 13), m.in.:
  - grubienie granic i nazwy województw przy zoomie;
  - przełączanie warstw i stylów z zapamiętaniem;
  - karta miasta, dodanie do planu podróży i planu dnia, status „Byłem tu” po odświeżeniu strony;
  - zakładki;
  - brak polskich fragmentów w wersji EN;
  - dotychczasowe ścieżki Atlas ⇄ Warszawa ⇄ region.

## Ograniczenia
- Nie testowano na fizycznym iPhonie (Safari/PWA). Sprawdzono w Chromium z emulacją iPhone 13, iPhone SE i na ekranie 1280 px.
- Lasy i ilustracje miast są dekoracyjne (nie są mapą pokrycia terenu). Nie przesuwają pinezek ani granic.
- Opisy 13 miast to krótkie, redakcyjne zdania o powszechnie znanych faktach. Szczegółowe przewodniki ma tylko Warszawa i województwo świętokrzyskie.

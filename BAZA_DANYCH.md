# BAZA DANYCH — propozycja dla setek obiektów, zdjęć i restauracji

Propozycja z 2026-11-08, wersja 8.6. **Wymaga decyzji właściciela przy etapie 2** (konto w usłudze zewnętrznej, koszty, prywatność).
Etap 1 jest już częściowo wdrożony w 8.6: dane dzielone na pliki, wczytywane dynamicznie.

---

## 1. Skąd potrzeba zmiany
Dziś cała baza regionów (`data/regiony.json`, 213 miejsc) trafia do przeglądarki jako jeden plik `regiony.js`, ładowany na każdej stronie. Warszawa ma osobny plik `atrakcje.js` (184 atrakcje) i `restauracje.js` (36 lokali).

Plan rozwoju to setki, a docelowo tysiące obiektów:
- długie historie (≥10 zdań PL i EN);
- fotografie z licencjami;
- restauracje i noclegi;
- szlaki tematyczne;
- godziny otwarcia i ceny.

Przy jednym pliku każda nowa historia spowalnia start aplikacji na iPhonie. Do tego edycja jednego dużego JSON-a przez kilka osób lub agentów kończy się konfliktami.

## 2. Wymagania
1. **Szybki start na telefonie:** pobieramy tylko to, co jest potrzebne na danym ekranie.
2. **Offline:** raz obejrzany region działa bez internetu (PWA).
3. **Segregacja:** województwo → miejscowość / miasto → obiekt; typy obiektów: atrakcja, restauracja, nocleg, punkt szlaku.
4. **Dwujęzyczność** PL/EN w każdym polu tekstowym.
5. **Źródła i licencje:**
   - każde zdjęcie ma autora, licencję i źródło;
   - każda historia ma status redakcyjny;
   - współrzędne mają status (`osm` / `orientacyjne`).
6. **Brak kluczy API w kodzie publicznym.** Dane użytkownika (pieczątki, dziennik) zostają na urządzeniu.
7. **Wygodna edycja:** formularze dla redaktorów, a nie ręczna edycja JSON-a, gdy obiektów będą setki.

## 3. Rekomendacja: model „static-first” w dwóch etapach

### Etap 1 — baza w repozytorium, podzielona na pliki (8.6–8.9, bez kosztów)
**Źródło prawdy** to pliki JSON w repozytorium, z walidacją w `tools/sync_database.py` i CI.
Aplikacja pobiera je przez `fetch` dopiero wtedy, gdy są potrzebne. Service worker zapisuje je w pamięci podręcznej, więc działają offline.

```
data/
  index/places.json           lekki indeks wszystkich obiektów: id, typ, nazwa PL/EN, region, miejscowość, lat/lon, kategorie, ikona
  regiony/<region>.json       pełne dane obiektów województwa (opis, czas, ocena, OSM, Wikipedia, godziny)
  historia/<region>.json      długie historie ≥10 zdań PL/EN            ← wdrożone w 8.6 (Małopolskie, Śląskie)
  szlaki.json                 motywy i szlaki tematyczne                 ← wdrożone w 8.6 (14 motywów, 30 szlaków)
  gastronomia/<region>.json   restauracje, kawiarnie (typ, kuchnia, ceny, adres, źródło)
  media/<region>.json         metadane zdjęć: plik, autor, licencja, źródło (np. Wikimedia Commons)
img/<region>/<id>-<n>.webp    miniatury 480 px i zdjęcia 1280 px (WebP), tylko z wolną licencją
```

Zasady etapu 1:
- **Mapa Atlasu** ładuje tylko lekki indeks (kilkadziesiąt KB nawet dla tysięcy obiektów).
- **Przewodnik regionu** ładuje plik swojego województwa, a historię dopiero po otwarciu szczegółów miejsca.
- **Zdjęcia:** w repozytorium tylko zoptymalizowane WebP z licencją CC/PD (Wikimedia Commons) albo własne zdjęcia właściciela. Pełne rozdzielczości zostają w źródle i podajemy do nich link.
- **Walidacja w CI:**
  - unikalne ID;
  - PL i EN obecne;
  - ≥10 zdań historii;
  - poprawne odwołania szlaków;
  - licencja przy każdym zdjęciu.
- **Limit GitHub Pages** (repozytorium do ok. 1 GB, plik do 100 MB) wystarcza na kilka tysięcy miniatur WebP.

Koszt: 0 zł. Działa z obecną architekturą (statyczny PWA) i nie wymaga logowania ani backendu.

### Etap 2 — baza w chmurze z panelem redakcyjnym (10.x, decyzja właściciela)
Gdy obiektów będą tysiące, a treści będzie dodawać kilka osób, proponuję **PostgreSQL z PostGIS w Supabase**. Wybór uzasadniają:
- zapytania geograficzne, np. „atrakcje w promieniu 5 km”;
- przechowywanie zdjęć (Supabase Storage + CDN);
- automatyczne API REST;
- uprawnienia na poziomie wierszy (RLS): publiczne tylko czytanie, edycja tylko redaktorzy;
- panel do edycji danych bez programowania.

Alternatywy:
- **Directus** (darmowy, open source) jako wygodniejszy panel redakcyjny nad tym samym PostgreSQL;
- **Firebase**: prosty, ale słabszy w zapytaniach geograficznych i relacjach.

Ważne: aplikacja **nadal działa statycznie**. Co noc skrypt eksportuje bazę do plików z etapu 1 i publikuje je na GitHub Pages. Dzięki temu:
- działa offline, a telefon nie zależy od dostępności serwera;
- zapytania do bazy wykonuje tylko eksport;
- dane użytkownika nadal nie opuszczają urządzenia. Synchronizacja kont to osobna decyzja (ROADMAP, etap E).

### Schemat danych (wspólny dla obu etapów)
| Tabela | Najważniejsze pola |
|---|---|
| `regions` | id, nazwa PL/EN, geometria (z Natural Earth), status przewodnika |
| `localities` | id, region_id, nazwa, typ (miasto / wieś / dzielnica), lat/lon |
| `places` | id, locality_id, **kind** (atrakcja / restauracja / nocleg / punkt), nazwa PL/EN, kategorie[], lat/lon, coordinate_status, osm_id, wikidata_qid, czas zwiedzania, ocena redakcyjna 1–5, url |
| `place_texts` | place_id, lang, krótki opis, **historia** (akapity), legenda (oznaczona jako legenda), status redakcyjny, data przeglądu |
| `media` | id, place_id, plik, szerokość, autor, licencja, źródło_url, podpis PL/EN, kolejność |
| `opening_hours` | place_id, reguła (format OSM `opening_hours`), sezon, źródło, data sprawdzenia |
| `food` | place_id, kuchnia[], przedział cen 1–4, wegetariańskie / bezglutenowe, wybór redakcji (bez ocen Google) |
| `themes` | id, ikona, kolor, nazwa i opis PL/EN |
| `routes` | id, theme_id, nazwa i wstęp PL/EN, tryb (pieszo / samochód), szacowany czas |
| `route_stops` | route_id, kolejność, place_id lub city_id, notatka PL/EN |
| `sources` | id, place_id, typ (OSM / Wikipedia / strona obiektu / książka), url, data dostępu |

Dzięki polu `kind` restauracje, noclegi i atrakcje dzielą jedną mapę, wyszukiwarkę, plany i pieczątki, a filtry rozdzielają je w interfejsie.

## 4. Plan wdrożenia
1. **8.6 (zrobione):**
   - historie i szlaki jako osobne pliki wczytywane dynamicznie;
   - walidacja w `sync_database.py`;
   - cache w service workerze.
2. **8.6.1 (zrobione):** lekki indeks `data/index/places.json` (397 obiektów, regiony + Warszawa, pole rodzaju) generowany przez `sync_database.py`; korzystają z niego Pieczątki na każdej stronie.
3. **8.7:**
   - Atlas korzysta z indeksu `data/index/places.json` zamiast pełnego `regiony.js`;
   - podział `regiony.json` na pliki województw;
   - Warszawa w tym samym formacie, `kind: atrakcja`.
4. **8.8:**
   - `media/` i pierwsze zdjęcia z Wikimedia Commons (automatycznie przez Wikidata, z licencją);
   - galeria w szczegółach miejsca.
5. **8.9:** `gastronomia/` dla miast regionów, w formacie Warszawy, bez ocen Google.
6. **10.x (decyzja właściciela):** Supabase/PostgreSQL + panel redakcyjny + nocny eksport do plików statycznych.

## 5. Historie miejsc — zasady redakcyjne
- **Długość:** min. 10 zdań w PL i w EN, w 3–5 akapitach. Automatycznie sprawdza to `sync_database.py`.
- **Tylko utrwalone fakty:** daty, fundatorzy, przebudowy, wydarzenia, wpisy UNESCO i Pomniki Historii.
- **Legendy** zawsze z oznaczeniem („według legendy”, „podanie głosi”).
- **Niepewne liczby** podajemy jako przybliżone („około”, „ponad”) albo pomijamy.
- **Status `redakcyjne`** i nota o źródłach w każdym pliku. Przy przeglądzie można dopisać listę źródeł i zmienić status na `zweryfikowane`.
- **Pokrycie:** 8.6 — 30 miejsc (Małopolskie i Śląskie, w tym cały Szlak Orlich Gniazd); 8.6.1 — +65 (Pomorskie, Dolnośląskie, Świętokrzyskie); razem 95 z 213.
- **Kolejne partie:** po 2–3 województwa na PR. Kolejność (zaakceptowana): Pomorskie ✓, Dolnośląskie ✓, Świętokrzyskie ✓, Warmińsko-Mazurskie, potem pozostałe i Warszawa (`story` → historia ≥10 zdań).

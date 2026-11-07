# CHANGELOG — I Was Here / Places & Memories

Historia zmian odtworzona z `git log` gałęzi `main` i Pull Requestów #1–#9.
Najnowsze na górze. Daty w formacie RRRR-MM-DD. Numery wersji są zgodne z plikami
dokumentacji (`ATLAS_*.md`, `REGIONY_*.md`) i kluczem cache w `service-worker.js`.

Zasada: każda zmiana scalana do `main` dopisuje tu wpis (wersja, data, PR, co się zmieniło,
znane ograniczenia). Aktualny klucz cache PWA: `i-was-here-v8-2-20261107`.

---

## [Nieopublikowane] — dokumentacja długoterminowa
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

# I Was Here 8.0 — przewodniki wszystkich 16 województw
Data: 7 listopada 2026 r.

## Co nowego
- Każde z **16 województw** ma przewodnik regionu (`region.html?region=…`). W bazie jest **198 miejsc** (wcześniej 39). Najbardziej znane atrakcje są pogrupowane według miejscowości, z kategoriami, czasem zwiedzania i oceną redakcyjną 1–5.
- **Każde z 13 miast Atlasu** ma atrakcje w przewodniku swojego województwa. Karta miasta w Atlasie ma przycisk **„Zwiedzaj <miasto>”**, który otwiera przewodnik regionu od razu dla tego miasta (np. Kraków → Wawel, Rynek, Mariacki, Kazimierz, Fabryka Schindlera). Warszawa nadal ma pełny przewodnik miejski.
- Na mapie Polski, przy dużym zbliżeniu, widać miejscowości ze wszystkich województw.
- Miejscowość o nazwie miasta z Atlasu nie dubluje pinezki. W widoku kraju jest pinezka miasta, w widoku województwa pinezka miejscowości z liczbą atrakcji.
- Podpisy miast mają pierwszeństwo przed podpisami miejscowości i nie nachodzą na siebie.
- Mazowieckie pozostaje „częściowo dostępne” (Warszawa i 8 miejsc w regionie).

## Liczba miejsc
| Województwo | Miejsca | Główne miejscowości |
|---|---|---|
| Dolnośląskie | 12 | Wrocław, Karpacz, Krzeszów, Kłodzko, Świdnica, Wałbrzych |
| Kujawsko-pomorskie | 12 | Toruń, Bydgoszcz, Biskupin, Ciechocinek, Tuchola, Golub-Dobrzyń |
| Lubelskie | 11 | Lublin, Kazimierz Dolny, Kozłówka, Nałęczów, Zwierzyniec, Chełm |
| Lubuskie | 9 | Zielona Góra, Świebodzin, Pniewo, Łęknica, Łagów, Ochla |
| Mazowieckie | 8 | Płock, Żelazowa Wola, Kampinos, Sierpc, Ciechanów, Czersk |
| Małopolskie | 13 | Kraków, Tatry, Wieliczka, Sromowce Wyżne, Zakopane, Ojców |
| Opolskie | 9 | Opole, Góra Świętej Anny, Moszna, Krasiejów, Brzeg, Paczków |
| Podkarpackie | 11 | Sanok, Haczów, Bóbrka, Baranów Sandomierski, Ustrzyki Górne, Przemyśl |
| Podlaskie | 11 | Białowieża, Białystok, Kruszyniany, Augustów, Grabarka, Tykocin |
| Pomorskie | 13 | Gdańsk, Pelplin, Hel, Łeba, Szymbark, Sopot |
| Warmińsko-mazurskie | 12 | Olsztyn, Mikołajki, Święta Lipka, Frombork, Krutyń, Olsztynek |
| Wielkopolskie | 12 | Poznań, Mosina, Dziekanowice, Rogalin, Gniezno, Kalisz |
| Zachodniopomorskie | 11 | Szczecin, Międzyzdroje, Świnoujście, Stargard, Kamień Pomorski, Darłowo |
| Łódzkie | 12 | Łódź, Łowicz, Arkadia, Łęczyca, Nieborów, Piotrków Trybunalski |
| Śląskie | 11 | Katowice, Pszczyna, Cieszyn, Gliwice, Tarnowskie Góry, Częstochowa |
| Świętokrzyskie | 31 | Sandomierz, Kielce, Chęciny, Nowa Słupia, Wiślica, Bałtów |

## Uczciwość danych
- To **redakcyjna selekcja** powszechnie znanych miejsc, a opisy PL/EN to krótkie, fakty.
- **Współrzędne są orientacyjne.** Wpisano je redakcyjnie, bez geokodowania, bo serwisy Nominatim i Photon były niedostępne z sieci środowiska roboczego.
- Test sprawdza, że każdy punkt leży w swoim województwie według granic Natural Earth 1:10m (tolerancja 3 km na uproszczenie granic). 193 ze 198 punktów leży w granicach, a pozostałe 5 jest 0,1–1,2 km od krawędzi (szczyt Śnieżki na granicy państwa oraz punkty na linii brzegu morskiego lub Wisły).
- Linki do stron obiektów są podane tylko tam, gdzie adres był pewny (m.in. Wawel, Kopalnia Soli „Wieliczka”, Auschwitz-Birkenau, Zamek w Malborku). W pozostałych przypadkach jest wyszukiwanie w Google Maps.
- Godziny otwarcia i ceny trzeba sprawdzać u organizatora. Ocena 1–5 nie pochodzi z Google.

## Dalszy rozwój
- Weryfikacja współrzędnych geokoderem lub na miejscu; status `zweryfikowane` nadawać dopiero po sprawdzeniu.
- Rozszerzenie Mazowieckiego i dłuższe opisy EN dla Warszawy.

## Aktualizacja 8.1 — weryfikacja położenia w OpenStreetMap
- Narzędzie `tools/verify_coordinates.py` wyszukuje każde miejsce w **Nominatim** (OpenStreetMap). Działa w tempie 1 zapytania na 2,5 s, z pamięcią podręczną i ponawianiem przy 429.
- Wynik jest przyjmowany tylko wtedy, gdy obiekt leży w **tym samym województwie**, jego **nazwa się zgadza** (odpornie na odmianę, bez liczenia nazwy miejscowości) i jest **≤ 12 km** od dotychczasowego punktu.
- **160 ze 198 miejsc** ma teraz `coordinateStatus: "osm"` oraz identyfikator obiektu OSM (`osm.type`, `osm.id`).
- Największe poprawki: Grabarka 8,9 km, Krzyżtopór 6,6 km, Kozłówka 5,4 km, start spływu Dunajcem 5,3 km, Muzeum Sienkiewicza 5,1 km, MRU 4,8 km, skansen w Sierpcu 3,5 km, Jaskinia Raj 2,8 km.
- **38 miejsc zostaje „orientacyjnych”:**
  - 18 to rozległe obiekty i ulice (parki narodowe, Kanał Augustowski, Morskie Oko, Śnieżka, ul. Piotrkowska). Ich punkt wskazuje miejsce zwiedzania, a nie środek obszaru czy siedzibę dyrekcji, więc nie jest przesuwany;
  - dla 20 Nominatim nie dał pewnego trafienia (lista: `python tools/verify_coordinates.py --cache …`).
- Przewodnik regionu pokazuje przy zweryfikowanym miejscu: „Położenie według OpenStreetMap (© współtwórcy OpenStreetMap, ODbL)”. Atrybucja jest też w stopce i w Profilu Atlasu.
